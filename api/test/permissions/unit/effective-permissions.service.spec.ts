import type { MikroORM } from "@mikro-orm/postgresql";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { Permission } from "@/common/entities/permissions.entity";
import type { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import { ALL_MANAGE_PERMISSION_CODE } from "@/modules/permissions/permissions.catalog.constants";
import {
  EPermission,
  EPermissionCode,
  EPermissionConditionType,
  EPermissionOverrideEffect,
  EResource,
} from "@/modules/permissions/permissions.enums";
import { PermissionsRepository } from "@/modules/permissions/permissions.repository";
import { RolePermissionsRepository } from "@/modules/permissions/role-permissions.repository";
import { UserPermissionOverridesRepository } from "@/modules/permissions/user-permission-overrides.repository";
import { createOfflineOrm } from "@/test/utils/helpers/offline-orm.helpers";

const SUBJECT_USER_ID = "33333333-3333-4333-8333-333333333333";
const USER_READ_CODE = EPermissionCode.CAN_READ_USER;
const USER_UPDATE_CODE = EPermissionCode.CAN_UPDATE_USER;
const USER_DELETE_CODE = EPermissionCode.CAN_DELETE_USER;

describe("EffectivePermissionsService", () => {
  let orm: MikroORM;
  let permissionsRepository: DeepMockProxy<PermissionsRepository>;
  let rolePermissionsRepository: DeepMockProxy<RolePermissionsRepository>;
  let userPermissionOverridesRepository: DeepMockProxy<UserPermissionOverridesRepository>;
  let service: EffectivePermissionsService;

  const makePermission = (
    code: string,
    action: EPermission,
    resource = EResource.USER,
  ): Permission =>
    orm.em.create(
      Permission,
      {
        code,
        resource,
        action,
        conditionType: EPermissionConditionType.NONE,
        denied: false,
        description: null,
      },
      { persist: false },
    );

  const makeOverride = (
    permission: Permission,
    effect: EPermissionOverrideEffect,
  ): UserPermissionOverride => ({ permission, effect }) as UserPermissionOverride;

  const arrangeRepositories = (options: {
    allPermissions: Permission[];
    rolePermissions: Permission[];
    overrides?: UserPermissionOverride[];
  }): void => {
    permissionsRepository.findAllPermissions.mockResolvedValue(options.allPermissions);
    rolePermissionsRepository.findPermissionsByRoleCode.mockResolvedValue(options.rolePermissions);
    userPermissionOverridesRepository.findLiveByUserId.mockResolvedValue(options.overrides ?? []);
  };

  const resolveCodes = async (role = EUserRole.MENTEE): Promise<string[]> => {
    const permissions = await service.resolveForUser({ userId: SUBJECT_USER_ID, role });

    return permissions.map((permission) => permission.code);
  };

  beforeAll(() => {
    orm = createOfflineOrm();
  });

  afterAll(async () => {
    await orm.close(true);
  });

  beforeEach(() => {
    permissionsRepository = mockDeep<PermissionsRepository>();
    rolePermissionsRepository = mockDeep<RolePermissionsRepository>();
    userPermissionOverridesRepository = mockDeep<UserPermissionOverridesRepository>();
    service = new EffectivePermissionsService(
      permissionsRepository,
      rolePermissionsRepository,
      userPermissionOverridesRepository,
    );
  });

  afterEach(() => {
    orm.em.clear();
    vi.clearAllMocks();
  });

  it("reads the role's permissions and the user's overrides from the database", async () => {
    const read = makePermission(USER_READ_CODE, EPermission.READ);
    arrangeRepositories({ allPermissions: [read], rolePermissions: [read] });

    const codes = await resolveCodes();

    expect(rolePermissionsRepository.findPermissionsByRoleCode).toHaveBeenCalledWith(
      EUserRole.MENTEE,
    );
    expect(userPermissionOverridesRepository.findLiveByUserId).toHaveBeenCalledWith(
      SUBJECT_USER_ID,
    );
    expect(codes).toEqual([USER_READ_CODE]);
  });

  it("applies a granted override on top of the role's permissions", async () => {
    const read = makePermission(USER_READ_CODE, EPermission.READ);
    const update = makePermission(USER_UPDATE_CODE, EPermission.UPDATE);
    arrangeRepositories({
      allPermissions: [read, update],
      rolePermissions: [read],
      overrides: [makeOverride(update, EPermissionOverrideEffect.ALLOW)],
    });

    expect(await resolveCodes()).toEqual([USER_READ_CODE, USER_UPDATE_CODE].sort());
  });

  it("drops a revoked permission the role otherwise grants", async () => {
    const read = makePermission(USER_READ_CODE, EPermission.READ);
    arrangeRepositories({
      allPermissions: [read],
      rolePermissions: [read],
      overrides: [makeOverride(read, EPermissionOverrideEffect.REVOKE)],
    });

    expect(await resolveCodes()).toEqual([]);
  });

  it("expands manage-everything and honours a revoke against it", async () => {
    const manage = makePermission(ALL_MANAGE_PERMISSION_CODE, EPermission.MANAGE, EResource.ALL);
    const read = makePermission(USER_READ_CODE, EPermission.READ);
    const remove = makePermission(USER_DELETE_CODE, EPermission.DELETE);
    arrangeRepositories({
      allPermissions: [manage, read, remove],
      rolePermissions: [manage],
      overrides: [makeOverride(remove, EPermissionOverrideEffect.REVOKE)],
    });

    const codes = await resolveCodes(EUserRole.SUPERADMIN);

    expect(codes).toEqual([USER_READ_CODE]);
    expect(codes).not.toContain(ALL_MANAGE_PERMISSION_CODE);
  });

  it("returns entities for the resolved codes only", async () => {
    const read = makePermission(USER_READ_CODE, EPermission.READ);
    const update = makePermission(USER_UPDATE_CODE, EPermission.UPDATE);
    arrangeRepositories({ allPermissions: [read, update], rolePermissions: [read] });

    const permissions = await service.resolveForUser({
      userId: SUBJECT_USER_ID,
      role: EUserRole.MENTEE,
    });

    expect(permissions).toHaveLength(1);
    expect(permissions[0]).toBe(read);
  });
});
