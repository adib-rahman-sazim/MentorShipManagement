import { useMemo, useState } from "react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import { AI_SDK_CHAT_API_PATH } from "@/modules/ai-chat/ai-chat.constants";
import { useStreamBuffer } from "@/modules/ai-chat/hooks";
import { API_BASE_URL } from "@/shared/constants/env.constants";
import { getAuthToken } from "@/shared/utils/auth";

export const useAIChatContainer = () => {
  const { t } = useTranslation("ai-chat");
  const [input, setInput] = useState("");

  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_BASE_URL}/${AI_SDK_CHAT_API_PATH}`,
        headers: () => ({
          Authorization: `Bearer ${getAuthToken()}`,
        }),
      }),
    [],
  );

  const { messages, sendMessage, stop, status, error } = useChat({
    transport: chatTransport,
    onError: () => {
      toast.error(t("errorSendMessage"));
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const { bufferedMessages } = useStreamBuffer(messages, status === "streaming");

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming" || status === "submitted") {
      return;
    }

    const userMessage = input.trim();

    try {
      await sendMessage({ text: userMessage });
      setInput("");
    } catch {
      setInput(userMessage);
      toast.error(t("errorSendMessage"));
    }
  };

  return {
    input,
    bufferedMessages,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    onStop: stop,
  };
};
