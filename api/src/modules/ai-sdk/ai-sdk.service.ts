import { Inject, Injectable } from "@nestjs/common";

import { AI_MODEL_PROVIDER } from "./ai-sdk.constants";
import { ChatRequestDto, CompletionRequestDto } from "./ai-sdk.dtos";
import type { IAiProvider } from "./ai-sdk.interfaces";

@Injectable()
export class AiSdkService {
  constructor(@Inject(AI_MODEL_PROVIDER) private readonly aiModelProvider: IAiProvider) {}

  generateCompletion(dto: CompletionRequestDto) {
    return this.aiModelProvider.generateCompletion(dto);
  }

  generateChat(dto: ChatRequestDto) {
    return this.aiModelProvider.generateChat(dto);
  }

  streamChat(dto: ChatRequestDto) {
    return this.aiModelProvider.streamChat(dto);
  }
}
