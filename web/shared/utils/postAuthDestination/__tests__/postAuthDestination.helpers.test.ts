import { describe, expect, it } from "vitest";

import {
  CREATE_ORGANIZATION_ROUTE,
  DASHBOARD_ROUTE,
  INVITE_ACCEPT_ROUTE,
} from "@/shared/constants/routes.constants";

import { resolvePostAuthDestination } from "../postAuthDestination.helpers";

describe("resolvePostAuthDestination", () => {
  it("prefers a safe stored redirect", () => {
    expect(
      resolvePostAuthDestination({
        storedRedirect: "/invite/accept?token=abc",
        pendingInvitationId: "invite-1",
        hasActiveOrganization: false,
        hasListableOrganization: false,
      }),
    ).toBe("/invite/accept?token=abc");
  });

  it("sends users with an organization to the dashboard", () => {
    expect(
      resolvePostAuthDestination({
        storedRedirect: null,
        pendingInvitationId: "invite-1",
        hasActiveOrganization: true,
        hasListableOrganization: false,
      }),
    ).toBe(DASHBOARD_ROUTE);

    expect(
      resolvePostAuthDestination({
        storedRedirect: null,
        pendingInvitationId: null,
        hasActiveOrganization: false,
        hasListableOrganization: true,
      }),
    ).toBe(DASHBOARD_ROUTE);
  });

  it("prefers pending invitation over create-organization", () => {
    expect(
      resolvePostAuthDestination({
        storedRedirect: null,
        pendingInvitationId: "invite-99",
        hasActiveOrganization: false,
        hasListableOrganization: false,
      }),
    ).toBe(`${INVITE_ACCEPT_ROUTE}?token=invite-99`);
  });

  it("routes org-less users without invites to create-organization", () => {
    expect(
      resolvePostAuthDestination({
        storedRedirect: null,
        pendingInvitationId: null,
        hasActiveOrganization: false,
        hasListableOrganization: false,
      }),
    ).toBe(CREATE_ORGANIZATION_ROUTE);
  });
});
