import type { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import type { Permission } from "@/common/entities/permissions.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import type { ICachedUserAbility } from "@/modules/casl/casl.interfaces";
import type { TAppRawRule } from "@/modules/casl/casl.types";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { MentorshipHierarchyService } from "@/modules/mentorships/mentorship-hierarchy.service";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import {
  EPermission,
  EPermissionCode,
  EPermissionConditionType,
  EResource,
} from "@/modules/permissions/permissions.enums";
import { PermissionFactory } from "@/test/utils/factories/permissions.factory";
import { createOfflineOrm } from "@/test/utils/helpers/offline-orm.helpers";

const USER_ID = "00000000-0000-0000-0000-000000000001";
const SUBTREE_USER_IDS = [
  "00000000-0000-0000-0000-0000000000a1",
  "00000000-0000-0000-0000-0000000000a2",
];
const ANCESTOR_USER_IDS = [
  "00000000-0000-0000-0000-0000000000b1",
  "00000000-0000-0000-0000-0000000000b2",
];
const ABILITY_CONTEXT = { userId: USER_ID, role: EUserRole.SENSEI };

describe("CaslAbilityFactory", () => {
  let orm: MikroORM;
  let permissionFactory: PermissionFactory;
  let nextPermissionId: number;

  beforeAll(() => {
    orm = createOfflineOrm();
    permissionFactory = new PermissionFactory(orm.em);
  });

  afterAll(async () => {
    await orm.close();
  });

  beforeEach(() => {
    orm.em.clear();
    nextPermissionId = 1;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const buildPermission = (overrides: Partial<Permission>): Permission =>
    permissionFactory.makeEntity({ id: nextPermissionId++, ...overrides });

  const buildFactory = (
    permissions: Permission[],
    cachedUserAbility: ICachedUserAbility | null = null,
    holdsAllManage = false,
  ) => {
    const caslCacheService = mockDeep<CaslCacheService>();
    caslCacheService.buildUserCacheKey.mockReturnValue(`casl:user:${USER_ID}`);
    caslCacheService.getUserAbility.mockResolvedValue(cachedUserAbility);
    caslCacheService.setUserAbility.mockResolvedValue(undefined);

    const effectivePermissionsService = mockDeep<EffectivePermissionsService>();
    effectivePermissionsService.resolveForUser.mockResolvedValue({ permissions, holdsAllManage });

    const mentorshipHierarchyService = mockDeep<MentorshipHierarchyService>();
    mentorshipHierarchyService.findSubtreeUserIds.mockResolvedValue(SUBTREE_USER_IDS);
    mentorshipHierarchyService.findChainUserIds.mockResolvedValue(ANCESTOR_USER_IDS);

    return {
      caslCacheService,
      effectivePermissionsService,
      mentorshipHierarchyService,
      factory: new CaslAbilityFactory(
        caslCacheService,
        effectivePermissionsService,
        mentorshipHierarchyService,
      ),
    };
  };

  const cachedUserAbilityFrom = (caslCacheService: {
    setUserAbility: { mock: { calls: unknown[][] } };
  }) => caslCacheService.setUserAbility.mock.calls[0][1] as ICachedUserAbility;

  const cachedRulesFrom = (caslCacheService: {
    setUserAbility: { mock: { calls: unknown[][] } };
  }): TAppRawRule[] => cachedUserAbilityFrom(caslCacheService).rules;

  const readUserPermission = () =>
    buildPermission({
      code: EPermissionCode.CAN_READ_USER,
      resource: EResource.USER,
      action: EPermission.READ,
      conditionType: EPermissionConditionType.NONE,
    });

  const updateUserSubtreePermission = () =>
    buildPermission({
      code: EPermissionCode.CAN_UPDATE_USER,
      resource: EResource.USER,
      action: EPermission.UPDATE,
      conditionType: EPermissionConditionType.SUBTREE,
    });

  describe("cache", () => {
    it("builds from the cached rules without resolving anything", async () => {
      const { factory, effectivePermissionsService, mentorshipHierarchyService } = buildFactory(
        [],
        {
          rules: [{ action: EPermission.READ, subject: EResource.USER }],
          holdsAllManage: true,
        },
      );

      const { ability, holdsAllManage } = await factory.resolveUserAbility(ABILITY_CONTEXT);

      expect(ability.can(EPermission.READ, EResource.USER)).toBe(true);
      expect(holdsAllManage).toBe(true);
      expect(effectivePermissionsService.resolveForUser).not.toHaveBeenCalled();
      expect(mentorshipHierarchyService.findSubtreeUserIds).not.toHaveBeenCalled();
    });

    it("caches the manage-all flag alongside the rules", async () => {
      const { factory, caslCacheService } = buildFactory([readUserPermission()], null, true);

      const { holdsAllManage } = await factory.resolveUserAbility(ABILITY_CONTEXT);

      expect(holdsAllManage).toBe(true);
      expect(cachedUserAbilityFrom(caslCacheService).holdsAllManage).toBe(true);
    });

    it("still resolves when the cache is unavailable", async () => {
      const { factory, effectivePermissionsService } = buildFactory([readUserPermission()], null);

      const ability = await factory.createForUser(ABILITY_CONTEXT);

      expect(effectivePermissionsService.resolveForUser).toHaveBeenCalledOnce();
      expect(ability.can(EPermission.READ, EResource.USER)).toBe(true);
    });
  });

  describe("subtree resolution", () => {
    it("does not query the hierarchy when no permission is subtree scoped", async () => {
      const { factory, caslCacheService, mentorshipHierarchyService } = buildFactory([
        readUserPermission(),
      ]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(mentorshipHierarchyService.findSubtreeUserIds).not.toHaveBeenCalled();
      expect(cachedRulesFrom(caslCacheService)[0].conditions).toBeUndefined();
    });

    it("queries the hierarchy once for the user when one is", async () => {
      const { factory, mentorshipHierarchyService } = buildFactory([
        readUserPermission(),
        updateUserSubtreePermission(),
      ]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(mentorshipHierarchyService.findSubtreeUserIds).toHaveBeenCalledExactlyOnceWith(
        USER_ID,
      );
    });

    it("attaches the subtree ids only to the subtree-scoped rule", async () => {
      const { factory, caslCacheService } = buildFactory([
        readUserPermission(),
        updateUserSubtreePermission(),
      ]);

      await factory.createForUser(ABILITY_CONTEXT);
      const rules = cachedRulesFrom(caslCacheService);

      const readRule = rules.find((rule) => rule.action === EPermission.READ);
      const updateRule = rules.find((rule) => rule.action === EPermission.UPDATE);

      expect(readRule?.conditions).toBeUndefined();
      expect(updateRule?.conditions).toEqual({ id: { $in: SUBTREE_USER_IDS } });
    });

    it("attaches an empty id list rather than omitting the condition", async () => {
      const { factory, caslCacheService, mentorshipHierarchyService } = buildFactory([
        updateUserSubtreePermission(),
      ]);
      mentorshipHierarchyService.findSubtreeUserIds.mockResolvedValue([]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(cachedRulesFrom(caslCacheService)[0].conditions).toEqual({ id: { $in: [] } });
    });

    it("refuses a subject outside the subtree and allows one inside it", async () => {
      const { factory } = buildFactory([updateUserSubtreePermission()]);

      const ability = await factory.createForUser(ABILITY_CONTEXT);

      const inside = { __caslSubjectType__: EResource.USER, id: SUBTREE_USER_IDS[0] };
      const outside = { __caslSubjectType__: EResource.USER, id: USER_ID };

      expect(ability.can(EPermission.UPDATE, inside)).toBe(true);
      expect(ability.can(EPermission.UPDATE, outside)).toBe(false);
    });
  });

  describe("rule shaping", () => {
    it("keeps two rules that share an action and resource but differ in scope", async () => {
      const { factory, caslCacheService } = buildFactory([
        buildPermission({
          code: EPermissionCode.CAN_UPDATE_USER,
          resource: EResource.USER,
          action: EPermission.UPDATE,
          conditionType: EPermissionConditionType.NONE,
        }),
        updateUserSubtreePermission(),
      ]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(cachedRulesFrom(caslCacheService)).toHaveLength(2);
    });

    it("maps the all resource onto the CASL all subject", async () => {
      const { factory, caslCacheService } = buildFactory([
        buildPermission({
          code: EPermissionCode.CAN_MANAGE_ALL,
          resource: EResource.ALL,
          action: EPermission.MANAGE,
          conditionType: EPermissionConditionType.NONE,
        }),
      ]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(cachedRulesFrom(caslCacheService)[0].subject).toBe("all");
    });

    it("marks a denied permission as an inverted rule", async () => {
      const { factory, caslCacheService } = buildFactory([
        buildPermission({
          code: EPermissionCode.CAN_DELETE_USER,
          resource: EResource.USER,
          action: EPermission.DELETE,
          conditionType: EPermissionConditionType.NONE,
          denied: true,
        }),
      ]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(cachedRulesFrom(caslCacheService)[0].inverted).toBe(true);
    });
  });

  describe("hierarchy resolution", () => {
    const readUserHierarchyPermission = () =>
      buildPermission({
        code: EPermissionCode.CAN_READ_USER,
        resource: EResource.USER,
        action: EPermission.READ,
        conditionType: EPermissionConditionType.HIERARCHY,
      });

    it("carries people above and below in one id list", async () => {
      const { factory, caslCacheService } = buildFactory([readUserHierarchyPermission()]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(cachedRulesFrom(caslCacheService)[0].conditions).toEqual({
        id: { $in: [...SUBTREE_USER_IDS, ...ANCESTOR_USER_IDS] },
      });
    });

    it("does not query upward for a subtree-only permission", async () => {
      const { factory, mentorshipHierarchyService } = buildFactory([updateUserSubtreePermission()]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(mentorshipHierarchyService.findChainUserIds).not.toHaveBeenCalled();
    });
  });

  describe("the manage-all holder", () => {
    it("is never scoped by a condition the wildcard expanded into", async () => {
      const { factory, caslCacheService, mentorshipHierarchyService } = buildFactory(
        [updateUserSubtreePermission()],
        null,
        true,
      );

      await factory.createForUser(ABILITY_CONTEXT);

      expect(cachedRulesFrom(caslCacheService)[0].conditions).toBeUndefined();
      expect(mentorshipHierarchyService.findSubtreeUserIds).not.toHaveBeenCalled();
    });
  });
});
