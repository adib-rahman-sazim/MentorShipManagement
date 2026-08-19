import { UIMessage } from "ai";

export interface IUseStreamBufferResult {
  bufferedMessages: UIMessage[];
  isBuffering: boolean;
}
