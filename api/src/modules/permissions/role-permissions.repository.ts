import type { RolePermission } from "@/common/entities/roles-permissions.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class RolePermissionsRepository extends CustomSQLBaseRepository<RolePermission> {}
