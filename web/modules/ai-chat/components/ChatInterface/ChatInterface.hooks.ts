import { useCallback, useEffect, useRef, useState } from "react";

import { CHAT_SCROLL_THRESHOLD_PX } from "./ChatInterface.constants";
import { IUseChatScrollResult } from "./ChatInterface.interfaces";

export const useChatScroll = (
  _messages: { id: string }[],
  shouldScroll: boolean,
): IUseChatScrollResult => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = useCallback((smooth = false) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    setShouldAutoScroll(distanceFromBottom < CHAT_SCROLL_THRESHOLD_PX);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll && shouldScroll) {
      scrollToBottom(false);
    }
  }, [shouldAutoScroll, shouldScroll, scrollToBottom]);

  useEffect(
    () => () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    [],
  );

  return {
    messagesEndRef,
    scrollContainerRef,
    handleScroll,
    shouldAutoScroll,
  };
};
