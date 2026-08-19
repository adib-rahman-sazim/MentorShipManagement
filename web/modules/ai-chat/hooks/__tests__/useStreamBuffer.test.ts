import { act, renderHook } from "@testing-library/react";
import { UIMessage } from "ai";

import { useStreamBuffer } from "../useStreamBuffer";

describe("useStreamBuffer", () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafIdCounter: number;
  let cancelSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rafCallbacks = new Map();
    rafIdCounter = 0;

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      const id = ++rafIdCounter;
      rafCallbacks.set(id, cb);
      return id;
    });

    cancelSpy = vi.fn((id: number) => {
      rafCallbacks.delete(id);
    });
    vi.stubGlobal("cancelAnimationFrame", cancelSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMessage = (id: string, content: string): UIMessage => ({
    id,
    role: "user",
    parts: [{ type: "text" as const, text: content }],
  });

  it("should return initial messages when not streaming", () => {
    const messages = [createMessage("1", "Hello")];

    const { result } = renderHook(() => useStreamBuffer(messages, false));

    expect(result.current.bufferedMessages).toEqual(messages);
    expect(result.current.isBuffering).toBe(false);
  });

  it("should set buffering state when streaming starts", () => {
    const messages = [createMessage("1", "Hello")];

    const { result } = renderHook(() => useStreamBuffer(messages, true));

    expect(result.current.isBuffering).toBe(true);
  });

  it("should update buffered messages when not streaming", () => {
    const initialMessages = [createMessage("1", "Hello")];
    const newMessages = [createMessage("1", "Hello"), createMessage("2", "World")];

    const { result, rerender } = renderHook(
      ({ messages, isStreaming }) => useStreamBuffer(messages, isStreaming),
      {
        initialProps: { messages: initialMessages, isStreaming: false },
      },
    );

    rerender({ messages: newMessages, isStreaming: false });

    expect(result.current.bufferedMessages).toEqual(newMessages);
  });

  it("should update buffered messages after streaming stops", () => {
    const initialMessages = [createMessage("1", "Hello")];

    const { result, rerender } = renderHook(
      ({ messages, isStreaming }) => useStreamBuffer(messages, isStreaming),
      {
        initialProps: { messages: initialMessages, isStreaming: true },
      },
    );

    expect(result.current.isBuffering).toBe(true);

    const updatedMessages = [createMessage("1", "Hello"), createMessage("2", "World")];

    act(() => {
      rerender({ messages: updatedMessages, isStreaming: false });
    });

    expect(result.current.bufferedMessages).toEqual(updatedMessages);
    expect(result.current.isBuffering).toBe(false);
    expect(cancelSpy).toHaveBeenCalled();
  });

  it("should clean up animation frame on unmount", () => {
    const messages = [createMessage("1", "Hello")];

    const { unmount } = renderHook(() => useStreamBuffer(messages, true));

    expect(cancelSpy).not.toHaveBeenCalled();

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
