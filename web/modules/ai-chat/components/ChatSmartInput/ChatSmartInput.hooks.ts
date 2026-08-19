import { useEffect, useRef, useState } from "react";

import { useCompletion } from "@ai-sdk/react";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import { AI_SDK_COMPLETION_API_PATH } from "@/modules/ai-chat/ai-chat.constants";
import { API_BASE_URL } from "@/shared/constants/env.constants";
import { getAuthToken } from "@/shared/utils/auth";

import { AI_COMPLETION_DEBOUNCE_MS } from "./ChatSmartInput.constants";

export const useChatSmartInput = () => {
  const { t } = useTranslation("ai-chat");
  const [ghostText, setGhostText] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  const { complete, stop: stopCompletion } = useCompletion({
    api: `${API_BASE_URL}/${AI_SDK_COMPLETION_API_PATH}`,
    streamProtocol: "text",
    onFinish: (_prompt, completion) => {
      setGhostText(completion);
    },
    onError: () => {
      toast.error(t("errorAutoComplete"));
      setGhostText("");
    },
  });

  const clearDebounce = () => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  const triggerCompletion = (text: string) => {
    clearDebounce();
    debounceRef.current = setTimeout(() => {
      complete(text, {
        body: { prompt: text },
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
    }, AI_COMPLETION_DEBOUNCE_MS);
  };

  const handleChange = (newValue: string, onChange: (value: string) => void) => {
    onChange(newValue);
    setGhostText("");
    stopCompletion();
    clearDebounce();

    if (newValue.trim()) {
      triggerCompletion(newValue);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    value: string,
    ghostTextValue: string,
    isLoading: boolean,
    onChange: (value: string) => void,
  ) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (ghostTextValue) {
        onChange(value + ghostTextValue);
        setGhostText("");
        stopCompletion();
      }
      return;
    }

    if (e.key === "Escape" && ghostTextValue) {
      e.preventDefault();
      setGhostText("");
      stopCompletion();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        clearDebounce();
        setGhostText("");
        stopCompletion();
        e.currentTarget.form?.requestSubmit();
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (mirrorRef.current) {
      mirrorRef.current.scrollTop = e.currentTarget.scrollTop;
      mirrorRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleSubmit = (e: React.FormEvent, onSubmit: (e: React.FormEvent) => void) => {
    clearDebounce();
    setGhostText("");
    stopCompletion();
    onSubmit(e);
  };

  return {
    ghostText,
    mirrorRef,
    handleChange,
    handleKeyDown,
    handleScroll,
    handleSubmit,
  };
};
