import { Send, StopCircle } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Button } from "@/shared/components/shadui/button";
import { Textarea } from "@/shared/components/shadui/textarea";

import { useChatSmartInput } from "./ChatSmartInput.hooks";
import { IChatSmartInputProps } from "./ChatSmartInput.interfaces";

const ChatSmartInput = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  onStop,
  placeholder,
}: IChatSmartInputProps) => {
  const { t } = useTranslation("ai-chat");
  const { ghostText, mirrorRef, handleChange, handleKeyDown, handleScroll, handleSubmit } =
    useChatSmartInput();

  const rows = Math.min(5, (value.match(/\n/g) || []).length + 1);

  return (
    <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="flex gap-2">
      <div className="relative flex-1">
        <div
          ref={mirrorRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 min-h-10 overflow-auto whitespace-pre-wrap break-words p-2 px-3 font-inherit text-sm leading-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <span className="text-transparent">{value}</span>
          {ghostText ? <span className="italic text-muted-foreground/60">{ghostText}</span> : null}
          {ghostText ? (
            <span className="ml-1 inline-flex items-center gap-0.5 opacity-70">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs text-muted-foreground">
                Tab
              </kbd>
            </span>
          ) : null}
        </div>

        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value, onChange)}
          onKeyDown={(e) => handleKeyDown(e, value, ghostText, isLoading, onChange)}
          onScroll={handleScroll}
          placeholder={ghostText ? "" : (placeholder ?? t("inputPlaceholder"))}
          rows={rows}
          className="relative min-h-10 max-h-30 resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-2 px-3 text-sm leading-6 caret-foreground"
          disabled={isLoading}
        />
      </div>

      {isLoading ? (
        <Button type="button" onClick={onStop} variant="destructive" size="icon">
          <StopCircle className="h-5 w-5" />
        </Button>
      ) : (
        <Button type="submit" disabled={!value.trim()} size="icon">
          <Send className="h-5 w-5" />
        </Button>
      )}
    </form>
  );
};

export default ChatSmartInput;
