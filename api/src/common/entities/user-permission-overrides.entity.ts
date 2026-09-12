import { Entity, Enum, Index, ManyToOne, PrimaryKey, Property, type Rel } from "@mikro-orm/core";

import { EPermissionOverrideEffect } from "@/modules/permissions/permissions.enums";
import { UserPermissionOverridesRepository } from "@/modules/permissions/user-permission-overrides.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Permission } from "./permissions.entity";
import { User } from "./users.entity";

@Entity({
  tableName: "user_permission_overrides",
  repository: () => UserPermissionOverridesRepository,
})
@Index({
  name: "user_permission_overrides_live_user_id_permission_id_unique",
  expression:
    'create unique index "user_permission_overrides_live_user_id_permission_id_unique" on "user_permission_overrides" ("user_id", "permission_id") where "deleted_at" is null',
})
export class UserPermissionOverride extends CustomBaseEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => User)
  @Index({ name: "user_permission_overrides_user_id_index" })
  user!: Rel<User>;

  @ManyToOne(() => Permission)
  @Index({ name: "user_permission_overrides_permission_id_index" })
  permission!: Rel<Permission>;

  @Enum(() => EPermissionOverrideEffect)
  effect!: EPermissionOverrideEffect;

  @ManyToOne(() => User, { fieldName: "granted_by_id" })
  @Index({ name: "user_permission_overrides_granted_by_id_index" })
  grantedBy!: Rel<User>;

  @Property({ type: "text", nullable: true })
  reason?: string | null;

  @Property({ type: "datetime", nullable: true })
  @Index({ name: "user_permission_overrides_deleted_at_index" })
  deletedAt?: Date | null;
}
