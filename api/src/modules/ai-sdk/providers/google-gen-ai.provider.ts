import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from "@ai-sdk/google";
import { LanguageModel } from "ai";

import { AbstractAiProvider } from "../abstract-ai.provider";
import { EAiModel } from "../ai-sdk.enums";

@Injectable()
export class GoogleGenAiProvider extends AbstractAiProvider {
  private provider: GoogleGenerativeAIProvider | null = null;

  constructor(configService: ConfigService) {
    super(configService);
  }

  protected getModel(): LanguageModel {
    return this.getProvider()(this.defaultModel);
  }

  protected getDefaultModelFromConfig(): string {
    return this.configService.get<string>("AI_DEFAULT_MODEL") || EAiModel.GEMINI_2_5_FLASH;
  }

  private getProvider(): GoogleGenerativeAIProvider {
    if (this.provider) {
      return this.provider;
    }

    const googleGenAiApiKey = this.configService.get<string>("GOOGLE_GEN_AI_API_KEY");

    if (!googleGenAiApiKey) {
      throw new ServiceUnavailableException("GOOGLE_GEN_AI_API_KEY is not configured");
    }

    this.provider = createGoogleGenerativeAI({
      apiKey: googleGenAiApiKey,
    });

    return this.provider;
  }
}
