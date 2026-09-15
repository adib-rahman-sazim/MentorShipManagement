import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { Role } from "@/common/entities/roles.entity";

import { ROLE_SEED } from "./roles.constants";

export class Seed20260723000001_Roles extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const seed of ROLE_SEED) {
      let role = await em.findOne(Role, { code: seed.code });
      if (!role) {
        role = em.create(Role, {
          code: seed.code,
          name: seed.name,
        });
      } else {
        role.name = seed.name;
      }
      em.persist(role);
    }
    await em.flush();
  }
}
