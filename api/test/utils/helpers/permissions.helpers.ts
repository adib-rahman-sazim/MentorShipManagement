import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";

import { EUserRole } from "@/common/enums/roles.enums";
import { Seed20260723000002_Permissions } from "@/db/seeders/core-seeders/Seed20260723000002_permissions/Seed20260723000002_permissions";

import { ensureRoleInDb } from "./roles.helpers";

export const seedPermissionCatalogInDb = async (
  dbService: EntityManager<IDatabaseDriver<Connection>>,
): Promise<void> => {
  for (const roleCode of Object.values(EUserRole)) {
    await ensureRoleInDb(dbService, roleCode);
  }

  await new Seed20260723000002_Permissions().run(dbService);
};
