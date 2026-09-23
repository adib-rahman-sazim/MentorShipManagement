import type { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import type { Permission } from "@/common/entities/permissions.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import type { TAppRawRule } from "@/modules/casl/casl.types";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "@/modules/mentorships/mentorships.constants";
import { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
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
    cachedRules: TAppRawRule[] | null = null,
    holdsAllManage = false,
  ) => {
    const caslCacheService = mockDeep<CaslCacheService>();
    caslCacheService.buildUserCacheKey.mockReturnValue(`casl:user:${USER_ID}`);
    caslCacheService.getRules.mockResolvedValue(cachedRules);
    caslCacheService.setRules.mockResolvedValue(undefined);
    caslCacheService.invalidateUsers.mockResolvedValue(undefined);

    const effectivePermissionsService = mockDeep<EffectivePermissionsService>();
    effectivePermissionsService.resolveForUser.mockResolvedValue({ permissions, holdsAllManage });

    const mentorshipsRepository = mockDeep<MentorshipsRepository>();
    mentorshipsRepository.findDescendantUserIds.mockResolvedValue(SUBTREE_USER_IDS);
    mentorshipsRepository.findAncestorUserIds.mockResolvedValue(ANCESTOR_USER_IDS);

    return {
      caslCacheService,
      effectivePermissionsService,
      mentorshipsRepository,
      factory: new CaslAbilityFactory(
        caslCacheService,
        effectivePermissionsService,
        mentorshipsRepository,
      ),
    };
  };

  const cachedRulesFrom = (caslCacheService: { setRules: { mock: { calls: unknown[][] } } }) =>
    caslCacheService.setRules.mock.calls[0][1] as TAppRawRule[];

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
      const { factory, effectivePermissionsService, mentorshipsRepository } = buildFactory(
        [],
        [{ action: EPermission.READ, subject: EResource.USER }],
      );

      const ability = await factory.createForUser(ABILITY_CONTEXT);

      expect(ability.can(EPermission.READ, EResource.USER)).toBe(true);
      expect(effectivePermissionsService.resolveForUser).not.toHaveBeenCalled();
      expect(mentorshipsRepository.findDescendantUserIds).not.toHaveBeenCalled();
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
      const { factory, caslCacheService, mentorshipsRepository } = buildFactory([
        readUserPermission(),
      ]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(mentorshipsRepository.findDescendantUserIds).not.toHaveBeenCalled();
      expect(cachedRulesFrom(caslCacheService)[0].conditions).toBeUndefined();
    });

    it("queries the hierarchy once, at the configured depth, when one is", async () => {
      const { factory, mentorshipsRepository } = buildFactory([
        readUserPermission(),
        updateUserSubtreePermission(),
      ]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(mentorshipsRepository.findDescendantUserIds).toHaveBeenCalledExactlyOnceWith(
        USER_ID,
        MENTORSHIP_SUBTREE_MAX_DEPTH,
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
      const { factory, caslCacheService, mentorshipsRepository } = buildFactory([
        updateUserSubtreePermission(),
      ]);
      mentorshipsRepository.findDescendantUserIds.mockResolvedValue([]);

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
      const { factory, mentorshipsRepository } = buildFactory([updateUserSubtreePermission()]);

      await factory.createForUser(ABILITY_CONTEXT);

      expect(mentorshipsRepository.findAncestorUserIds).not.toHaveBeenCalled();
    });
  });

  describe("the manage-all holder", () => {
    it("is never scoped by a condition the wildcard expanded into", async () => {
      const { factory, caslCacheService, mentorshipsRepository } = buildFactory(
        [updateUserSubtreePermission()],
        null,
        true,
      );

      await factory.createForUser(ABILITY_CONTEXT);

      expect(cachedRulesFrom(caslCacheService)[0].conditions).toBeUndefined();
      expect(mentorshipsRepository.findDescendantUserIds).not.toHaveBeenCalled();
    });
  });

  describe("invalidateForMentorshipChange", () => {
    it("clears the cache for the user and everyone above and below them", async () => {
      const { factory, caslCacheService } = buildFactory([]);

      await factory.invalidateForMentorshipChange(USER_ID);

      expect(caslCacheService.invalidateUsers).toHaveBeenCalledExactlyOnceWith([
        USER_ID,
        ...ANCESTOR_USER_IDS,
        ...SUBTREE_USER_IDS,
      ]);
    });
  });
});
