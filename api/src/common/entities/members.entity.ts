import {
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToOne,
  PrimaryKey,
  type Rel,
} from "@mikro-orm/core";

import { EUserRole } from "@/common/enums/roles.enums";
import { MembersRepository } from "@/modules/members/members.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Organization } from "./organizations.entity";
import { User } from "./users.entity";

@Entity({ tableName: "members", repository: () => MembersRepository })
export class Member extends CustomBaseEntity {
  [EntityRepositoryType]?: MembersRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @ManyToOne(() => User)
  user!: Rel<User>;

  /** Better Auth membership role; CASL uses user_roles. Null until synced. */
  @Enum({ items: () => EUserRole, nullable: true, default: null })
  role?: EUserRole | null;
}
