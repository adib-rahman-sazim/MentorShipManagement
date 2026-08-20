import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { Seed20260723000001_Roles } from "@/db/seeders/core-seeders/Seed20260723000001_roles/Seed20260723000001_roles";
import { Seed20260723000002_Permissions } from "@/db/seeders/core-seeders/Seed20260723000002_permissions/Seed20260723000002_permissions";
import { Seed20260723000005_MockUsers } from "@/db/seeders/core-seeders/Seed20260723000005_mock_users/Seed20260723000005_mock_users";
import { ProdSeeder } from "@/db/seeders/prod-seeder";

import type { TSeederPrototypeWithCall } from "./seeder-call.spec.types";

describe("ProdSeeder", () => {
  let capturedSeeders: unknown[];

  beforeEach(() => {
    capturedSeeders = [];
    vi.spyOn(Seeder.prototype as TSeederPrototypeWithCall, "call").mockImplementation(
      async (...args: unknown[]) => {
        capturedSeeders = args[1] as unknown[];
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls core seeders only without mock users", async () => {
    const seeder = new ProdSeeder();
    await seeder.run({} as EntityManager);

    expect(capturedSeeders).toEqual([Seed20260723000001_Roles, Seed20260723000002_Permissions]);
    expect(capturedSeeders).not.toContain(Seed20260723000005_MockUsers);
  });
});
