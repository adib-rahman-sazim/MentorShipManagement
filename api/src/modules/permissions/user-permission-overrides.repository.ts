import type { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class UserPermissionOverridesRepository extends CustomSQLBaseRepository<UserPermissionOverride> {}
