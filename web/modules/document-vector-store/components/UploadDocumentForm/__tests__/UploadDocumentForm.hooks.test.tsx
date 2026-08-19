import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { useUploadDocumentForm } from "../UploadDocumentForm.hooks";

vi.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/shared/redux/rtk-apis/document-vector-store/document-vector-store.api", () => ({
  useUploadDocumentMutation: () => [vi.fn().mockResolvedValue(undefined)],
}));

vi.mock("@/shared/redux/rtk-apis/file-uploads/file-uploads.api", () => ({
  useGetPresignedUrlMutation: () => [
    vi.fn().mockResolvedValue([{ signedUrl: "https://example.com/presigned" }]),
  ],
}));

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit: (fn: unknown) => fn,
    reset: vi.fn(),
    getValues: () => ({ file: null }),
    formState: { errors: {} },
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useUploadDocumentForm", () => {
  it("should return form and onSubmit", () => {
    const { result } = renderHook(() => useUploadDocumentForm());

    expect(result.current.form).toBeDefined();
    expect(result.current.onSubmit).toBeDefined();
  });

  it("should have initial values set in form", () => {
    const { result } = renderHook(() => useUploadDocumentForm());

    const values = result.current.form.getValues();

    expect(values.file).toBeNull();
  });
});
