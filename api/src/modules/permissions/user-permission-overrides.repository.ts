import type { RequiredEntityData } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import dayjs from "dayjs";

import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { NOT_SOFT_DELETED_OVERRIDE } from "./permissions.constants";

export class UserPermissionOverridesRepository extends CustomSQLBaseRepository<UserPermissionOverride> {
  findLiveByUserId(userId: string, em?: EntityManager): Promise<UserPermissionOverride[]> {
    return this.getScopedRepository(em).find(
      { user: userId, ...NOT_SOFT_DELETED_OVERRIDE },
      { populate: ["permission"] },
    );
  }

  softDeleteLiveByUserId(userId: string, em?: EntityManager): Promise<number> {
    return this.getScopedEntityManager(em).nativeUpdate(
      UserPermissionOverride,
      { user: userId, ...NOT_SOFT_DELETED_OVERRIDE },
      { deletedAt: dayjs().toDate() },
    );
  }

  createOverride(
    data: RequiredEntityData<UserPermissionOverride>,
    em?: EntityManager,
  ): UserPermissionOverride {
    const scopedEntityManager = this.getScopedEntityManager(em);
    const override = scopedEntityManager.create(UserPermissionOverride, data);
    scopedEntityManager.persist(override);

    return override;
  }
}
