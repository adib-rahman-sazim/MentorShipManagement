import { UIMessage } from "ai";

export interface IChatMessageProps {
  message: UIMessage;
  isLoading?: boolean;
  isStreaming?: boolean;
}
