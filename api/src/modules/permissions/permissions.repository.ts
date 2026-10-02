import type { EntityManager } from "@mikro-orm/postgresql";

import type { Permission } from "@/common/entities/permissions.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class PermissionsRepository extends CustomSQLBaseRepository<Permission> {
  findAllPermissions(em?: EntityManager): Promise<Permission[]> {
    return this.getScopedRepository(em).findAll();
  }
}
