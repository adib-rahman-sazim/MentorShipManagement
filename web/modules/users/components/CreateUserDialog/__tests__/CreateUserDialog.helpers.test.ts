import { describe, expect, it } from "vitest";

import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";
import { EPermission, EResource } from "@/shared/typedefs";

import {
  INVITE_ORGANIZATION_NOT_ALLOWED_MESSAGE,
  INVITE_ORGANIZATION_REQUIRED_MESSAGE,
} from "../CreateUserDialog.constants";
import {
  buildCreateInvitationPayload,
  getInviteRoleOptionsForAbility,
  inviteUserFormValidationSchema,
} from "../CreateUserDialog.helpers";

const VALID_ORG_ID = "11111111-1111-4111-8111-111111111111";

const baseFormValues = {
  email: "invitee@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
};

describe("CreateUserDialog.helpers", () => {
  describe("inviteUserFormValidationSchema", () => {
    it("rejects customer without organizationId", () => {
      const result = inviteUserFormValidationSchema.safeParse({
        ...baseFormValues,
        role: EUserRole.CUSTOMER,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) => issue.message === INVITE_ORGANIZATION_REQUIRED_MESSAGE,
          ),
        ).toBe(true);
      }
    });

    it("accepts customer with valid organizationId", () => {
      const result = inviteUserFormValidationSchema.safeParse({
        ...baseFormValues,
        role: EUserRole.CUSTOMER,
        organizationId: VALID_ORG_ID,
      });

      expect(result.success).toBe(true);
    });

    it("rejects super admin with organizationId", () => {
      const result = inviteUserFormValidationSchema.safeParse({
        ...baseFormValues,
        role: EUserRole.SUPER_ADMIN,
        organizationId: VALID_ORG_ID,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) => issue.message === INVITE_ORGANIZATION_NOT_ALLOWED_MESSAGE,
          ),
        ).toBe(true);
      }
    });

    it("rejects manager with organizationId", () => {
      const result = inviteUserFormValidationSchema.safeParse({
        ...baseFormValues,
        role: EUserRole.MANAGER,
        organizationId: VALID_ORG_ID,
      });

      expect(result.success).toBe(false);
    });

    it("accepts super admin without organizationId", () => {
      const result = inviteUserFormValidationSchema.safeParse({
        ...baseFormValues,
        role: EUserRole.SUPER_ADMIN,
      });

      expect(result.success).toBe(true);
    });

    it("accepts manager without organizationId", () => {
      const result = inviteUserFormValidationSchema.safeParse({
        ...baseFormValues,
        role: EUserRole.MANAGER,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("buildCreateInvitationPayload", () => {
    it("includes organizationId for customer from form values", () => {
      const payload = buildCreateInvitationPayload({
        ...baseFormValues,
        role: EUserRole.CUSTOMER,
        organizationId: VALID_ORG_ID,
      });

      expect(payload.organizationId).toBe(VALID_ORG_ID);
    });

    it("prefers organizationId prop over form value for customer", () => {
      const propOrgId = "22222222-2222-4222-8222-222222222222";
      const payload = buildCreateInvitationPayload(
        {
          ...baseFormValues,
          role: EUserRole.CUSTOMER,
          organizationId: VALID_ORG_ID,
        },
        propOrgId,
      );

      expect(payload.organizationId).toBe(propOrgId);
    });

    it("omits organizationId for system roles even when present on form", () => {
      const payload = buildCreateInvitationPayload({
        ...baseFormValues,
        role: EUserRole.MANAGER,
        organizationId: VALID_ORG_ID,
      });

      expect(payload.organizationId).toBeUndefined();
    });
  });

  describe("getInviteRoleOptionsForAbility", () => {
    it("returns all roles for superuser ability", () => {
      const options = getInviteRoleOptionsForAbility(
        (action, resource) => action === EPermission.MANAGE && resource === EResource.ALL,
      );

      expect(options.map((option) => option.value)).toEqual([
        EUserRole.SUPER_ADMIN,
        EUserRole.MANAGER,
        EUserRole.CUSTOMER,
      ]);
    });

    it("excludes super admin for manager-like ability", () => {
      const options = getInviteRoleOptionsForAbility(
        (action, resource) =>
          (action === EPermission.CREATE && resource === EResource.INVITATION) ||
          (action === EPermission.UPDATE && resource === EResource.USER),
      );

      expect(options.map((option) => option.value)).toEqual([
        EUserRole.MANAGER,
        EUserRole.CUSTOMER,
      ]);
    });

    it("returns only customer when ability is limited", () => {
      const options = getInviteRoleOptionsForAbility(() => false);

      expect(options.map((option) => option.value)).toEqual([EUserRole.CUSTOMER]);
    });
  });
});
