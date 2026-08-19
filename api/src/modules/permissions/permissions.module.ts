import { Module } from "@nestjs/common";

import { CaslModule } from "@/modules/casl/casl.module";

import { GetMyCaslRulesInteractor } from "./interactors/get-my-casl-rules.interactor";
import { PermissionsController } from "./permissions.controller";
import { PermissionsSerializer } from "./permissions.serializer";

@Module({
  imports: [CaslModule],
  controllers: [PermissionsController],
  providers: [GetMyCaslRulesInteractor, PermissionsSerializer],
})
export class PermissionsModule {}
