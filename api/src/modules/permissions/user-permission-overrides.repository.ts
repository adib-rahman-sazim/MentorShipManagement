import type { EntityManager } from "@mikro-orm/postgresql";

import type { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { NOT_SOFT_DELETED_OVERRIDE } from "./permissions.constants";

export class UserPermissionOverridesRepository extends CustomSQLBaseRepository<UserPermissionOverride> {
  findLiveByUserId(userId: string, em?: EntityManager): Promise<UserPermissionOverride[]> {
    return this.getScopedRepository(em).find(
      { user: userId, ...NOT_SOFT_DELETED_OVERRIDE },
      { populate: ["permission"] },
    );
  }
}
