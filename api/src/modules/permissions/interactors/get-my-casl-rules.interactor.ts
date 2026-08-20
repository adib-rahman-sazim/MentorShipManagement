import { Injectable } from "@nestjs/common";

import { EUserRole } from "@/common/enums/roles.enums";
import { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import type {
  IGetMyCaslRulesContext,
  IGetMyCaslRulesResult,
} from "@/modules/permissions/permissions.interfaces";
import { PermissionsSerializer } from "@/modules/permissions/permissions.serializer";

@Injectable()
export class GetMyCaslRulesInteractor {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly permissionsSerializer: PermissionsSerializer,
  ) {}

  async execute(context: IGetMyCaslRulesContext): Promise<IGetMyCaslRulesResult> {
    const isKnownRole = Object.values(EUserRole).includes(context.role as EUserRole);

    if (!context.userId || !isKnownRole) {
      return this.permissionsSerializer.serializeEmptyRules();
    }

    const ability = await this.caslAbilityFactory.createForUser({
      userId: context.userId,
      role: context.role as EUserRole,
    });

    return this.permissionsSerializer.serializeAbilityRules(ability);
  }
}
