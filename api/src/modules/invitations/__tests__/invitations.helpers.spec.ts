import { describe, expect, it } from "vitest";

import { EUserRole } from "@/common/enums/roles.enums";
import {
  canInviteRole,
  getEffectiveOrganizationId,
  INVITATION_ERROR_MESSAGES,
  normalizeInvitationEmail,
  validateInvitationRules,
} from "@/modules/invitations/invitations.helpers";

describe("Invitations - canInviteRole", () => {
  it("allows super_admin to invite all roles", () => {
    expect(canInviteRole(EUserRole.SUPER_ADMIN, EUserRole.SUPER_ADMIN)).toBe(true);
    expect(canInviteRole(EUserRole.SUPER_ADMIN, EUserRole.MANAGER)).toBe(true);
    expect(canInviteRole(EUserRole.SUPER_ADMIN, EUserRole.CUSTOMER)).toBe(true);
  });

  it("allows manager to invite manager and customer only", () => {
    expect(canInviteRole(EUserRole.MANAGER, EUserRole.MANAGER)).toBe(true);
    expect(canInviteRole(EUserRole.MANAGER, EUserRole.CUSTOMER)).toBe(true);
    expect(canInviteRole(EUserRole.MANAGER, EUserRole.SUPER_ADMIN)).toBe(false);
  });

  it("allows customer to invite customer only", () => {
    expect(canInviteRole(EUserRole.CUSTOMER, EUserRole.CUSTOMER)).toBe(true);
    expect(canInviteRole(EUserRole.CUSTOMER, EUserRole.MANAGER)).toBe(false);
  });
});

describe("Invitations - validateInvitationRules", () => {
  it("rejects organizationId for system-level roles", () => {
    const result = validateInvitationRules({
      inviterRole: EUserRole.SUPER_ADMIN,
      targetRole: EUserRole.MANAGER,
      organizationId: "org-uuid",
    });

    expect(result).toEqual({
      valid: false,
      error: INVITATION_ERROR_MESSAGES.ORGANIZATION_NOT_ALLOWED,
    });
  });

  it("requires organizationId for customer invitations", () => {
    const result = validateInvitationRules({
      inviterRole: EUserRole.CUSTOMER,
      targetRole: EUserRole.CUSTOMER,
      organizationId: undefined,
    });

    expect(result).toEqual({
      valid: false,
      error: INVITATION_ERROR_MESSAGES.ORGANIZATION_REQUIRED,
    });
  });

  it("allows customer invite with organizationId", () => {
    const result = validateInvitationRules({
      inviterRole: EUserRole.CUSTOMER,
      targetRole: EUserRole.CUSTOMER,
      organizationId: "org-123",
    });

    expect(result).toEqual({ valid: true });
  });

  it("allows system invite without organizationId", () => {
    const result = validateInvitationRules({
      inviterRole: EUserRole.SUPER_ADMIN,
      targetRole: EUserRole.MANAGER,
      organizationId: undefined,
    });

    expect(result).toEqual({ valid: true });
  });

  it("rejects disallowed role pairs", () => {
    const result = validateInvitationRules({
      inviterRole: EUserRole.CUSTOMER,
      targetRole: EUserRole.MANAGER,
      organizationId: undefined,
    });

    expect(result).toEqual({
      valid: false,
      error: INVITATION_ERROR_MESSAGES.ROLE_NOT_ALLOWED(EUserRole.CUSTOMER, EUserRole.MANAGER),
    });
  });
});

describe("Invitations - getEffectiveOrganizationId", () => {
  it("prefers dto org for customer", () => {
    expect(
      getEffectiveOrganizationId({
        targetRole: EUserRole.CUSTOMER,
        orgIdFromDto: "org-dto",
        orgIdFromInvitationContext: "org-context",
      }),
    ).toBe("org-dto");
  });

  it("falls back to context org for customer", () => {
    expect(
      getEffectiveOrganizationId({
        targetRole: EUserRole.CUSTOMER,
        orgIdFromDto: undefined,
        orgIdFromInvitationContext: "org-context",
      }),
    ).toBe("org-context");
  });

  it("returns dto org only for system roles", () => {
    expect(
      getEffectiveOrganizationId({
        targetRole: EUserRole.MANAGER,
        orgIdFromDto: "org-dto",
        orgIdFromInvitationContext: "org-context",
      }),
    ).toBe("org-dto");
  });
});

describe("Invitations - normalizeInvitationEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeInvitationEmail("  Admin@Example.COM ")).toBe("admin@example.com");
  });
});
