import { type FilterQuery, type RequiredEntityData, raw } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import dayjs from "dayjs";

import { Invitation } from "@/common/entities/invitations.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { EInvitationStatus } from "./invitations.enums";
import { normalizeInvitationEmail } from "./invitations.helpers";
import type {
  ICreateOrganizationInvitationData,
  ICreateSystemInvitationData,
} from "./invitations.interfaces";

export class InvitationsRepository extends CustomSQLBaseRepository<Invitation> {
  private buildEmailWhere(email: string): Record<PropertyKey, unknown> {
    return {
      [raw((alias) => `lower(${alias}.email)`)]: normalizeInvitationEmail(email),
    };
  }

  findById(id: string, em?: EntityManager): Promise<Invitation | null> {
    return this.getScopedRepository(em).findOne({ id }, { populate: ["organization", "inviter"] });
  }

  findByIdForActor(
    {
      id,
      organizationId,
      includeAllOrganizations = false,
    }: {
      id: string;
      organizationId?: string;
      includeAllOrganizations?: boolean;
    },
    em?: EntityManager,
  ): Promise<Invitation | null> {
    const where: Record<string, unknown> = { id };

    if (organizationId) {
      where.organization = { id: organizationId };
    } else if (!includeAllOrganizations) {
      where.organization = null;
    }

    return this.getScopedRepository(em).findOne(where as FilterQuery<Invitation>, {
      populate: ["organization", "inviter"],
    });
  }

  findByIdOrFail(id: string, em?: EntityManager): Promise<Invitation> {
    return this.getScopedRepository(em).findOneOrFail(
      { id },
      { populate: ["organization", "inviter"] },
    );
  }

  findPendingByEmail(
    email: string,
    organizationId?: string,
    ignoreOrgScope = false,
    em?: EntityManager,
  ): Promise<Invitation | null> {
    const where: Record<PropertyKey, unknown> = {
      ...this.buildEmailWhere(email),
      status: EInvitationStatus.PENDING,
    };

    if (!ignoreOrgScope) {
      if (organizationId) {
        where.organization = { id: organizationId };
      } else {
        where.organization = null;
      }
    }

    return this.getScopedRepository(em).findOne(where as FilterQuery<Invitation>, {
      populate: ["organization", "inviter"],
    });
  }

  findAllPendingByEmail(email: string, em?: EntityManager): Promise<Invitation[]> {
    return this.getScopedRepository(em).find(
      {
        ...this.buildEmailWhere(email),
        status: EInvitationStatus.PENDING,
        expiresAt: { $gt: dayjs().toDate() },
      } as FilterQuery<Invitation>,
      {
        populate: ["organization", "inviter"],
        orderBy: { createdAt: "DESC" },
      },
    );
  }

  async findAllPaginated(
    {
      page = 1,
      limit = 10,
      organizationId,
      status,
      includeAllOrganizations = false,
    }: {
      page?: number;
      limit?: number;
      organizationId?: string;
      status?: string;
      includeAllOrganizations?: boolean;
    },
    em?: EntityManager,
  ): Promise<{ invitations: Invitation[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (organizationId) {
      where.organization = { id: organizationId };
    } else if (!includeAllOrganizations) {
      where.organization = null;
    }

    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;
    const [invitations, total] = await this.getScopedRepository(em).findAndCount(
      where as FilterQuery<Invitation>,
      {
        populate: ["organization", "inviter"],
        orderBy: { createdAt: "DESC" },
        limit,
        offset,
      },
    );

    return { invitations, total };
  }

  createSystemInvitation(data: ICreateSystemInvitationData, em?: EntityManager): Invitation {
    const invitation = this.createInvitation(
      {
        email: normalizeInvitationEmail(data.email),
        role: data.role,
        status: EInvitationStatus.PENDING,
        expiresAt: data.expiresAt,
        inviter: data.inviterId,
        organization: null,
        token: data.token,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
      },
      em,
    );
    this.persist(invitation, em);
    return invitation;
  }

  createOrganizationInvitation(
    data: ICreateOrganizationInvitationData,
    em?: EntityManager,
  ): Invitation {
    const invitation = this.createInvitation(
      {
        email: normalizeInvitationEmail(data.email),
        role: data.role,
        status: EInvitationStatus.PENDING,
        expiresAt: data.expiresAt,
        inviter: data.inviterId,
        organization: data.organizationId,
        token: null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
      },
      em,
    );
    this.persist(invitation, em);
    return invitation;
  }

  findByToken(token: string, em?: EntityManager): Promise<Invitation | null> {
    return this.getScopedRepository(em).findOne(
      { token, status: EInvitationStatus.PENDING },
      { populate: ["inviter"] },
    );
  }

  async updateStatus(id: string, status: string, em?: EntityManager): Promise<Invitation | null> {
    const invitation = await this.getScopedRepository(em).findOne({ id });
    if (invitation) {
      invitation.status = status as Invitation["status"];
    }
    return invitation;
  }

  private createInvitation(data: RequiredEntityData<Invitation>, em?: EntityManager): Invitation {
    return this.getScopedRepository(em).create(data);
  }
}
