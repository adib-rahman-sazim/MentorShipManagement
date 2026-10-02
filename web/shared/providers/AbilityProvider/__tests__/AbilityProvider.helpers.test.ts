import { describe, expect, it } from "vitest";

import {
  buildAbility,
  MENTEE_ID,
  OUTSIDER_ID,
  SENSEI_RULES,
  SUPERADMIN_RULES,
} from "@/shared/providers/AbilityProvider/__tests__/ability.fixtures";
import { canPerform } from "@/shared/providers/AbilityProvider/AbilityProvider.helpers";
import { EPermission, EResource } from "@/shared/typedefs";

describe("canPerform", () => {
  it("allows an unconditional rule for any instance", () => {
    const ability = buildAbility(SUPERADMIN_RULES);

    expect(canPerform(ability, EPermission.UPDATE, EResource.USER, { id: OUTSIDER_ID })).toBe(true);
  });

  it("reads a conditional rule as allowed when no person is passed", () => {
    const ability = buildAbility(SENSEI_RULES);

    expect(canPerform(ability, EPermission.READ, EResource.USER)).toBe(true);
  });

  it("checks a conditional rule against the person being acted on", () => {
    const ability = buildAbility(SENSEI_RULES);

    expect(canPerform(ability, EPermission.READ, EResource.USER, { id: MENTEE_ID })).toBe(true);
    expect(canPerform(ability, EPermission.READ, EResource.USER, { id: OUTSIDER_ID })).toBe(false);
  });

  it("denies an action the rules never mention", () => {
    const ability = buildAbility(SENSEI_RULES);

    expect(canPerform(ability, EPermission.CREATE, EResource.USER)).toBe(false);
  });

  it("does not rely on a manage-all rule for the superadmin", () => {
    const ability = buildAbility(SUPERADMIN_RULES);

    expect(ability.can(EPermission.MANAGE, EResource.ALL)).toBe(false);
    expect(canPerform(ability, EPermission.PAGE_VIEW, EResource.USER)).toBe(true);
  });
});
