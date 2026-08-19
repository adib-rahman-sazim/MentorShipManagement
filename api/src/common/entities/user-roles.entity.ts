import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  PrimaryKey,
  type Rel,
} from "@mikro-orm/core";

import { UserRolesRepository } from "@/modules/permissions/user-roles.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Organization } from "./organizations.entity";
import { Role } from "./roles.entity";
import { User } from "./users.entity";

@Entity({ tableName: "user_roles", repository: () => UserRolesRepository })
export class UserRole extends CustomBaseEntity {
  [EntityRepositoryType]?: UserRolesRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => User)
  @Index({ name: "user_roles_user_id_index" })
  user!: Rel<User>;

  @ManyToOne(() => Role)
  @Index({ name: "user_roles_role_id_index" })
  role!: Rel<Role>;

  @ManyToOne(() => Organization, { nullable: true })
  @Index({ name: "user_roles_organization_id_index" })
  organization?: Rel<Organization> | null;
}
