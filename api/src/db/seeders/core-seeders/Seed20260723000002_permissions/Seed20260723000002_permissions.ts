import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { Permission } from "@/common/entities/permissions.entity";
import { Role } from "@/common/entities/roles.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "@/modules/permissions/permissions.catalog.constants";

export class Seed20260723000002_Permissions extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const permissionsByCode = new Map<string, Permission>();

    for (const definition of DEFAULT_PERMISSION_DEFINITIONS) {
      let permission = await em.findOne(Permission, { code: definition.code });
      if (!permission) {
        permission = em.create(Permission, {
          code: definition.code,
          resource: definition.resource,
          action: definition.action,
          conditionType: definition.conditionType,
          denied: definition.denied,
          description: definition.description ?? null,
        });
      } else {
        permission.resource = definition.resource;
        permission.action = definition.action;
        permission.conditionType = definition.conditionType;
        permission.denied = definition.denied;
        permission.description = definition.description ?? null;
      }
      em.persist(permission);
      permissionsByCode.set(permission.code, permission);
    }
    await em.flush();

    for (const roleCode of Object.values(EUserRole)) {
      const role = await em.findOne(Role, { code: roleCode });
      if (!role) {
        continue;
      }

      const desiredCodes = new Set(DEFAULT_ROLE_PERMISSION_CODES[roleCode] ?? []);
      const existingLinks = await em.find(
        RolePermission,
        { role: { id: role.id } },
        { populate: ["permission"] },
      );

      for (const link of existingLinks) {
        if (!desiredCodes.has(link.permission.code)) {
          em.remove(link);
        }
      }

      const existingCodes = new Set(existingLinks.map((link) => link.permission.code));
      for (const code of desiredCodes) {
        if (existingCodes.has(code)) {
          continue;
        }
        const permission = permissionsByCode.get(code) ?? (await em.findOne(Permission, { code }));
        if (!permission) {
          continue;
        }
        em.create(RolePermission, { role, permission });
      }
    }

    await em.flush();
  }
}
