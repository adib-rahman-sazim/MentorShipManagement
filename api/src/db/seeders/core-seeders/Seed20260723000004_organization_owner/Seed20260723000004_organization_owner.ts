import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { Organization } from "@/common/entities/organizations.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { DEFAULT_ORGANIZATION_SLUG } from "@/db/seeders/core-seeders/Seed20260723000003_default_organization/default-organization.constants";
import {
  ensureCredentialUser,
  ensureMember,
  ensureUserRole,
} from "@/db/seeders/core-seeders/shared/credential-user/credential-user.helpers";

import {
  DEFAULT_ORGANIZATION_OWNER_EMAIL,
  DEFAULT_ORGANIZATION_OWNER_PASSWORD,
  ORGANIZATION_OWNER_EMAIL_ENV_KEY,
  ORGANIZATION_OWNER_FIRST_NAME,
  ORGANIZATION_OWNER_LAST_NAME,
  ORGANIZATION_OWNER_NAME,
  ORGANIZATION_OWNER_PASSWORD_ENV_KEY,
} from "./organization-owner.constants";

export class Seed20260723000004_OrganizationOwner extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const ownerEmail =
      process.env[ORGANIZATION_OWNER_EMAIL_ENV_KEY] || DEFAULT_ORGANIZATION_OWNER_EMAIL;
    const ownerPassword =
      process.env[ORGANIZATION_OWNER_PASSWORD_ENV_KEY] || DEFAULT_ORGANIZATION_OWNER_PASSWORD;

    const organization = await em.findOneOrFail(Organization, {
      slug: DEFAULT_ORGANIZATION_SLUG,
    });

    const user = await ensureCredentialUser(em, {
      email: ownerEmail,
      password: ownerPassword,
      firstName: ORGANIZATION_OWNER_FIRST_NAME,
      lastName: ORGANIZATION_OWNER_LAST_NAME,
      name: ORGANIZATION_OWNER_NAME,
    });

    if (!organization.createdBy) {
      organization.createdBy = user;
      em.persist(organization);
    }

    await ensureMember(em, user, organization, EUserRole.SUPER_ADMIN);
    await ensureUserRole(em, user, EUserRole.SUPER_ADMIN, null);

    await em.flush();
  }
}
