import { describe, expect, it } from "vitest";

import { getVisibleSidebarMenuItems } from "@/shared/layouts/AuthenticatedLayout/components/AppSidebar/AppSidebar.helpers";
import {
  buildAbility,
  MENTEE_RULES,
  MENTOR_RULES,
  SENSEI_RULES,
  SENSEI_WITH_USER_ADMIN_GRANTS_RULES,
  SUPERADMIN_RULES,
} from "@/shared/providers/AbilityProvider/__tests__/ability.fixtures";
import { canPerform } from "@/shared/providers/AbilityProvider/AbilityProvider.helpers";
import { INormalizedCaslRuleResponse } from "@/shared/typedefs";

const HOME = "Home";
const USERS = "Users";
const SETTINGS = "Settings";

function visibleTitlesFor(rules: INormalizedCaslRuleResponse[]): string[] {
  const ability = buildAbility(rules);

  return getVisibleSidebarMenuItems((action, resource) =>
    canPerform(ability, action, resource),
  ).map((item) => item.title);
}

describe("getVisibleSidebarMenuItems", () => {
  it("shows every page to the superadmin", () => {
    expect(visibleTitlesFor(SUPERADMIN_RULES)).toEqual([HOME, USERS, SETTINGS]);
  });

  it.each([
    ["sensei", SENSEI_RULES],
    ["mentor", MENTOR_RULES],
    ["mentee", MENTEE_RULES],
  ])("hides the users page from a %s by default", (_role, rules) => {
    expect(visibleTitlesFor(rules)).toEqual([HOME, SETTINGS]);
  });

  it("shows the users page once it is granted to a person", () => {
    expect(visibleTitlesFor(SENSEI_WITH_USER_ADMIN_GRANTS_RULES)).toEqual([HOME, USERS, SETTINGS]);
  });

  it("shows nothing when the rules are empty", () => {
    expect(visibleTitlesFor([])).toEqual([]);
  });
});
