import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { CerebrasProvider, createCerebras } from "@ai-sdk/cerebras";
import { LanguageModel } from "ai";

import { AbstractAiProvider } from "../abstract-ai.provider";
import { EAiModel } from "../ai-sdk.enums";

@Injectable()
export class CerebrasAiProvider extends AbstractAiProvider {
  private provider: CerebrasProvider | null = null;

  constructor(configService: ConfigService) {
    super(configService);
  }

  protected getModel(): LanguageModel {
    return this.getProvider()(this.defaultModel);
  }

  protected getDefaultModelFromConfig(): string {
    return this.configService.get<string>("AI_DEFAULT_MODEL") || EAiModel.CEREBRAS_LLAMA;
  }

  private getProvider(): CerebrasProvider {
    if (this.provider) {
      return this.provider;
    }

    const cerebrasApiKey = this.configService.get<string>("AI_API_KEY");

    if (!cerebrasApiKey) {
      throw new ServiceUnavailableException("AI_API_KEY is not configured");
    }

    this.provider = createCerebras({
      apiKey: cerebrasApiKey,
    });

    return this.provider;
  }
}
