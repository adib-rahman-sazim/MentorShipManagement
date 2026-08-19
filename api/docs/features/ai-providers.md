# Adding New AI Providers

This module uses a plug-and-play architecture that makes it easy to add new AI providers. The pattern is designed to be simple - just add your provider and it works.

## Steps to Add a New Provider

1. **Add the provider enum value** in `src/modules/ai-sdk/ai-sdk.dtos.ts`:

   ```typescript
   export enum EAiProvider {
     // existing providers...
     YOUR_PROVIDER = "your-provider",
   }
   ```

2. **Create your provider class** in `src/modules/ai-sdk/providers/your-provider.provider.ts`:

   ```typescript
   @Injectable()
   export class YourProvider extends AbstractAiProvider {
     private readonly provider: YourProviderSDK;

     constructor(configService: ConfigService) {
       super(configService);
       const apiKey = configService.get<string>("YOUR_API_KEY");
       if (!apiKey) {
         throw new BadRequestException("YOUR_API_KEY is not defined");
       }
       this.provider = createYourProvider({ apiKey });
     }

     protected getModel(): LanguageModel {
       return this.provider(this.defaultModel);
     }

     protected getDefaultModelFromConfig(): string {
       return this.configService.get<string>("AI_DEFAULT_MODEL") || "your-default-model";
     }
   }
   ```

3. **Register the provider** in `src/modules/ai-sdk/ai-sdk.module.ts`:

   ```typescript
   const providerMap: Partial<Record<EAiProvider, Type<IAiProvider>>> = {
     [EAiProvider.AI_GATEWAY]: AIGateWayProvider,
     [EAiProvider.GOOGLE]: GoogleGenAiProvider,
     [EAiProvider.CEREBRAS]: CerebrasAiProvider,
     [EAiProvider.YOUR_PROVIDER]: YourProvider, // Add here
   };
   ```

4. **Set the environment variable** to use your provider:
   ```
   AI_PROVIDER=your-provider
   ```

That's it! The module will automatically use your new provider based on the `AI_PROVIDER` environment variable.
