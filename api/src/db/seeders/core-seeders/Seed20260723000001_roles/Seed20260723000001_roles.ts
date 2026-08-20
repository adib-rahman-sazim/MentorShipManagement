import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { Role } from "@/common/entities/roles.entity";

import { ROLE_SEED } from "./roles.constants";

export class Seed20260723000001_Roles extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const seed of ROLE_SEED) {
      let role = await em.findOne(Role, { slug: seed.slug });
      if (!role) {
        role = em.create(Role, {
          slug: seed.slug,
          name: seed.name,
          description: seed.description,
          isSystem: true,
        });
      } else {
        role.name = seed.name;
        role.description = seed.description;
        role.isSystem = true;
      }
      em.persist(role);
    }
    await em.flush();
  }
}
