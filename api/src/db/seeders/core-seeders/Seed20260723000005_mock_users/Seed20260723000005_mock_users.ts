import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { Organization } from "@/common/entities/organizations.entity";
import { DEFAULT_ORGANIZATION_SLUG } from "@/db/seeders/core-seeders/Seed20260723000003_default_organization/default-organization.constants";
import {
  ensureCredentialUser,
  ensureMember,
  ensureUserRole,
} from "@/db/seeders/core-seeders/shared/credential-user/credential-user.helpers";

import { MOCK_USER_DEFAULT_PASSWORD, MOCK_USERS } from "./mock-users.constants";

export class Seed20260723000005_MockUsers extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const organization = await em.findOneOrFail(Organization, {
      slug: DEFAULT_ORGANIZATION_SLUG,
    });

    for (const fixture of MOCK_USERS) {
      const user = await ensureCredentialUser(em, {
        email: fixture.email,
        password: MOCK_USER_DEFAULT_PASSWORD,
        firstName: fixture.firstName,
        lastName: fixture.lastName,
        name: fixture.name,
      });

      const organizationForRole = fixture.organizationBound ? organization : null;
      await ensureUserRole(em, user, fixture.roleSlug, organizationForRole);

      if (fixture.memberRole) {
        await ensureMember(em, user, organization, fixture.memberRole);
      }
    }

    await em.flush();
  }
}
