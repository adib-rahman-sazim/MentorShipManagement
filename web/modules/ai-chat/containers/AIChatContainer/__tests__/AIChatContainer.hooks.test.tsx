import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";

import { useAIChatContainer } from "../AIChatContainer.hooks";

const mockSendMessage = vi.fn();
const mockStop = vi.fn();
let mockStatus: string = "ready";
let mockMessages: unknown[] = [];
let mockError: Error | undefined;

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: mockMessages,
    sendMessage: mockSendMessage,
    stop: mockStop,
    status: mockStatus,
    error: mockError,
  }),
}));

vi.mock("ai", () => ({
  DefaultChatTransport: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@/modules/ai-chat/hooks", () => ({
  useStreamBuffer: (messages: unknown[]) => ({
    bufferedMessages: messages,
  }),
}));

vi.mock("@/shared/utils/auth", () => ({
  getAuthToken: () => "test-token",
}));

vi.mock("@/modules/ai-chat/ai-chat.constants", () => ({
  AI_SDK_CHAT_API_PATH: "ai-sdk/chat/stream",
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

describe("useAIChatContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMessage.mockResolvedValue(undefined);
    mockStatus = "ready";
    mockMessages = [];
    mockError = undefined;
  });

  it("should return expected shape", () => {
    const { result } = renderHook(() => useAIChatContainer());

    expect(result.current.input).toBe("");
    expect(result.current.bufferedMessages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.handleInputChange).toBeTypeOf("function");
    expect(result.current.handleSubmit).toBeTypeOf("function");
    expect(result.current.onStop).toBe(mockStop);
  });

  it("handleInputChange should update input", () => {
    const { result } = renderHook(() => useAIChatContainer());

    act(() => {
      result.current.handleInputChange("hello world");
    });

    expect(result.current.input).toBe("hello world");
  });

  it("handleSubmit should send message and reset input", async () => {
    const { result } = renderHook(() => useAIChatContainer());

    act(() => {
      result.current.handleInputChange("hello");
    });

    const preventDefault = vi.fn();
    const event = { preventDefault } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(mockSendMessage).toHaveBeenCalledWith({ text: "hello" });
    expect(result.current.input).toBe("");
  });

  it("handleSubmit should not send when input is empty", async () => {
    const { result } = renderHook(() => useAIChatContainer());
    const preventDefault = vi.fn();
    const event = { preventDefault } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("handleSubmit should not send when input is whitespace only", async () => {
    const { result } = renderHook(() => useAIChatContainer());

    act(() => {
      result.current.handleInputChange("   ");
    });

    const preventDefault = vi.fn();
    const event = { preventDefault } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("handleSubmit should not send when status is streaming", async () => {
    mockStatus = "streaming";

    const { result } = renderHook(() => useAIChatContainer());

    act(() => {
      result.current.handleInputChange("hello");
    });

    const preventDefault = vi.fn();
    const event = { preventDefault } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("handleSubmit should not send when status is submitted", async () => {
    mockStatus = "submitted";

    const { result } = renderHook(() => useAIChatContainer());

    act(() => {
      result.current.handleInputChange("hello");
    });

    const preventDefault = vi.fn();
    const event = { preventDefault } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("isLoading should be true when status is streaming", () => {
    mockStatus = "streaming";

    const { result } = renderHook(() => useAIChatContainer());

    expect(result.current.isLoading).toBe(true);
  });

  it("isLoading should be true when status is submitted", () => {
    mockStatus = "submitted";

    const { result } = renderHook(() => useAIChatContainer());

    expect(result.current.isLoading).toBe(true);
  });

  it("isLoading should be false when status is ready", () => {
    mockStatus = "ready";

    const { result } = renderHook(() => useAIChatContainer());

    expect(result.current.isLoading).toBe(false);
  });

  it("isLoading should be false when status is error", () => {
    mockStatus = "error";

    const { result } = renderHook(() => useAIChatContainer());

    expect(result.current.isLoading).toBe(false);
  });

  it("should expose error from useChat", () => {
    mockError = new Error("connection failed");

    const { result } = renderHook(() => useAIChatContainer());

    expect(result.current.error).toBe(mockError);
  });

  it("should expose messages as bufferedMessages", () => {
    mockMessages = [{ id: "1", role: "user", parts: [{ type: "text", text: "hi" }] }];

    const { result } = renderHook(() => useAIChatContainer());

    expect(result.current.bufferedMessages).toEqual(mockMessages);
  });

  it("should call toast.error when sendMessage fails", async () => {
    mockSendMessage.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useAIChatContainer());

    act(() => {
      result.current.handleInputChange("hello");
    });

    const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(toast.error).toHaveBeenCalledWith("errorSendMessage");
  });
});
