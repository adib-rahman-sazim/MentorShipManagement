import { useCallback, useEffect, useRef, useState } from "react";

import { UIMessage } from "ai";

import { FRAME_TIME } from "./useStreamBuffer.constants";
import { IUseStreamBufferResult } from "./useStreamBuffer.interfaces";

export const useStreamBuffer = (
  messages: UIMessage[],
  isStreaming: boolean,
): IUseStreamBufferResult => {
  const [bufferedMessages, setBufferedMessages] = useState<UIMessage[]>(messages);
  const [isBuffering, setIsBuffering] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const pendingMessagesRef = useRef<UIMessage[]>(messages);
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;

  const flushBuffer = useCallback(() => {
    const now = performance.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeSinceLastUpdate >= FRAME_TIME) {
      setBufferedMessages([...pendingMessagesRef.current]);
      lastUpdateRef.current = now;
      setIsBuffering(false);
    }

    if (isStreamingRef.current) {
      rafRef.current = requestAnimationFrame(flushBuffer);
    }
  }, []);

  useEffect(() => {
    pendingMessagesRef.current = messages;

    if (isStreaming) {
      setIsBuffering(true);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushBuffer);
      }
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      setBufferedMessages(messages);
      setIsBuffering(false);
    }
  }, [messages, isStreaming, flushBuffer]);

  useEffect(
    () => () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    [],
  );

  return {
    bufferedMessages,
    isBuffering,
  };
};
