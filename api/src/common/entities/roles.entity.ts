import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";

import { EUserRole } from "@/common/enums/roles.enums";
import { RolesRepository } from "@/modules/permissions/roles.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { RolePermission } from "./roles-permissions.entity";
import { User } from "./users.entity";

@Entity({ tableName: "roles", repository: () => RolesRepository })
export class Role extends CustomBaseEntity {
  [EntityRepositoryType]?: RolesRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Enum(() => EUserRole)
  @Unique()
  code!: EUserRole;

  @Property({ type: "varchar", length: 255 })
  name!: string;

  @OneToMany(
    () => User,
    (user) => user.role,
  )
  users = new Collection<User>(this);

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions = new Collection<RolePermission>(this);
}
