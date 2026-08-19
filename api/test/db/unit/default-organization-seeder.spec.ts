import type { EntityManager } from "@mikro-orm/core";

import { mockDeep } from "vitest-mock-extended";

import { Organization } from "@/common/entities/organizations.entity";
import {
  DEFAULT_ORGANIZATION_NAME,
  DEFAULT_ORGANIZATION_SLUG,
} from "@/db/seeders/core-seeders/Seed20260723000003_default_organization/default-organization.constants";
import { Seed20260723000003_DefaultOrganization } from "@/db/seeders/core-seeders/Seed20260723000003_default_organization/Seed20260723000003_default_organization";

describe("Seed20260723000003_DefaultOrganization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates the default organization when missing", async () => {
    const em = mockDeep<EntityManager>();
    em.findOne.mockResolvedValue(null);
    em.create.mockImplementation((_entity, data) => data as never);

    await new Seed20260723000003_DefaultOrganization().run(em);

    expect(em.create).toHaveBeenCalledWith(Organization, {
      name: DEFAULT_ORGANIZATION_NAME,
      slug: DEFAULT_ORGANIZATION_SLUG,
    });
    expect(em.flush).toHaveBeenCalled();
  });

  it("updates the name of an existing default organization", async () => {
    const existing = {
      slug: DEFAULT_ORGANIZATION_SLUG,
      name: "Old Name",
      createdBy: { id: "user-1" },
    } as Organization;
    const em = mockDeep<EntityManager>();
    em.findOne.mockResolvedValue(existing);

    await new Seed20260723000003_DefaultOrganization().run(em);

    expect(existing.name).toBe(DEFAULT_ORGANIZATION_NAME);
    expect(existing.createdBy).toEqual({ id: "user-1" });
    expect(em.create).not.toHaveBeenCalled();
  });
});
