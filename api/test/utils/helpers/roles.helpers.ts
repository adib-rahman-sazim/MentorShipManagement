import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";

import { Role } from "@/common/entities/roles.entity";
import type { EUserRole } from "@/common/enums/roles.enums";

import { RoleFactory } from "../factories/roles.factory";

export const ensureRoleInDb = async (
  dbService: EntityManager<IDatabaseDriver<Connection>>,
  code: EUserRole,
): Promise<Role> => {
  const existingRole = await dbService.findOne(Role, { code });

  if (existingRole) {
    return existingRole;
  }

  const role = new RoleFactory(dbService).makeEntity({ code, name: code });
  dbService.persist(role);
  await dbService.flush();

  return role;
};
