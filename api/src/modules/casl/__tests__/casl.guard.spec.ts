import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";

import type { Request } from "express";
import { mockDeep } from "vitest-mock-extended";

import { EUserRole } from "@/common/enums/roles.enums";
import type { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import type { TAppAbility } from "@/modules/casl/casl.types";
import { EPermission, EPermissionCode, EResource } from "@/modules/permissions/permissions.enums";

const USER_ID = "00000000-0000-0000-0000-000000000001";

const SUBJECT_ID = "00000000-0000-0000-0000-0000000000a1";

const UNKNOWN_CODE = "can_do_something_undefined" as EPermissionCode;

const buildContext = (request: Partial<Request>): ExecutionContext =>
  ({
    getHandler: () => () => undefined,
    getClass: () => CaslPermissionsGuard,
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const buildGuard = (metadata: unknown, allowed: boolean) => {
  const reflector = mockDeep<Reflector>();
  reflector.getAllAndOverride.mockReturnValue(metadata);

  const ability = mockDeep<TAppAbility>();
  ability.can.mockReturnValue(allowed);

  const caslAbilityFactory = mockDeep<CaslAbilityFactory>();
  caslAbilityFactory.createForUser.mockResolvedValue(ability);

  return {
    ability,
    guard: new CaslPermissionsGuard(reflector, caslAbilityFactory),
  };
};

describe("CaslPermissionsGuard", () => {
  const request = { user: { id: USER_ID, role: EUserRole.SENSEI } } as unknown as Request;

  it("allows a handler that declares no permissions", async () => {
    const { guard } = buildGuard(undefined, false);

    await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
  });

  it("allows a handler that declares an empty permission list", async () => {
    const { guard } = buildGuard({ permissions: [] }, false);

    await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
  });

  it("resolves a permission code into its catalog resource and action", async () => {
    const { ability, guard } = buildGuard({ permissions: [EPermissionCode.CAN_LIST_USERS] }, true);

    await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
    expect(ability.can).toHaveBeenCalledWith(EPermission.LIST, EResource.USER);
  });

  it("refuses a code the ability does not grant", async () => {
    const { guard } = buildGuard({ permissions: [EPermissionCode.CAN_DELETE_USER] }, false);

    await expect(guard.canActivate(buildContext(request))).rejects.toThrow(ForbiddenException);
  });

  it("fails closed on a code missing from the catalog", async () => {
    const { ability, guard } = buildGuard({ permissions: [UNKNOWN_CODE] }, true);

    await expect(guard.canActivate(buildContext(request))).rejects.toThrow(
      `Unknown required permission: ${UNKNOWN_CODE}`,
    );
    expect(ability.can).not.toHaveBeenCalled();
  });

  it("checks the named instance when a subject param is declared", async () => {
    const { ability, guard } = buildGuard(
      { permissions: [EPermissionCode.CAN_UPDATE_USER], subjectIdParam: "id" },
      true,
    );
    const withParams = {
      user: { id: USER_ID, role: EUserRole.SENSEI },
      params: { id: SUBJECT_ID },
    } as unknown as Request;

    await expect(guard.canActivate(buildContext(withParams))).resolves.toBe(true);
    expect(ability.can).toHaveBeenCalledWith(EPermission.UPDATE, {
      __caslSubjectType__: EResource.USER,
      id: SUBJECT_ID,
    });
  });

  it("refuses a request without a known role", async () => {
    const { guard } = buildGuard({ permissions: [EPermissionCode.CAN_LIST_USERS] }, true);
    const anonymous = {} as unknown as Request;

    await expect(guard.canActivate(buildContext(anonymous))).rejects.toThrow(ForbiddenException);
  });
});
