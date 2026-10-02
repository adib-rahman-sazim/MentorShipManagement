import { LockMode } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import type { Role } from "@/common/entities/roles.entity";
import type { EUserRole } from "@/common/enums/roles.enums";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

export class RolesRepository extends CustomSQLBaseRepository<Role> {
  findByCode(code: EUserRole, em?: EntityManager): Promise<Role | null> {
    return this.getScopedRepository(em).findOne({ code });
  }

  findByCodeForUpdate(code: EUserRole, em: EntityManager): Promise<Role | null> {
    return this.getScopedRepository(em).findOne({ code }, { lockMode: LockMode.PESSIMISTIC_WRITE });
  }
}
