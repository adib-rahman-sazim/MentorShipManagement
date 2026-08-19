import type { Permission } from "@/common/entities/permissions.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class PermissionsRepository extends CustomSQLBaseRepository<Permission> {}
