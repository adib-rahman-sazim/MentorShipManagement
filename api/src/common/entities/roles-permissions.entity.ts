import { Entity, Index, ManyToOne, PrimaryKey, type Rel, Unique } from "@mikro-orm/core";

import { RolePermissionsRepository } from "@/modules/permissions/role-permissions.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Permission } from "./permissions.entity";
import { Role } from "./roles.entity";

@Entity({ tableName: "roles_permissions", repository: () => RolePermissionsRepository })
@Unique({ properties: ["role", "permission"] })
export class RolePermission extends CustomBaseEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => Role)
  @Index({ name: "roles_permissions_role_id_index" })
  role!: Rel<Role>;

  @ManyToOne(() => Permission)
  @Index({ name: "roles_permissions_permission_id_index" })
  permission!: Rel<Permission>;
}
