import {
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

import { RolesRepository } from "@/modules/permissions/roles.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { RolePermission } from "./roles-permissions.entity";
import { UserRole } from "./user-roles.entity";

@Entity({ tableName: "roles", repository: () => RolesRepository })
export class Role extends CustomBaseEntity {
  [EntityRepositoryType]?: RolesRepository;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property({ type: "varchar", length: 255 })
  name!: string;

  @Property({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Property({ type: "text", nullable: true })
  description?: string;

  @Property({ type: "boolean", default: false, fieldName: "is_system" })
  isSystem: boolean = false;

  @OneToMany(
    () => UserRole,
    (userRole) => userRole.role,
  )
  userRoles = new Collection<UserRole>(this);

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions = new Collection<RolePermission>(this);
}
