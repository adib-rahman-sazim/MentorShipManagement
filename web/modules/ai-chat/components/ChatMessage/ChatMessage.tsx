import { type ReactNode, useMemo } from "react";

import { useTranslation } from "next-i18next";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import LoadingDots from "@/modules/ai-chat/components/LoadingDots";

import { IChatMessageProps } from "./ChatMessage.interfaces";

const ChatMessage = ({ message, isLoading, isStreaming = false }: IChatMessageProps) => {
  const { t } = useTranslation("ai-chat");
  const isUser = message.role === "user";

  const textContent = useMemo(
    () =>
      message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(""),
    [message.parts],
  );

  let messageBody: ReactNode = (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
      {textContent}
    </ReactMarkdown>
  );

  if (isLoading) {
    messageBody = <LoadingDots />;
  } else if (isStreaming) {
    messageBody = (
      <div className="whitespace-pre-wrap break-words leading-relaxed">{textContent}</div>
    );
  }

  return (
    <div className={cn("mb-4 flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 transition-opacity duration-200",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
          isStreaming && "will-change-contents",
        )}
        style={isStreaming ? { contain: "layout style" } : undefined}
      >
        <div className="mb-1 text-xs font-semibold opacity-70">
          {isUser ? t("you") : t("assistant")}
        </div>
        <div
          className={cn(
            "leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>pre]:mb-3 [&>blockquote]:mb-3",
          )}
        >
          {messageBody}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
