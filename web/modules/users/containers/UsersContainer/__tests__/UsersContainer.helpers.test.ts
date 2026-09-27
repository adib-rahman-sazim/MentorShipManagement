import { describe, expect, it } from "vitest";

import { canUpdateUserRow } from "@/modules/users/containers/UsersContainer/UsersContainer.helpers";
import {
  ACTOR_ID,
  buildAbility,
  MENTEE_ID,
  MENTOR_RULES,
  OUTSIDER_ID,
  SENSEI_WITH_USER_ADMIN_GRANTS_RULES,
  SUPERADMIN_RULES,
} from "@/shared/providers/AbilityProvider/__tests__/ability.fixtures";

describe("canUpdateUserRow", () => {
  it("lets the superadmin change anyone but themselves", () => {
    const ability = buildAbility(SUPERADMIN_RULES);

    expect(canUpdateUserRow(ability, OUTSIDER_ID, ACTOR_ID)).toBe(true);
    expect(canUpdateUserRow(ability, ACTOR_ID, ACTOR_ID)).toBe(false);
  });

  it("lets a granted sensei change anyone but themselves", () => {
    const ability = buildAbility(SENSEI_WITH_USER_ADMIN_GRANTS_RULES);

    expect(canUpdateUserRow(ability, OUTSIDER_ID, ACTOR_ID)).toBe(true);
    expect(canUpdateUserRow(ability, ACTOR_ID, ACTOR_ID)).toBe(false);
  });

  it("hides the actions from someone without the update permission", () => {
    const ability = buildAbility(MENTOR_RULES);

    expect(canUpdateUserRow(ability, MENTEE_ID, ACTOR_ID)).toBe(false);
  });
});
