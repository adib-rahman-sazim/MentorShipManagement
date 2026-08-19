import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { Seed20260723000001_Roles } from "./core-seeders/Seed20260723000001_roles/Seed20260723000001_roles";
import { Seed20260723000002_Permissions } from "./core-seeders/Seed20260723000002_permissions/Seed20260723000002_permissions";
import { Seed20260723000003_DefaultOrganization } from "./core-seeders/Seed20260723000003_default_organization/Seed20260723000003_default_organization";
import { Seed20260723000004_OrganizationOwner } from "./core-seeders/Seed20260723000004_organization_owner/Seed20260723000004_organization_owner";
import { Seed20260723000005_MockUsers } from "./core-seeders/Seed20260723000005_mock_users/Seed20260723000005_mock_users";

export class DevSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [
      Seed20260723000001_Roles,
      Seed20260723000002_Permissions,
      Seed20260723000003_DefaultOrganization,
      Seed20260723000004_OrganizationOwner,
      Seed20260723000005_MockUsers,
    ]);
  }
}
