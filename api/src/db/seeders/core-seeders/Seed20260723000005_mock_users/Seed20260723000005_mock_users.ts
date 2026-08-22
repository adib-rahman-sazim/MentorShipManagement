import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { ensureCredentialUser } from "@/db/seeders/core-seeders/shared/credential-user/credential-user.helpers";

import { MOCK_USER_DEFAULT_PASSWORD, MOCK_USERS } from "./mock-users.constants";

export class Seed20260723000005_MockUsers extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const fixture of MOCK_USERS) {
      await ensureCredentialUser(em, {
        email: fixture.email,
        password: MOCK_USER_DEFAULT_PASSWORD,
        name: fixture.name,
        role: fixture.role,
      });
    }

    await em.flush();
  }
}
