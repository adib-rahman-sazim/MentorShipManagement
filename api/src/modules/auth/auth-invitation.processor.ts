import { Injectable } from "@nestjs/common";

import { type FilterQuery, raw } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import { APIError } from "better-auth/api";
import dayjs from "dayjs";

import { Invitation } from "@/common/entities/invitations.entity";
import { Role } from "@/common/entities/roles.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { EInvitationStatus } from "@/modules/invitations/invitations.enums";
import {
  areInvitationEmailsEqual,
  isSystemLevelRole,
  normalizeInvitationEmail,
} from "@/modules/invitations/invitations.helpers";
import { isOrganizationBoundRole } from "@/modules/permissions/permissions.role-priority.helpers";

import { AUTH_INVITATION_ERROR_MESSAGES, AUTH_INVITATION_TOKEN_HEADER } from "./auth.constants";
import type { IFinalizeUserSignupContext } from "./auth.interfaces";

@Injectable()
export class AuthInvitationProcessor {
  async findValidSystemInvitationByToken(
    em: EntityManager,
    invitationToken: string,
  ): Promise<Invitation | null> {
    const invitationsRepository = em.getRepository(Invitation);
    const invitation = await invitationsRepository.findOne(
      {
        token: invitationToken,
        status: EInvitationStatus.PENDING,
        organization: null,
      },
      { populate: ["inviter"] },
    );

    if (!invitation || dayjs(invitation.expiresAt).isBefore(dayjs())) {
      return null;
    }

    if (!isSystemLevelRole(invitation.role)) {
      return null;
    }

    return invitation;
  }

  async findPendingInvitationByEmail(
    em: EntityManager,
    email: string,
    options: {
      organizationId?: string | null;
      role?: EUserRole;
    } = {},
  ): Promise<Invitation | null> {
    const where: Record<PropertyKey, unknown> = {
      ...this.buildNormalizedInvitationEmailWhere(email),
      status: EInvitationStatus.PENDING,
    };

    if ("organizationId" in options) {
      where.organization = options.organizationId ? { id: options.organizationId } : null;
    }

    if (options.role) {
      where.role = options.role;
    }

    const invitationsRepository = em.getRepository(Invitation);
    return invitationsRepository.findOne(where as FilterQuery<Invitation>, {
      populate: ["inviter", "organization"],
    });
  }

  getInvitationProofFromHeaders(headers: Headers | null | undefined): string | undefined {
    return this.parseRawInvitationProof(headers?.get(AUTH_INVITATION_TOKEN_HEADER));
  }

  async assignRoleToUser(
    em: EntityManager,
    userId: string,
    role: EUserRole,
    organizationId: string | null = null,
  ): Promise<void> {
    const isProvisionalCustomer = role === EUserRole.CUSTOMER && !organizationId;

    if (isOrganizationBoundRole(role) && !organizationId && !isProvisionalCustomer) {
      throw new APIError("BAD_REQUEST", {
        message: AUTH_INVITATION_ERROR_MESSAGES.ORGANIZATION_REQUIRED_FOR_ORG_BOUND_ROLES,
      });
    }

    if (isSystemLevelRole(role) && organizationId) {
      throw new APIError("BAD_REQUEST", {
        message: AUTH_INVITATION_ERROR_MESSAGES.ORGANIZATION_NOT_ALLOWED_FOR_SYSTEM_ROLES,
      });
    }

    if (isSystemLevelRole(role) || (role === EUserRole.CUSTOMER && organizationId)) {
      await this.removeProvisionalCustomerRole(em, userId);
    }

    const rolesRepository = em.getRepository(Role);
    const userRolesRepository = em.getRepository(UserRole);
    const roleEntity = await rolesRepository.findOne({ slug: role });
    if (!roleEntity) {
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: AUTH_INVITATION_ERROR_MESSAGES.ROLE_NOT_FOUND(role),
      });
    }

    const existing = await userRolesRepository.findOne({
      user: { id: userId },
      role: { id: roleEntity.id },
      organization: organizationId ? { id: organizationId } : null,
    });
    if (existing) {
      return;
    }

    const userRole = userRolesRepository.create({
      user: userId,
      role: roleEntity,
      organization: organizationId,
    });
    userRolesRepository.persist(userRole, em);
  }

  async removeProvisionalCustomerRole(em: EntityManager, userId: string): Promise<void> {
    const userRolesRepository = em.getRepository(UserRole);
    const provisionalRoles = await userRolesRepository.find(
      {
        user: { id: userId },
        organization: null,
        role: { slug: EUserRole.CUSTOMER },
      },
      { populate: ["role"] },
    );

    provisionalRoles.forEach((row) => userRolesRepository.remove(row, em));
  }

  backfillUserNameFromInvitation(user: User, invitation: Invitation): void {
    let hasNameBackfilled = false;

    if (invitation.firstName && (!user.firstName || user.firstName.trim() === "")) {
      user.firstName = invitation.firstName;
      hasNameBackfilled = true;
    }

    if (invitation.lastName && (!user.lastName || user.lastName.trim() === "")) {
      user.lastName = invitation.lastName;
      hasNameBackfilled = true;
    }

    if (hasNameBackfilled) {
      user.name = `${user.firstName} ${user.lastName}`.trim();
    }
  }

  async finalizeUserSignup(em: EntityManager, context: IFinalizeUserSignupContext): Promise<void> {
    const {
      userId,
      targetRole,
      invitation,
      organizationId = null,
      consumeInvitation = true,
    } = context;

    const usersRepository = em.getRepository(User);
    const dbUser = await usersRepository.findOne({ id: userId });
    if (!dbUser) {
      return;
    }

    const effectiveRole = (invitation?.role as EUserRole | undefined) || targetRole;
    const roleOrganizationId = isOrganizationBoundRole(effectiveRole) ? organizationId : null;

    await this.assignRoleToUser(em, userId, effectiveRole, roleOrganizationId);

    if (invitation) {
      if (consumeInvitation) {
        invitation.status = EInvitationStatus.ACCEPTED;
      }

      dbUser.state = EUserState.ACTIVE;
      if (!dbUser.firstLoginAt) {
        dbUser.firstLoginAt = dayjs().toDate();
      }

      this.backfillUserNameFromInvitation(dbUser, invitation);
    } else if (effectiveRole === EUserRole.CUSTOMER && !roleOrganizationId) {
      dbUser.state = EUserState.NOT_ONBOARDED;
    } else {
      dbUser.state = EUserState.ACTIVE;
    }

    await usersRepository.flush(em);
  }

  async validateSystemInvitationProofForSignup(
    em: EntityManager,
    invitationToken: string,
    email: string,
  ): Promise<Invitation> {
    const invitation = await this.findValidSystemInvitationByToken(em, invitationToken);

    if (!invitation) {
      throw new APIError("FORBIDDEN", {
        message: AUTH_INVITATION_ERROR_MESSAGES.INVALID_SYSTEM_ROLE_INVITATION,
      });
    }

    if (!areInvitationEmailsEqual(invitation.email, email)) {
      throw new APIError("FORBIDDEN", {
        message: AUTH_INVITATION_ERROR_MESSAGES.INVITED_EMAIL_MISMATCH,
      });
    }

    return invitation;
  }

  private buildNormalizedInvitationEmailWhere(email: string): Record<PropertyKey, unknown> {
    return {
      [raw((alias) => `lower(${alias}.email)`)]: normalizeInvitationEmail(email),
    };
  }

  private parseRawInvitationProof(rawValue: unknown): string | undefined {
    return typeof rawValue === "string" && rawValue.trim() ? rawValue : undefined;
  }
}
