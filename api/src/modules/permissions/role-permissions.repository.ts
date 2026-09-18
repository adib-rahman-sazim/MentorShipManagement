import type { EntityManager } from "@mikro-orm/postgresql";

import type { Permission } from "@/common/entities/permissions.entity";
import type { RolePermission } from "@/common/entities/roles-permissions.entity";
import type { EUserRole } from "@/common/enums/roles.enums";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class RolePermissionsRepository extends CustomSQLBaseRepository<RolePermission> {
  async findPermissionsByRoleCode(roleCode: EUserRole, em?: EntityManager): Promise<Permission[]> {
    const rolePermissions = await this.getScopedRepository(em).find(
      { role: { code: roleCode } },
      { populate: ["permission"] },
    );

    return rolePermissions.map((rolePermission) => rolePermission.permission);
  }
}
