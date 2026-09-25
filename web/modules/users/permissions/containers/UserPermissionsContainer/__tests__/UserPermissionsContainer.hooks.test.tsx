import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import {
  ADDED,
  FROM_ROLE,
  NOT_HELD,
} from "@/modules/users/permissions/__tests__/permissions.fixtures";
import { TOAST_MESSAGE_PERMISSIONS_SAVE_FAILED } from "@/modules/users/permissions/containers/UserPermissionsContainer/UserPermissionsContainer.constants";
import { useUserPermissionsForm } from "@/modules/users/permissions/containers/UserPermissionsContainer/UserPermissionsContainer.hooks";
import { IUseUserPermissionsFormParams } from "@/modules/users/permissions/containers/UserPermissionsContainer/UserPermissionsContainer.interfaces";
import {
  EPermissionOverrideEffect,
  EUserRole,
  IUserPermissionOverridesResponse,
} from "@/shared/typedefs";

const { mockReplace, mockUnwrap, mockToastError } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockUnwrap: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("@/shared/redux/rtk-apis/permissions/permissions.api", () => ({
  useReplaceUserPermissionOverridesMutation: () => [mockReplace],
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

const USER_ID = "user-id";
const FROM_ROLE_FIELD = `access.${FROM_ROLE.code}` as const;
const REJECTION_MESSAGE = "The superadmin's permissions cannot be changed.";

const buildOverrides = (
  permissions = [FROM_ROLE, NOT_HELD, ADDED],
): IUserPermissionOverridesResponse => ({
  userId: USER_ID,
  role: EUserRole.MENTOR,
  editable: true,
  permissions,
});

function renderUserPermissionsForm(initialProps: IUseUserPermissionsFormParams) {
  return renderHook((props: IUseUserPermissionsFormParams) => useUserPermissionsForm(props), {
    initialProps,
  });
}

describe("useUserPermissionsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReplace.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("saves the full override list", async () => {
    mockUnwrap.mockResolvedValue(buildOverrides());
    const { result } = renderUserPermissionsForm({ userId: USER_ID, overrides: buildOverrides() });

    await act(async () => {
      await result.current.onSubmit({
        access: { [FROM_ROLE.code]: false, [NOT_HELD.code]: true, [ADDED.code]: true },
      });
    });

    expect(mockReplace).toHaveBeenCalledWith({
      userId: USER_ID,
      overrides: [
        { permissionCode: FROM_ROLE.code, effect: EPermissionOverrideEffect.REVOKE },
        { permissionCode: NOT_HELD.code, effect: EPermissionOverrideEffect.ALLOW },
        { permissionCode: ADDED.code, effect: EPermissionOverrideEffect.ALLOW },
      ],
    });
  });

  it("shows the server's message and keeps the unsaved changes when rejected", async () => {
    mockUnwrap.mockRejectedValue({
      status: 403,
      data: { statusCode: 403, message: REJECTION_MESSAGE },
    });
    const { result } = renderUserPermissionsForm({ userId: USER_ID, overrides: buildOverrides() });

    act(() => {
      result.current.form.setValue(FROM_ROLE_FIELD, false);
    });

    await act(async () => {
      await result.current.onSubmit(result.current.form.getValues());
    });

    expect(mockToastError).toHaveBeenCalledWith(TOAST_MESSAGE_PERMISSIONS_SAVE_FAILED, {
      description: REJECTION_MESSAGE,
    });
    expect(result.current.pendingChangeCount).toBe(1);
  });

  it("resets to what the server stored once the saved record arrives", () => {
    const { result, rerender } = renderUserPermissionsForm({
      userId: USER_ID,
      overrides: buildOverrides(),
    });

    act(() => {
      result.current.form.setValue(FROM_ROLE_FIELD, false);
    });

    rerender({
      userId: USER_ID,
      overrides: buildOverrides([{ ...FROM_ROLE, effective: false }, NOT_HELD, ADDED]),
    });

    expect(result.current.pendingChangeCount).toBe(0);
    expect(result.current.form.getValues(FROM_ROLE_FIELD)).toBe(false);
  });
});
