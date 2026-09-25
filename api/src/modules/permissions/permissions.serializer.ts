import { Injectable } from "@nestjs/common";

import type { TAppAbility } from "@/modules/casl/casl.types";
import { resolveRoleDefaultCodes } from "@/modules/permissions/effective-permissions.helpers";
import type { UserPermissionOverridesResponse } from "@/modules/permissions/permissions.dtos";
import type {
  EPermission,
  EPermissionCode,
  EResource,
} from "@/modules/permissions/permissions.enums";
import type {
  IGetMyCaslRulesResult,
  INormalizedCaslRule,
  IUserPermissionsViewInput,
} from "@/modules/permissions/permissions.interfaces";
import {
  isAllManageHeld,
  resolvePermissionSource,
} from "@/modules/permissions/user-permission-overrides.helpers";

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

  serializeUserPermissions({
    user,
    allPermissions,
    roleCodes,
    effectiveCodes,
    grantedCodes,
    revokedCodes,
  }: IUserPermissionsViewInput): UserPermissionOverridesResponse {
    const roleDefaultCodes = new Set(
      resolveRoleDefaultCodes({
        roleCodes,
        allCodes: allPermissions.map((permission) => permission.code),
      }),
    );
    const sourceInput = {
      effectiveCodes: new Set(effectiveCodes),
      grantedCodes: new Set(grantedCodes),
      revokedCodes: new Set(revokedCodes),
    };

    const permissions = allPermissions.map((permission) => ({
      code: permission.code as EPermissionCode,
      resource: permission.resource as EResource,
      action: permission.action as EPermission,
      ...(permission.description && { description: permission.description }),
      source: resolvePermissionSource(permission.code, sourceInput),
      effective: sourceInput.effectiveCodes.has(permission.code),
      roleDefault: roleDefaultCodes.has(permission.code),
    }));

    return {
      userId: user.id,
      role: user.role.code,
      editable: !isAllManageHeld({ roleCodes, revokedCodes }),
      permissions,
    };
  }
}
