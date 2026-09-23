import { ForbiddenException, NotFoundException } from "@nestjs/common";

import type { MikroORM } from "@mikro-orm/postgresql";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { Role } from "@/common/entities/roles.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { AllManageHolderService } from "@/modules/permissions/all-manage-holder.service";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import { GetUserPermissionOverridesInteractor } from "@/modules/permissions/interactors/get-user-permission-overrides.interactor";
import { PERMISSION_OVERRIDE_ERROR_MESSAGES } from "@/modules/permissions/permissions.constants";
import type { UserPermissionOverridesResponse } from "@/modules/permissions/permissions.dtos";
import { PermissionsSerializer } from "@/modules/permissions/permissions.serializer";
import { UsersRepository } from "@/modules/users/users.repository";
import { UserFactory } from "@/test/utils/factories/users.factory";
import { createOfflineOrm } from "@/test/utils/helpers/offline-orm.helpers";

const TARGET_USER_ID = "11111111-1111-4111-8111-111111111111";
const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
const MENTOR_ROLE_ID = "33333333-3333-4333-8333-333333333333";

describe("GetUserPermissionOverridesInteractor", () => {
  let orm: MikroORM;
  let userFactory: UserFactory;

  let usersRepository: DeepMockProxy<UsersRepository>;
  let allManageHolderService: DeepMockProxy<AllManageHolderService>;
  let effectivePermissionsService: DeepMockProxy<EffectivePermissionsService>;
  let permissionsSerializer: DeepMockProxy<PermissionsSerializer>;
  let interactor: GetUserPermissionOverridesInteractor;

  const makeUser = (): User =>
    userFactory.makeEntity({
      id: TARGET_USER_ID,
      email: "target@sazim.io",
      name: "Target User",
      role: orm.em.merge(Role, { id: MENTOR_ROLE_ID, code: EUserRole.MENTOR, name: "Mentor" }),
    });

  const buildContext = () => ({
    userId: TARGET_USER_ID,
    actorId: ACTOR_ID,
    actorRole: EUserRole.SUPERADMIN,
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
    allManageHolderService = mockDeep<AllManageHolderService>();
    effectivePermissionsService = mockDeep<EffectivePermissionsService>();
    permissionsSerializer = mockDeep<PermissionsSerializer>();

    effectivePermissionsService.resolveCodesForUser.mockResolvedValue({
      allPermissions: [],
      effectiveCodes: [],
      grantedCodes: [],
      revokedCodes: [],
      holdsAllManage: false,
    });
    permissionsSerializer.serializeUserPermissions.mockReturnValue(
      {} as UserPermissionOverridesResponse,
    );

    interactor = new GetUserPermissionOverridesInteractor(
      usersRepository,
      allManageHolderService,
      effectivePermissionsService,
      permissionsSerializer,
    );
  });

  afterEach(() => {
    orm.em.clear();
    vi.clearAllMocks();
  });

  it("resolves the target's permissions against the target's own role", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValue(true);
    usersRepository.findById.mockResolvedValue(makeUser());

    await interactor.execute(buildContext());

    expect(effectivePermissionsService.resolveCodesForUser).toHaveBeenCalledWith({
      userId: TARGET_USER_ID,
      role: EUserRole.MENTOR,
    });
  });

  it("reads the superadmin's own record without rejecting it", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValue(true);
    usersRepository.findById.mockResolvedValue(makeUser());

    await expect(interactor.execute(buildContext())).resolves.toBeDefined();
  });

  it("rejects an actor that does not hold all:manage", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValue(false);

    await expect(interactor.execute(buildContext())).rejects.toThrow(
      new ForbiddenException(PERMISSION_OVERRIDE_ERROR_MESSAGES.ACTOR_NOT_SUPERADMIN),
    );

    expect(usersRepository.findById).not.toHaveBeenCalled();
  });

  it("rejects an unknown target user", async () => {
    allManageHolderService.holdsAllManage.mockResolvedValue(true);
    usersRepository.findById.mockResolvedValue(null);

    await expect(interactor.execute(buildContext())).rejects.toThrow(
      new NotFoundException(PERMISSION_OVERRIDE_ERROR_MESSAGES.TARGET_USER_NOT_FOUND),
    );

    expect(effectivePermissionsService.resolveCodesForUser).not.toHaveBeenCalled();
  });
});
