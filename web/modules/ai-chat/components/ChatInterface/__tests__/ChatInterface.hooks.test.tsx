import { act, renderHook } from "@testing-library/react";

import { useChatScroll } from "../ChatInterface.hooks";

describe("useChatScroll", () => {
  const messages = [{ id: "1" }, { id: "2" }];

  let mockScrollIntoView: ReturnType<typeof vi.fn>;
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafIdCounter: number;

  beforeEach(() => {
    mockScrollIntoView = vi.fn();
    rafCallbacks = new Map();
    rafIdCounter = 0;

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      const id = ++rafIdCounter;
      rafCallbacks.set(id, cb);
      return id;
    });

    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      rafCallbacks.delete(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const flushRAF = () => {
    rafCallbacks.forEach((cb) => cb(performance.now()));
    rafCallbacks.clear();
  };

  it("should return refs and default shouldAutoScroll to true", () => {
    const { result } = renderHook(() => useChatScroll(messages, false));

    expect(result.current.messagesEndRef).toBeDefined();
    expect(result.current.scrollContainerRef).toBeDefined();
    expect(result.current.handleScroll).toBeTypeOf("function");
    expect(result.current.shouldAutoScroll).toBe(true);
  });

  it("should scroll to bottom when shouldScroll is true and shouldAutoScroll is true", () => {
    const { result } = renderHook(() => useChatScroll(messages, true));

    Object.defineProperty(result.current.messagesEndRef, "current", {
      value: { scrollIntoView: mockScrollIntoView },
      writable: true,
    });

    act(() => {
      flushRAF();
    });

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "end",
    });
  });

  it("should not scroll when shouldScroll is false", () => {
    const { result } = renderHook(() => useChatScroll(messages, false));

    Object.defineProperty(result.current.messagesEndRef, "current", {
      value: { scrollIntoView: mockScrollIntoView },
      writable: true,
    });

    flushRAF();

    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it("should set shouldAutoScroll to false when far from bottom", () => {
    const { result } = renderHook(() => useChatScroll(messages, false));

    const scrollContainer = {
      scrollTop: 0,
      scrollHeight: 500,
      clientHeight: 200,
    };

    Object.defineProperty(result.current.scrollContainerRef, "current", {
      value: scrollContainer,
      writable: true,
    });

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.shouldAutoScroll).toBe(false);
  });

  it("should set shouldAutoScroll to true when near bottom", () => {
    const { result } = renderHook(() => useChatScroll(messages, false));

    const scrollContainer = {
      scrollTop: 290,
      scrollHeight: 500,
      clientHeight: 200,
    };

    Object.defineProperty(result.current.scrollContainerRef, "current", {
      value: scrollContainer,
      writable: true,
    });

    act(() => {
      result.current.handleScroll();
    });

    expect(result.current.shouldAutoScroll).toBe(true);
  });

  it("should not throw when scrollContainerRef.current is null in handleScroll", () => {
    const { result } = renderHook(() => useChatScroll(messages, false));

    expect(() => result.current.handleScroll()).not.toThrow();
  });

  it("should clean up animation frame on unmount", () => {
    const cancelSpy = vi.spyOn(globalThis, "cancelAnimationFrame");

    const { unmount } = renderHook(() => useChatScroll(messages, true));

    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
