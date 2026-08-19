import type { RequiredEntityData } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import { Member } from "@/common/entities/members.entity";
import type { EUserRole } from "@/common/enums/roles.enums";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class MembersRepository extends CustomSQLBaseRepository<Member> {
  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
    em?: EntityManager,
  ): Promise<Member | null> {
    return this.getScopedRepository(em).findOne(
      {
        user: { id: userId },
        organization: { id: organizationId },
      },
      { populate: ["user"] },
    );
  }

  async findAllPaginatedByOrganization(
    {
      organizationId,
      page,
      limit,
    }: {
      organizationId: string;
      page: number;
      limit: number;
    },
    em?: EntityManager,
  ): Promise<{ members: Member[]; total: number }> {
    const offset = (page - 1) * limit;
    const [members, total] = await this.getScopedRepository(em).findAndCount(
      { organization: { id: organizationId } },
      {
        populate: ["user"],
        orderBy: { createdAt: "ASC" },
        limit,
        offset,
      },
    );

    return { members, total };
  }

  async updateRole(
    userId: string,
    organizationId: string,
    role: EUserRole,
    em?: EntityManager,
  ): Promise<Member | null> {
    const member = await this.findByUserAndOrganization(userId, organizationId, em);
    if (!member) {
      return null;
    }
    member.role = role;
    return member;
  }

  createMember(data: RequiredEntityData<Member>, em?: EntityManager): Member {
    return this.getScopedRepository(em).create(data);
  }
}
