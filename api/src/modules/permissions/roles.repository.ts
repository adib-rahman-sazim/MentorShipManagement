import type { Role } from "@/common/entities/roles.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class RolesRepository extends CustomSQLBaseRepository<Role> {}
