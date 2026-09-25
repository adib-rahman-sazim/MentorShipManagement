import { ForbiddenException, NotFoundException } from "@nestjs/common";

import type { EntityManager, MikroORM } from "@mikro-orm/postgresql";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import type { Permission } from "@/common/entities/permissions.entity";
import { Role } from "@/common/entities/roles.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { AllManageHolderService } from "@/modules/permissions/all-manage-holder.service";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import { ReplaceUserPermissionOverridesInteractor } from "@/modules/permissions/interactors/replace-user-permission-overrides.interactor";
import { PERMISSION_OVERRIDE_ERROR_MESSAGES } from "@/modules/permissions/permissions.constants";
import type {
  ReplaceUserPermissionOverridesDto,
  UserPermissionOverridesResponse,
} from "@/modules/permissions/permissions.dtos";
import {
  EPermissionCode,
  EPermissionOverrideEffect,
} from "@/modules/permissions/permissions.enums";
import { PermissionsRepository } from "@/modules/permissions/permissions.repository";
import { PermissionsSerializer } from "@/modules/permissions/permissions.serializer";
import { UserPermissionOverridesRepository } from "@/modules/permissions/user-permission-overrides.repository";
import { UsersRepository } from "@/modules/users/users.repository";
import { UserFactory } from "@/test/utils/factories/users.factory";
import { createOfflineOrm } from "@/test/utils/helpers/offline-orm.helpers";

const TARGET_USER_ID = "11111111-1111-4111-8111-111111111111";
const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
const MENTOR_ROLE_ID = "33333333-3333-4333-8333-333333333333";
const OVERRIDE_REASON = "Covering the team lead during leave";

describe("ReplaceUserPermissionOverridesInteractor", () => {
  let orm: MikroORM;
  let userFactory: UserFactory;

  let usersRepository: DeepMockProxy<UsersRepository>;
  let permissionsRepository: DeepMockProxy<PermissionsRepository>;
  let overridesRepository: DeepMockProxy<UserPermissionOverridesRepository>;
  let allManageHolderService: DeepMockProxy<AllManageHolderService>;
  let effectivePermissionsService: DeepMockProxy<EffectivePermissionsService>;
  let permissionsSerializer: DeepMockProxy<PermissionsSerializer>;
  let caslCacheService: DeepMockProxy<CaslCacheService>;
  let entityManager: DeepMockProxy<EntityManager>;
  let interactor: ReplaceUserPermissionOverridesInteractor;

  const buildDto = (
    overrides: Partial<ReplaceUserPermissionOverridesDto> = {},
  ): ReplaceUserPermissionOverridesDto => ({
    overrides: [
      {
        permissionCode: EPermissionCode.CAN_UPDATE_USER,
        effect: EPermissionOverrideEffect.ALLOW,
      },
    ],
    reason: OVERRIDE_REASON,
    ...overrides,
  });

  const makeRole = () =>
    orm.em.merge(Role, { id: MENTOR_ROLE_ID, code: EUserRole.MENTOR, name: "Mentor" });

  const makeUser = (): User =>
    userFactory.makeEntity({
      id: TARGET_USER_ID,
      email: "target@sazim.io",
      name: "Target User",
      role: makeRole(),
    });

  const makePermission = (code: EPermissionCode): Permission => ({ code }) as Permission;

  const buildContext = (dto = buildDto()) => ({
    userId: TARGET_USER_ID,
    actorId: ACTOR_ID,
    actorRole: EUserRole.SUPERADMIN,
    dto,
  });

  beforeAll(() => {
    orm = createOfflineOrm();
    userFactory = new UserFactory(orm.em);
  });

  afterAll(async () => {
    await orm.close();
  });

  beforeEach(() => {
    usersRepository = mockDeep<UsersRepository>();
    permissionsRepository = mockDeep<PermissionsRepository>();
    overridesRepository = mockDeep<UserPermissionOverridesRepository>();
    allManageHolderService = mockDeep<AllManageHolderService>();
    effectivePermissionsService = mockDeep<EffectivePermissionsService>();
    permissionsSerializer = mockDeep<PermissionsSerializer>();
    caslCacheService = mockDeep<CaslCacheService>();
    entityManager = mockDeep<EntityManager>();

    overridesRepository.transactional.mockImplementation((callback) => callback(entityManager));
    effectivePermissionsService.resolveCodesForUser.mockResolvedValue({
      allPermissions: [],
      roleCodes: [],
      effectiveCodes: [],
      grantedCodes: [],
      revokedCodes: [],
      holdsAllManage: false,
    });
    permissionsSerializer.serializeUserPermissions.mockReturnValue(
      {} as UserPermissionOverridesResponse,
    );

    interactor = new ReplaceUserPermissionOverridesInteractor(
      usersRepository,
      permissionsRepository,
      overridesRepository,
      allManageHolderService,
      effectivePermissionsService,
      permissionsSerializer,
      caslCacheService,
    );
  });

  afterEach(() => {
    orm.em.clear();
    vi.clearAllMocks();
  });

  const arrangeWritableTarget = () => {
    const user = makeUser();

    allManageHolderService.holdsAllManage.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    usersRepository.findById.mockResolvedValue(user);
    permissionsRepository.findAllPermissions.mockResolvedValue([
      makePermission(EPermissionCode.CAN_UPDATE_USER),
    ]);

    return { user };
  };

  it("replaces the live overrides and records the reason", async () => {
    const { user } = arrangeWritableTarget();

    await interactor.execute(buildContext());

    expect(overridesRepository.softDeleteLiveByUserId).toHaveBeenCalledWith(
      TARGET_USER_ID,
      entityManager,
    );
    expect(overridesRepository.createOverride).toHaveBeenCalledWith(
      {
        user,
        permission: expect.objectContaining({ code: EPermissionCode.CAN_UPDATE_USER }),
        effect: EPermissionOverrideEffect.ALLOW,
        reason: OVERRIDE_REASON,
      },
      entityManager,
    );
  });

  it("invalidates the target's CASL cache after the write commits", async () => {
    arrangeWritableTarget();

    await interactor.execute(buildContext());

    expect(caslCacheService.invalidateUser).toHaveBeenCalledWith(TARGET_USER_ID);
  });

  it("rejects an actor that does not hold all:manage", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValueOnce(false);

    await expect(interactor.execute(buildContext())).rejects.toThrow(
      new ForbiddenException(PERMISSION_OVERRIDE_ERROR_MESSAGES.ACTOR_NOT_SUPERADMIN),
    );

    expect(overridesRepository.transactional).not.toHaveBeenCalled();
  });

  it("rejects every write against a target that holds all:manage", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
    usersRepository.findById.mockResolvedValue(makeUser());

    await expect(interactor.execute(buildContext())).rejects.toThrow(
      new ForbiddenException(PERMISSION_OVERRIDE_ERROR_MESSAGES.SUPERADMIN_NOT_EDITABLE),
    );

    expect(overridesRepository.softDeleteLiveByUserId).not.toHaveBeenCalled();
    expect(overridesRepository.createOverride).not.toHaveBeenCalled();
  });

  it("rejects a revoke against the superadmin, not only a revoke of all:manage", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
    usersRepository.findById.mockResolvedValue(makeUser());

    const dto = buildDto({
      overrides: [
        {
          permissionCode: EPermissionCode.CAN_UPDATE_PERMISSION,
          effect: EPermissionOverrideEffect.REVOKE,
        },
      ],
    });

    await expect(interactor.execute(buildContext(dto))).rejects.toThrow(
      new ForbiddenException(PERMISSION_OVERRIDE_ERROR_MESSAGES.SUPERADMIN_NOT_EDITABLE),
    );
  });

  it("rejects an unknown target user", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValueOnce(true);
    usersRepository.findById.mockResolvedValue(null);

    await expect(interactor.execute(buildContext())).rejects.toThrow(NotFoundException);

    expect(caslCacheService.invalidateUser).not.toHaveBeenCalled();
  });

  it("rejects an unknown permission code", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    usersRepository.findById.mockResolvedValue(makeUser());
    permissionsRepository.findAllPermissions.mockResolvedValue([]);

    await expect(interactor.execute(buildContext())).rejects.toThrow(NotFoundException);
  });

  it("clears the previous overrides when the new list is empty", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    usersRepository.findById.mockResolvedValue(makeUser());
    permissionsRepository.findAllPermissions.mockResolvedValue([]);

    await interactor.execute(buildContext(buildDto({ overrides: [] })));

    expect(overridesRepository.softDeleteLiveByUserId).toHaveBeenCalledWith(
      TARGET_USER_ID,
      entityManager,
    );
    expect(overridesRepository.createOverride).not.toHaveBeenCalled();
  });
});
