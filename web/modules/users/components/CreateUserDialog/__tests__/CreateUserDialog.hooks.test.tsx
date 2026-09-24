import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { EUserRole, EUserState } from "@/shared/typedefs";

import { TOAST_MESSAGE_USER_CREATE_FAILED } from "../CreateUserDialog.constants";
import { useCreateUserForm } from "../CreateUserDialog.hooks";

const { mockCreateUser, mockUnwrap, mockToastError } = vi.hoisted(() => ({
  mockCreateUser: vi.fn(),
  mockUnwrap: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("@/shared/redux/rtk-apis/users/users.api", () => ({
  useCreateUserMutation: () => [mockCreateUser],
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: mockToastError },
}));

const VALID_VALUES = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "correct-horse",
  role: EUserRole.SENSEI,
  state: EUserState.ACTIVE,
};

const CONFLICT_STATUS = 409;
const CONFLICT_MESSAGE = "A user with this email already exists";

async function submitValidForm() {
  const onSuccess = vi.fn();
  const { result } = renderHook(() => useCreateUserForm({ onSuccess }));

  await act(async () => {
    result.current.form.reset(VALID_VALUES);
  });

  await act(async () => {
    await result.current.onSubmit();
  });

  return onSuccess;
}

describe("useCreateUserForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUser.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("posts the form values and closes on success", async () => {
    mockUnwrap.mockResolvedValue({});

    const onSuccess = await submitValidForm();

    expect(mockCreateUser).toHaveBeenCalledWith(VALID_VALUES);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows the server's message and stays open when rejected", async () => {
    mockUnwrap.mockRejectedValue({
      status: CONFLICT_STATUS,
      data: { statusCode: CONFLICT_STATUS, message: CONFLICT_MESSAGE },
    });

    const onSuccess = await submitValidForm();

    expect(mockToastError).toHaveBeenCalledWith(TOAST_MESSAGE_USER_CREATE_FAILED, {
      description: CONFLICT_MESSAGE,
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
