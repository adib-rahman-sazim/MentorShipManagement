import { Injectable } from "@nestjs/common";

import { EUserRole } from "@/common/enums/roles.enums";
import { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import type { IAbilityContext } from "@/modules/casl/casl.interfaces";
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
    if (!context.userId) {
      return this.permissionsSerializer.serializeEmptyRules();
    }

    const roles = (context.roles ?? []).filter((role): role is EUserRole =>
      Object.values(EUserRole).includes(role as EUserRole),
    );

    const abilityContext: IAbilityContext = {
      userId: context.userId,
      roles,
      activeOrganizationId: context.activeOrganizationId,
    };

    const ability = await this.caslAbilityFactory.createForUser(abilityContext);
    return this.permissionsSerializer.serializeAbilityRules(ability);
  }
}
