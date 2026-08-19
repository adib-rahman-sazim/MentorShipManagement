import type { StreamTextResult, ToolSet } from "ai";

import { ChatRequestDto, CompletionRequestDto } from "./ai-sdk.dtos";
import type { EAiProvider } from "./ai-sdk.enums";

export interface IAiSdkModuleConfig {
  providerType: EAiProvider;
}

export interface IAiProvider {
  generateCompletion(dto: CompletionRequestDto): Promise<string>;

  generateChat(dto: ChatRequestDto): Promise<string>;

  streamChat(dto: ChatRequestDto): Promise<StreamTextResult<ToolSet, never>>;
}
