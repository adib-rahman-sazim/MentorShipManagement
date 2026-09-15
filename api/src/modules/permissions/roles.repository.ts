import type { Role } from "@/common/entities/roles.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import type { EntityManager } from "@mikro-orm/postgresql";
import type { EUserRole } from "@/common/enums/roles.enums";

export class RolesRepository extends CustomSQLBaseRepository<Role> {
  findByCode(code: EUserRole, em?: EntityManager): Promise<Role | null> {
    return this.getScopedRepository(em).findOne({ code });
  }
}
