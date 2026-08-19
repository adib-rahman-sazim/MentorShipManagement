import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

const mockUnwrap = vi.fn();
const mockQueryDocument = vi.fn().mockReturnValue({ unwrap: mockUnwrap });

vi.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/shared/redux/rtk-apis/document-vector-store/document-vector-store.api", () => ({
  useQueryDocumentMutation: () => [mockQueryDocument, { isLoading: false }],
}));

vi.mock("react-hook-form", () => ({
  useForm: () => {
    const formValues = { query: "", maxResults: 5 };
    return {
      handleSubmit: (fn: (values: { query: string; maxResults: number }) => Promise<void>) => () =>
        fn(formValues),
      reset: vi.fn(),
      getValues: () => formValues,
      formState: { errors: {} },
    };
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

import { useQueryDocumentForm } from "../QueryDocumentForm.hooks";

describe("useQueryDocumentForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockQueryDocument.mockReturnValue({ unwrap: mockUnwrap });
  });

  it("should return form, onSubmit, isLoading, results, and hasSearched", () => {
    const { result } = renderHook(() => useQueryDocumentForm({}));

    expect(result.current.form).toBeDefined();
    expect(result.current.onSubmit).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toEqual([]);
    expect(result.current.hasSearched).toBe(false);
  });

  it("should have initial values set in form", () => {
    const { result } = renderHook(() => useQueryDocumentForm({}));

    const values = result.current.form.getValues();

    expect(values.query).toBe("");
    expect(values.maxResults).toBe(5);
  });

  it("should set results and hasSearched on successful submit", async () => {
    const mockResults = [{ id: "1", content: "result" }];
    mockUnwrap.mockResolvedValueOnce({ results: mockResults });

    const onResults = vi.fn();
    const { result } = renderHook(() => useQueryDocumentForm({ onResults }));

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.results).toEqual(mockResults);
    expect(result.current.hasSearched).toBe(true);
    expect(onResults).toHaveBeenCalledWith(mockResults);
  });

  it("should show toast error on failed submit", async () => {
    mockUnwrap.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useQueryDocumentForm({}));

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(toast.error).toHaveBeenCalledWith("queryFailed");
    expect(result.current.hasSearched).toBe(false);
  });
});
