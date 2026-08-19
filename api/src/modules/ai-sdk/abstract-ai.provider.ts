import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  convertToModelMessages,
  generateText,
  LanguageModel,
  StreamTextResult,
  streamText,
  ToolSet,
  UIMessage,
} from "ai";

import { COMPLETION_SYSTEM_PROMPT } from "./ai-sdk.constants";
import { ChatRequestDto, CompletionRequestDto } from "./ai-sdk.dtos";
import { EMessagePartType, EMessageRole } from "./ai-sdk.enums";
import type { IAiProvider } from "./ai-sdk.interfaces";

export abstract class AbstractAiProvider implements IAiProvider {
  protected readonly defaultModel: string;
  private readonly logger = new Logger(AbstractAiProvider.name);

  constructor(protected readonly configService: ConfigService) {
    this.defaultModel = this.getDefaultModelFromConfig();
  }

  protected abstract getModel(): LanguageModel;

  protected abstract getDefaultModelFromConfig(): string;

  protected convertMessagesToModelFormat(dto: ChatRequestDto) {
    const uiMessages: UIMessage[] = dto.messages.map((msg) => ({
      id: msg.id,
      role: msg.role as EMessageRole.USER | EMessageRole.ASSISTANT | EMessageRole.SYSTEM,
      parts: msg.parts.map((part) => ({
        type: part.type as EMessagePartType.TEXT,
        text: part.text || "",
      })),
    }));

    return convertToModelMessages(uiMessages);
  }

  async generateCompletion(dto: CompletionRequestDto): Promise<string> {
    const { text } = await generateText({
      model: this.getModel(),
      prompt: dto.prompt,
      system: COMPLETION_SYSTEM_PROMPT,
    });

    return text;
  }

  async generateChat(dto: ChatRequestDto): Promise<string> {
    const messages = await this.convertMessagesToModelFormat(dto);

    const lastUserMessage = messages.at(-1);
    if (lastUserMessage?.role === EMessageRole.USER) {
      this.logger.log("Save user message to database here");
    }
    const logger = this.logger;

    const { text } = await generateText({
      model: this.getModel(),
      messages,
      onFinish() {
        logger.log("Save assistant reply to database here: ");
      },
    });

    return text;
  }

  async streamChat(dto: ChatRequestDto): Promise<StreamTextResult<ToolSet, never>> {
    const messages = await this.convertMessagesToModelFormat(dto);

    const lastUserMessage = messages.at(-1);
    if (lastUserMessage?.role === EMessageRole.USER) {
      this.logger.log("Save user message to database here");
    }

    const logger = this.logger;

    return streamText({
      model: this.getModel(),
      messages,
      onFinish() {
        logger.log("Save assistant reply to database here");
      },
      onError({ error }) {
        logger.error("Stream chat failed", error);
      },
    });
  }
}
