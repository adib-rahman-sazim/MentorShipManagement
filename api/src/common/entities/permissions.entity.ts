import { Collection, Entity, Enum, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";

import {
  EPermission,
  EPermissionConditionType,
  EResource,
} from "@/modules/permissions/permissions.enums";
import { PermissionsRepository } from "@/modules/permissions/permissions.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { RolePermission } from "./roles-permissions.entity";

@Entity({ tableName: "permissions", repository: () => PermissionsRepository })
export class Permission extends CustomBaseEntity {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property({ type: "varchar", length: 255, unique: true })
  code!: string;

  @Enum({ items: () => EResource })
  resource!: EResource;

  @Enum({ items: () => EPermission })
  action!: EPermission;

  @Enum({ items: () => EPermissionConditionType, fieldName: "condition_type" })
  conditionType: EPermissionConditionType = EPermissionConditionType.NONE;

  @Property({ type: "boolean", default: false })
  denied: boolean = false;

  @Property({ type: "text", nullable: true })
  description?: string | null;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions = new Collection<RolePermission>(this);
}
