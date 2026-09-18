import type { EntityData } from "@mikro-orm/core";
import { Factory } from "@mikro-orm/seeder";

import { Permission } from "@/common/entities/permissions.entity";
import {
  EPermission,
  EPermissionCode,
  EPermissionConditionType,
  EResource,
} from "@/modules/permissions/permissions.enums";

export class PermissionFactory extends Factory<Permission> {
  readonly model = Permission;

  protected definition(): EntityData<Permission> {
    return {
      code: EPermissionCode.CAN_READ_USER,
      resource: EResource.USER,
      action: EPermission.READ,
      conditionType: EPermissionConditionType.NONE,
      denied: false,
      description: null,
    };
  }
}
