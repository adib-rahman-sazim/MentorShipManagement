import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { TOAST_MESSAGE_USER_ROLE_UPDATE_FAILED } from "@/modules/users/components/ChangeUserRoleForm/ChangeUserRoleForm.constants";
import { useChangeUserRoleForm } from "@/modules/users/components/ChangeUserRoleForm/ChangeUserRoleForm.hooks";
import { IUseChangeUserRoleFormParams } from "@/modules/users/components/ChangeUserRoleForm/ChangeUserRoleForm.interfaces";
import { EUserRole } from "@/shared/typedefs";

const { mockUpdateUser, mockUnwrap, mockToastError } = vi.hoisted(() => ({
  mockUpdateUser: vi.fn(),
  mockUnwrap: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("@/shared/redux/rtk-apis/users/users.api", () => ({
  useUpdateUserMutation: () => [mockUpdateUser],
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

const FIRST_USER_ID = "first-user-id";
const SECOND_USER_ID = "second-user-id";

function renderChangeUserRoleForm(initialProps: IUseChangeUserRoleFormParams) {
  return renderHook((props: IUseChangeUserRoleFormParams) => useChangeUserRoleForm(props), {
    initialProps,
  });
}

describe("useChangeUserRoleForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUser.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("discards the previous pick when opened for another user with the same role", () => {
    const { result, rerender } = renderChangeUserRoleForm({
      userId: FIRST_USER_ID,
      currentRole: EUserRole.MENTOR,
      isOpen: true,
    });

    act(() => {
      result.current.form.setValue("role", EUserRole.MENTEE);
    });

    rerender({ userId: FIRST_USER_ID, currentRole: EUserRole.MENTOR, isOpen: false });
    rerender({ userId: SECOND_USER_ID, currentRole: EUserRole.MENTOR, isOpen: true });

    expect(result.current.form.getValues("role")).toBe(EUserRole.MENTOR);
  });

  it("sends the selected role and closes on success", async () => {
    mockUnwrap.mockResolvedValue({});
    const onSuccess = vi.fn();
    const { result } = renderChangeUserRoleForm({
      userId: FIRST_USER_ID,
      currentRole: EUserRole.MENTOR,
      isOpen: true,
      onSuccess,
    });

    await act(async () => {
      await result.current.onSubmit({ role: EUserRole.MENTEE });
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({ id: FIRST_USER_ID, role: EUserRole.MENTEE });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows an error toast and stays open when rejected", async () => {
    mockUnwrap.mockRejectedValue({});
    const onSuccess = vi.fn();
    const { result } = renderChangeUserRoleForm({
      userId: FIRST_USER_ID,
      currentRole: EUserRole.MENTOR,
      isOpen: true,
      onSuccess,
    });

    await act(async () => {
      await result.current.onSubmit({ role: EUserRole.MENTEE });
    });

    expect(mockToastError).toHaveBeenCalledWith(
      TOAST_MESSAGE_USER_ROLE_UPDATE_FAILED,
      expect.any(Object),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
