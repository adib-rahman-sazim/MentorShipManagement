import type { EntityManager } from "@mikro-orm/core";

import { mockDeep } from "vitest-mock-extended";

import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { BOOTSTRAP_SUPERADMIN_ERROR_MESSAGES } from "@/db/seeders/core-seeders/Seed20260723000003_bootstrap_superadmin/bootstrap-superadmin.constants";
import { Seed20260723000003_BootstrapSuperadmin } from "@/db/seeders/core-seeders/Seed20260723000003_bootstrap_superadmin/Seed20260723000003_bootstrap_superadmin";
import { ensureCredentialUser } from "@/db/seeders/core-seeders/shared/credential-user/credential-user.helpers";

vi.mock("@/db/seeders/core-seeders/shared/credential-user/credential-user.helpers", () => ({
  ensureCredentialUser: vi.fn(),
}));

describe("Seed20260723000003_BootstrapSuperadmin", () => {
  const originalEmail = process.env.SUPERADMIN_EMAIL;
  const originalPassword = process.env.SUPERADMIN_PASSWORD;

  afterEach(() => {
    if (originalEmail === undefined) {
      delete process.env.SUPERADMIN_EMAIL;
    } else {
      process.env.SUPERADMIN_EMAIL = originalEmail;
    }
    if (originalPassword === undefined) {
      delete process.env.SUPERADMIN_PASSWORD;
    } else {
      process.env.SUPERADMIN_PASSWORD = originalPassword;
    }
    vi.clearAllMocks();
  });

  it("does nothing when an active superadmin already exists", async () => {
    const em = mockDeep<EntityManager>();
    em.findOne.mockResolvedValue({ id: "existing-superadmin" } as User);

    await new Seed20260723000003_BootstrapSuperadmin().run(em);

    expect(em.findOne).toHaveBeenCalledWith(User, {
      role: { code: EUserRole.SUPERADMIN },
      state: EUserState.ACTIVE,
      deletedAt: null,
    });
    expect(ensureCredentialUser).not.toHaveBeenCalled();
  });

  it("creates the first superadmin from environment credentials", async () => {
    process.env.SUPERADMIN_EMAIL = "initial.admin@example.com";
    process.env.SUPERADMIN_PASSWORD = "strong-password";

    const em = mockDeep<EntityManager>();
    em.findOne.mockResolvedValue(null);

    await new Seed20260723000003_BootstrapSuperadmin().run(em);

    expect(em.findOne).toHaveBeenCalledWith(User, {
      email: "initial.admin@example.com",
      role: { code: { $ne: EUserRole.SUPERADMIN } },
    });
    expect(ensureCredentialUser).toHaveBeenCalledWith(em, {
      email: "initial.admin@example.com",
      password: "strong-password",
      name: "Superadmin",
      role: EUserRole.SUPERADMIN,
      updateExistingPassword: true,
    });
  });

  it("fails instead of starting without bootstrap credentials", async () => {
    delete process.env.SUPERADMIN_EMAIL;
    delete process.env.SUPERADMIN_PASSWORD;

    const em = mockDeep<EntityManager>();
    em.findOne.mockResolvedValue(null);

    await expect(new Seed20260723000003_BootstrapSuperadmin().run(em)).rejects.toThrow(
      BOOTSTRAP_SUPERADMIN_ERROR_MESSAGES.MISSING_CREDENTIALS,
    );
  });

  it("refuses to promote an existing user that does not already hold the superadmin role", async () => {
    process.env.SUPERADMIN_EMAIL = "mentee@example.com";
    process.env.SUPERADMIN_PASSWORD = "strong-password";

    const em = mockDeep<EntityManager>();
    em.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing-mentee" } as User);

    await expect(new Seed20260723000003_BootstrapSuperadmin().run(em)).rejects.toThrow(
      BOOTSTRAP_SUPERADMIN_ERROR_MESSAGES.EMAIL_TAKEN_BY_OTHER_ROLE,
    );

    expect(ensureCredentialUser).not.toHaveBeenCalled();
  });
});
