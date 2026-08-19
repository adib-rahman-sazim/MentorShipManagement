import { useTranslation } from "next-i18next";

import ChatMessage from "../ChatMessage";
import ChatSmartInput from "../ChatSmartInput";
import { useChatScroll } from "./ChatInterface.hooks";
import { IChatInterfaceProps } from "./ChatInterface.interfaces";

export const ChatInterface = ({
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  error,
  onStop,
}: IChatInterfaceProps) => {
  const { t } = useTranslation("ai-chat");
  const lastMessage = messages.at(-1);
  const isWaitingForResponse = isLoading && (!lastMessage || lastMessage.role === "user");
  const isStreamingMessage = isLoading && lastMessage?.role === "assistant";
  const { messagesEndRef, scrollContainerRef, handleScroll } = useChatScroll(messages, isLoading);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-semibold">{t("startConversation")}</h2>
              <p className="text-muted-foreground">{t("startConversationDescription")}</p>
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isCurrentlyStreaming = isStreamingMessage && isLastMessage;

          return (
            <ChatMessage key={message.id} message={message} isStreaming={isCurrentlyStreaming} />
          );
        })}

        {isWaitingForResponse ? (
          <ChatMessage
            message={{
              id: "loading",
              role: "assistant",
              parts: [],
            }}
            isLoading
          />
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-destructive">
            <p className="font-semibold">{t("errorTitle")}</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t px-6 py-4">
        <ChatSmartInput
          value={input}
          onChange={onInputChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
          onStop={onStop}
        />
      </div>
    </div>
  );
};
