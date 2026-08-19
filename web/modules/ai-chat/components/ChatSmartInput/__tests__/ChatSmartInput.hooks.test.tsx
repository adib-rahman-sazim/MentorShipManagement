import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";

import { useChatSmartInput } from "../ChatSmartInput.hooks";

const mockComplete = vi.fn();
const mockStopCompletion = vi.fn();
let capturedOnError: (() => void) | undefined;

vi.mock("@ai-sdk/react", () => ({
  useCompletion: (opts: { onError?: () => void }) => {
    capturedOnError = opts.onError;
    return {
      complete: mockComplete,
      stop: mockStopCompletion,
    };
  },
}));
vi.mock("@/shared/utils/auth", () => ({
  getAuthToken: () => "test-token",
}));

vi.mock("@/modules/ai-chat/ai-chat.constants", () => ({
  AI_SDK_COMPLETION_API_PATH: "ai-sdk/completion",
}));

vi.mock("@/shared/constants/env.constants", () => ({
  API_BASE_URL: "http://localhost:3000",
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.useFakeTimers();

describe("useChatSmartInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it("should return expected shape", () => {
    const { result } = renderHook(() => useChatSmartInput());

    expect(result.current.ghostText).toBe("");
    expect(result.current.mirrorRef).toBeDefined();
    expect(result.current.handleChange).toBeTypeOf("function");
    expect(result.current.handleKeyDown).toBeTypeOf("function");
    expect(result.current.handleScroll).toBeTypeOf("function");
    expect(result.current.handleSubmit).toBeTypeOf("function");
  });

  it("handleChange should call onChange and clear ghostText", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();

    act(() => {
      result.current.handleChange("hello", onChange);
    });

    expect(onChange).toHaveBeenCalledWith("hello");
    expect(result.current.ghostText).toBe("");
  });

  it("handleChange should stop completion and clear debounce", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();

    act(() => {
      result.current.handleChange("hello", onChange);
    });

    expect(mockStopCompletion).toHaveBeenCalled();
  });

  it("handleChange should trigger debounced completion for non-empty text", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();

    act(() => {
      result.current.handleChange("hello", onChange);
    });

    expect(mockComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockComplete).toHaveBeenCalledWith("hello", {
      body: { prompt: "hello" },
      headers: { Authorization: "Bearer test-token" },
    });
  });

  it("handleChange should not trigger completion for empty text", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();

    act(() => {
      result.current.handleChange("   ", onChange);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("handleKeyDown Tab should append ghostText to value", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();
    const preventDefault = vi.fn();

    const event = {
      key: "Tab",
      preventDefault,
      currentTarget: { form: { requestSubmit: vi.fn() } },
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(event, "hello", " world", false, onChange);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith("hello world");
    expect(mockStopCompletion).toHaveBeenCalled();
  });

  it("handleKeyDown Tab should do nothing when no ghostText", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();
    const preventDefault = vi.fn();

    const event = {
      key: "Tab",
      preventDefault,
      currentTarget: { form: { requestSubmit: vi.fn() } },
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(event, "hello", "", false, onChange);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("handleKeyDown Escape should clear ghostText", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();
    const preventDefault = vi.fn();

    const event = {
      key: "Escape",
      preventDefault,
      currentTarget: { form: { requestSubmit: vi.fn() } },
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(event, "hello", " world", false, onChange);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.ghostText).toBe("");
    expect(mockStopCompletion).toHaveBeenCalled();
  });

  it("handleKeyDown Enter should submit when value is non-empty and not loading", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();
    const requestSubmit = vi.fn();
    const preventDefault = vi.fn();

    const event = {
      key: "Enter",
      preventDefault,
      currentTarget: { form: { requestSubmit } },
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(event, "hello", "", false, onChange);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(requestSubmit).toHaveBeenCalled();
  });

  it("handleKeyDown Enter should not submit when loading", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();
    const requestSubmit = vi.fn();
    const preventDefault = vi.fn();

    const event = {
      key: "Enter",
      preventDefault,
      currentTarget: { form: { requestSubmit } },
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(event, "hello", "", true, onChange);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("handleKeyDown Enter should not submit when value is empty", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onChange = vi.fn();
    const requestSubmit = vi.fn();
    const preventDefault = vi.fn();

    const event = {
      key: "Enter",
      preventDefault,
      currentTarget: { form: { requestSubmit } },
    } as unknown as React.KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleKeyDown(event, "   ", "", false, onChange);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("handleSubmit should clear debounce, ghostText, stop completion and call onSubmit", () => {
    const { result } = renderHook(() => useChatSmartInput());
    const onSubmit = vi.fn();
    const preventDefault = vi.fn();

    const event = {
      preventDefault,
    } as unknown as React.FormEvent;

    act(() => {
      result.current.handleChange("hello", vi.fn());
    });

    act(() => {
      result.current.handleSubmit(event, onSubmit);
    });

    expect(result.current.ghostText).toBe("");
    expect(mockStopCompletion).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(event);
  });

  it("should clear ghostText when onError is triggered", () => {
    renderHook(() => useChatSmartInput());

    act(() => {
      capturedOnError?.();
    });

    expect(toast.error).toHaveBeenCalledWith("errorAutoComplete");
  });
});
