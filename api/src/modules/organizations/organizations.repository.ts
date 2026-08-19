import type { FilterQuery, RequiredEntityData } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import { Organization } from "@/common/entities/organizations.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class OrganizationsRepository extends CustomSQLBaseRepository<Organization> {
  findById(id: string, em?: EntityManager): Promise<Organization | null> {
    return this.getScopedRepository(em).findOne({ id }, { populate: ["createdBy"] });
  }

  findBySlug(slug: string, em?: EntityManager): Promise<Organization | null> {
    return this.getScopedRepository(em).findOne({ slug });
  }

  async findAllOrganizationsPaginated(
    {
      page,
      limit,
      search,
    }: {
      page: number;
      limit: number;
      search?: string;
    },
    em?: EntityManager,
  ): Promise<{ organizations: Organization[]; total: number }> {
    const where: FilterQuery<Organization> = search ? { name: { $ilike: `%${search}%` } } : {};

    const offset = (page - 1) * limit;
    const [organizations, total] = await this.getScopedRepository(em).findAndCount(where, {
      orderBy: { createdAt: "desc" },
      limit,
      offset,
      populate: ["createdBy"],
    });

    return { organizations, total };
  }

  async findMembershipOrganizationsPaginated(
    {
      userId,
      page,
      limit,
      search,
    }: {
      userId: string;
      page: number;
      limit: number;
      search?: string;
    },
    em?: EntityManager,
  ): Promise<{ organizations: Organization[]; total: number }> {
    const where: FilterQuery<Organization> = {
      members: { user: { id: userId } },
      ...(search ? { name: { $ilike: `%${search}%` } } : {}),
    };

    const offset = (page - 1) * limit;
    const [organizations, total] = await this.getScopedRepository(em).findAndCount(where, {
      orderBy: { createdAt: "desc" },
      limit,
      offset,
      populate: ["createdBy"],
    });

    return { organizations, total };
  }

  createOrganization(data: RequiredEntityData<Organization>, em?: EntityManager): Organization {
    return this.getScopedRepository(em).create(data);
  }
}
