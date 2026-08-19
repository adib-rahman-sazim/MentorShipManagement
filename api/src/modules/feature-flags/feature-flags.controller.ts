import { Controller, Get, UseInterceptors } from "@nestjs/common";

import { Public } from "@/common/decorators/auth/public.decorator";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";

import { FeatureFlagKeysResponse } from "./feature-flags.responses";
import { GetFeatureFlagKeysInteractor } from "./interactors/get-feature-flag-keys.interactor";

@Public()
@Controller("feature-flags")
@UseInterceptors(ResponseTransformInterceptor)
export class FeatureFlagsController {
  constructor(private readonly getFeatureFlagKeysInteractor: GetFeatureFlagKeysInteractor) {}

  @Get("keys")
  getKeys(): Promise<FeatureFlagKeysResponse> {
    return this.getFeatureFlagKeysInteractor.execute();
  }
}
