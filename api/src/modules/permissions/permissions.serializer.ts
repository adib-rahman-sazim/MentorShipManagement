import { Injectable } from "@nestjs/common";

import type { TAppAbility } from "@/modules/casl/casl.types";
import type { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import type {
  IGetMyCaslRulesResult,
  INormalizedCaslRule,
} from "@/modules/permissions/permissions.interfaces";

@Injectable()
export class PermissionsSerializer {
  serializeAbilityRules(ability: TAppAbility): IGetMyCaslRulesResult {
    const rules: INormalizedCaslRule[] = ability.rules.map((rule) => {
      let fields: string[] | undefined;
      if (rule.fields) {
        fields = Array.isArray(rule.fields) ? rule.fields : [rule.fields];
      }

      return {
        action: (Array.isArray(rule.action) ? rule.action : [rule.action]) as EPermission[],
        subject: (Array.isArray(rule.subject) ? rule.subject : [rule.subject]) as Array<
          EResource | "all"
        >,
        ...(rule.conditions && { conditions: rule.conditions as Record<string, unknown> }),
        ...(rule.inverted !== undefined && { inverted: rule.inverted }),
        ...(rule.reason && { reason: rule.reason }),
        ...(fields && { fields }),
      };
    });

    return { rules };
  }

  serializeEmptyRules(): IGetMyCaslRulesResult {
    return { rules: [] };
  }
}
