import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import {
  TOAST_MESSAGE_PROFILE_UPDATE_FAILED,
  TOAST_MESSAGE_PROFILE_UPDATED,
} from "@/modules/settings/components/UpdateProfileInformationForm/UpdateProfileInformationForm.constants";
import { useUpdateUserProfileInformationForm } from "@/modules/settings/components/UpdateProfileInformationForm/UpdateProfileInformationForm.hooks";

const { mockUpdateUserProfile, mockUnwrap, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockUpdateUserProfile: vi.fn(),
  mockUnwrap: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("@/shared/redux/rtk-apis/user-profiles/user-profiles.api", () => ({
  useUpdateUserProfileMutation: () => [mockUpdateUserProfile],
}));

vi.mock("sonner", () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}));

const UPDATED_VALUES = { name: "Grace Hopper" };

async function submitUpdatedValues() {
  const { result } = renderHook(() => useUpdateUserProfileInformationForm());

  await act(async () => {
    await result.current.onSubmit(UPDATED_VALUES);
  });

  return result;
}

describe("useUpdateUserProfileInformationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUserProfile.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("keeps the saved values and confirms on success", async () => {
    mockUnwrap.mockResolvedValue({});

    const result = await submitUpdatedValues();

    expect(mockUpdateUserProfile).toHaveBeenCalledWith(UPDATED_VALUES);
    expect(result.current.form.getValues()).toEqual(UPDATED_VALUES);
    expect(mockToastSuccess).toHaveBeenCalledWith(TOAST_MESSAGE_PROFILE_UPDATED);
  });

  it("shows an error toast instead of confirming when rejected", async () => {
    mockUnwrap.mockRejectedValue({});

    await submitUpdatedValues();

    expect(mockToastError).toHaveBeenCalledWith(
      TOAST_MESSAGE_PROFILE_UPDATE_FAILED,
      expect.any(Object),
    );
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
