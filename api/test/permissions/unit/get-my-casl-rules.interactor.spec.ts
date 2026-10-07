import { createMongoAbility } from "@casl/ability";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { EUserRole } from "@/common/enums/roles.enums";
import { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import type { TAppAbility } from "@/modules/casl/casl.types";
import { GetMyCaslRulesInteractor } from "@/modules/permissions/interactors/get-my-casl-rules.interactor";
import { PermissionsSerializer } from "@/modules/permissions/permissions.serializer";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const UNKNOWN_ROLE = "not_a_role";

describe("GetMyCaslRulesInteractor", () => {
  let caslAbilityFactory: DeepMockProxy<CaslAbilityFactory>;
  let interactor: GetMyCaslRulesInteractor;
  const ability = createMongoAbility<TAppAbility>([]);

  beforeEach(() => {
    caslAbilityFactory = mockDeep<CaslAbilityFactory>();

    interactor = new GetMyCaslRulesInteractor(caslAbilityFactory, new PermissionsSerializer());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("flags a user that holds all:manage", async () => {
    caslAbilityFactory.resolveUserAbility.mockResolvedValue({ ability, holdsAllManage: true });

    const result = await interactor.execute({ userId: USER_ID, role: EUserRole.SUPERADMIN });

    expect(result.holdsAllManage).toBe(true);
    expect(caslAbilityFactory.resolveUserAbility).toHaveBeenCalledWith({
      userId: USER_ID,
      role: EUserRole.SUPERADMIN,
    });
  });

  it("does not flag a user without all:manage", async () => {
    caslAbilityFactory.resolveUserAbility.mockResolvedValue({ ability, holdsAllManage: false });

    const result = await interactor.execute({ userId: USER_ID, role: EUserRole.MENTEE });

    expect(result.holdsAllManage).toBe(false);
  });

  it("returns no rules and no all:manage for an unknown role", async () => {
    const result = await interactor.execute({ userId: USER_ID, role: UNKNOWN_ROLE });

    expect(result).toEqual({ rules: [], holdsAllManage: false });
    expect(caslAbilityFactory.resolveUserAbility).not.toHaveBeenCalled();
  });
});
