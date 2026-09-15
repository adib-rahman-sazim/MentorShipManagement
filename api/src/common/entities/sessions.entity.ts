import { Entity, Index, ManyToOne, PrimaryKey, Property, type Rel, Unique } from "@mikro-orm/core";

import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";

@Entity({ tableName: "sessions" })
export class Session extends CustomBaseEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Property()
  @Unique()
  token!: string;

  @ManyToOne(() => User)
  @Index({ name: "sessions_user_id_index" })
  user!: Rel<User>;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  ipAddress?: string;

  @Property({ nullable: true, type: "text" })
  userAgent?: string;
}
