import { useTranslation } from "next-i18next";

import { ChatInterface } from "@/modules/ai-chat/components/ChatInterface";

import { useAIChatContainer } from "./AIChatContainer.hooks";

const AIChatContainer = () => {
  const { t } = useTranslation("ai-chat");
  const { input, bufferedMessages, isLoading, error, handleInputChange, handleSubmit, onStop } =
    useAIChatContainer();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ChatInterface
        messages={bufferedMessages}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        onStop={onStop}
      />
    </div>
  );
};

export default AIChatContainer;
