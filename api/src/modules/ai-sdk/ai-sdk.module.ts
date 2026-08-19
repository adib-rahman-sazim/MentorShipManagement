import { DynamicModule, Module, Type } from "@nestjs/common";

import { AI_MODEL_PROVIDER } from "./ai-sdk.constants";
import { AiSdkController } from "./ai-sdk.controller";
import { EAiProvider } from "./ai-sdk.enums";
import type { IAiProvider, IAiSdkModuleConfig } from "./ai-sdk.interfaces";
import { AiSdkService } from "./ai-sdk.service";
import { AIGateWayProvider } from "./providers/ai-gateway.provider";
import { CerebrasAiProvider } from "./providers/cerebras-ai.provider";
import { GoogleGenAiProvider } from "./providers/google-gen-ai.provider";

@Module({})
export class AiSdkModule {
  static forRoot(config: IAiSdkModuleConfig): DynamicModule {
    const providerClass = this.getProviderClass(config.providerType);

    return {
      module: AiSdkModule,
      controllers: [AiSdkController],
      providers: [
        {
          provide: AI_MODEL_PROVIDER,
          useClass: providerClass,
        },
        AiSdkService,
      ],
    };
  }

  private static getProviderClass(provider: EAiProvider): Type<IAiProvider> {
    const providerMap: Partial<Record<EAiProvider, Type<IAiProvider>>> = {
      [EAiProvider.AI_GATEWAY]: AIGateWayProvider,
      [EAiProvider.GOOGLE]: GoogleGenAiProvider,
      [EAiProvider.CEREBRAS]: CerebrasAiProvider,
    };

    return providerMap[provider] ?? AIGateWayProvider;
  }
}
