import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { Organization } from "@/common/entities/organizations.entity";

import {
  DEFAULT_ORGANIZATION_NAME,
  DEFAULT_ORGANIZATION_SLUG,
} from "./default-organization.constants";

export class Seed20260723000003_DefaultOrganization extends Seeder {
  async run(em: EntityManager): Promise<void> {
    let organization = await em.findOne(Organization, { slug: DEFAULT_ORGANIZATION_SLUG });
    if (!organization) {
      organization = em.create(Organization, {
        name: DEFAULT_ORGANIZATION_NAME,
        slug: DEFAULT_ORGANIZATION_SLUG,
      });
    } else {
      organization.name = DEFAULT_ORGANIZATION_NAME;
    }
    em.persist(organization);
    await em.flush();
  }
}
