import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { createGateway, GatewayProvider } from "@ai-sdk/gateway";
import { LanguageModel } from "ai";

import { AbstractAiProvider } from "../abstract-ai.provider";
import { EAiModel } from "../ai-sdk.enums";

@Injectable()
export class AIGateWayProvider extends AbstractAiProvider {
  private provider: GatewayProvider | null = null;

  constructor(configService: ConfigService) {
    super(configService);
  }

  protected getModel(): LanguageModel {
    return this.getProvider()(this.defaultModel);
  }

  protected getDefaultModelFromConfig(): string {
    return this.configService.get<string>("AI_DEFAULT_MODEL") || EAiModel.GPT_4O_MINI;
  }

  private getProvider(): GatewayProvider {
    if (this.provider) {
      return this.provider;
    }

    const aiGatewayApiKey = this.configService.get<string>("AI_API_KEY");

    if (!aiGatewayApiKey) {
      throw new ServiceUnavailableException("AI_API_KEY is not configured");
    }

    this.provider = createGateway({
      apiKey: aiGatewayApiKey,
    });

    return this.provider;
  }
}
