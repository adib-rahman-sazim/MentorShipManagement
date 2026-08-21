import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  type Rel,
  Unique,
} from "@mikro-orm/core";

import { EUserState } from "@/common/enums/users.enums";
import { UsersRepository } from "@/modules/users/users.repository";

import { Account } from "./accounts.entity";
import { CustomBaseEntity } from "./custom-base.entity";
import { Role } from "./roles.entity";
import { Session } from "./sessions.entity";

@Entity({ tableName: "users", repository: () => UsersRepository })
export class User extends CustomBaseEntity {
  [EntityRepositoryType]?: UsersRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Property()
  @Unique()
  email!: string;

  @Property({ default: false })
  emailVerified!: boolean;

  @Property({ fieldName: "full_name" })
  name!: string;

  @Property({ nullable: true })
  image?: string;

  @ManyToOne(() => Role)
  @Index({ name: "users_role_id_index" })
  role!: Rel<Role>;

  @Enum(() => EUserState)
  state: EUserState = EUserState.ACTIVE;

  @Property({ nullable: true })
  deletedAt?: Date;

  @OneToMany(
    () => Session,
    (session) => session.user,
  )
  sessions = new Collection<Session>(this);

  @OneToMany(
    () => Account,
    (account) => account.user,
  )
  accounts = new Collection<Account>(this);
}