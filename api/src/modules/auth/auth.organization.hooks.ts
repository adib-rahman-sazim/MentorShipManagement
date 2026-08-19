import { Injectable } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import { APIError } from "better-auth/api";
import dayjs from "dayjs";

import { Member } from "@/common/entities/members.entity";
import { Organization } from "@/common/entities/organizations.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { EInvitationStatus } from "@/modules/invitations/invitations.enums";

import { AUTH_MEMBER_ERROR_MESSAGES } from "./auth.constants";
import { AuthInvitationProcessor } from "./auth-invitation.processor";

@Injectable()
export class AuthOrganizationHooks {
  constructor(private readonly authInvitationProcessor: AuthInvitationProcessor) {}

  createMemberCreateBeforeHook() {
    return (member: Record<string, unknown>): { data: Record<string, unknown> } => {
      const { _role, ...memberData } = member;
      const rawRole = typeof member.role === "string" ? member.role : _role;
      const normalizedRole = typeof rawRole === "string" ? rawRole.toLowerCase().trim() : null;
      const role = normalizedRole && this.isValidUserRole(normalizedRole) ? normalizedRole : null;

      if (role !== EUserRole.CUSTOMER) {
        throw new APIError("FORBIDDEN", {
          message: AUTH_MEMBER_ERROR_MESSAGES.ONLY_CUSTOMERS_IN_ORGANIZATION,
        });
      }

      return {
        data: {
          ...memberData,
          role,
        },
      };
    };
  }

  createMemberCreateAfterHook(em: EntityManager) {
    return async (member: Member): Promise<void> => {
      const forkedEm = em.fork();
      const userId = member.user?.id;
      const organizationId = member.organization?.id;

      if (!userId || !organizationId) {
        return;
      }

      const usersRepository = forkedEm.getRepository(User);
      const user = await usersRepository.findOne({ id: userId });
      if (!user) {
        return;
      }

      const invitation = await this.authInvitationProcessor.findPendingInvitationByEmail(
        forkedEm,
        user.email,
        {
          organizationId,
        },
      );

      member.role = EUserRole.CUSTOMER;
      await this.authInvitationProcessor.assignRoleToUser(
        forkedEm,
        user.id,
        EUserRole.CUSTOMER,
        organizationId,
      );

      if (invitation) {
        invitation.status = EInvitationStatus.ACCEPTED;
      }

      if (user.state !== EUserState.ACTIVE) {
        user.state = EUserState.ACTIVE;
        if (!user.firstLoginAt) {
          user.firstLoginAt = dayjs().toDate();
        }
      }

      await forkedEm.flush();
    };
  }

  createAfterAcceptInvitationHook(em: EntityManager) {
    return async (data: {
      invitation: { role?: string | null };
      member: { id?: string; role?: string | null };
      user: { id: string; state?: string | null };
      organization: { id: string };
    }): Promise<void> => {
      const forkedEm = em.fork();
      const userId = data.user.id;
      const organizationId = data.organization.id;
      const usersRepository = forkedEm.getRepository(User);
      const membersRepository = forkedEm.getRepository(Member);
      const user = await usersRepository.findOne({ id: userId });

      if (!user) {
        return;
      }

      await this.authInvitationProcessor.assignRoleToUser(
        forkedEm,
        userId,
        EUserRole.CUSTOMER,
        organizationId,
      );

      const memberId = data.member.id;
      if (memberId) {
        const member = await membersRepository.findOne({ id: memberId });
        if (member) {
          member.role = EUserRole.CUSTOMER;
        }
      }

      if (user.state !== EUserState.ACTIVE) {
        user.state = EUserState.ACTIVE;
        if (!user.firstLoginAt) {
          user.firstLoginAt = dayjs().toDate();
        }
      }

      await forkedEm.flush();
    };
  }

  createAfterCreateOrganizationHook(em: EntityManager) {
    return async (data: {
      organization: { id: string };
      member: { id?: string };
      user: { id: string };
    }): Promise<void> => {
      const forkedEm = em.fork();
      const organizationsRepository = forkedEm.getRepository(Organization);
      const usersRepository = forkedEm.getRepository(User);
      const membersRepository = forkedEm.getRepository(Member);
      const organization = await organizationsRepository.findOne({ id: data.organization.id });
      const user = await usersRepository.findOne({ id: data.user.id });

      if (!organization || !user) {
        return;
      }

      organization.createdBy = user;

      if (data.member.id) {
        const member = await membersRepository.findOne({ id: data.member.id });
        if (member) {
          member.role = EUserRole.CUSTOMER;
        }
      }

      await this.authInvitationProcessor.assignRoleToUser(
        forkedEm,
        user.id,
        EUserRole.CUSTOMER,
        organization.id,
      );
      await forkedEm.flush();

      if (user.state !== EUserState.ACTIVE) {
        user.state = EUserState.ACTIVE;
        if (!user.firstLoginAt) {
          user.firstLoginAt = dayjs().toDate();
        }
        await forkedEm.flush();
      }
    };
  }

  async canUserCreateOrganization(em: EntityManager, userId: string): Promise<boolean> {
    const userRolesRepository = em.getRepository(UserRole);
    const userRoles = await userRolesRepository.find(
      { user: { id: userId } },
      { populate: ["role"] },
    );

    return userRoles.some((userRole) => {
      const slug = userRole.role.slug as EUserRole;
      return slug === EUserRole.SUPER_ADMIN || slug === EUserRole.CUSTOMER;
    });
  }

  private isValidUserRole(value: string): value is EUserRole {
    return Object.values(EUserRole).includes(value as EUserRole);
  }
}
