import type { UserRole } from "@/common/entities/user-roles.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class UserRolesRepository extends CustomSQLBaseRepository<UserRole> {}
