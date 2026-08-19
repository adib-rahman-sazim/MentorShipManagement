import { RefObject } from "react";

import { UIMessage } from "ai";

export interface IChatInterfaceProps {
  messages: UIMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: Error;
  onStop: () => void;
}

export interface IUseChatScrollResult {
  messagesEndRef: RefObject<HTMLDivElement>;
  scrollContainerRef: RefObject<HTMLDivElement>;
  handleScroll: () => void;
  shouldAutoScroll: boolean;
}
