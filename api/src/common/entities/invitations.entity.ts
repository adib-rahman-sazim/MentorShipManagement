import {
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
  type Rel,
} from "@mikro-orm/core";

import { EInvitationStatus } from "@/modules/invitations/invitations.enums";
import { InvitationsRepository } from "@/modules/invitations/invitations.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Organization } from "./organizations.entity";
import { User } from "./users.entity";

@Entity({ tableName: "invitations", repository: () => InvitationsRepository })
export class Invitation extends CustomBaseEntity {
  [EntityRepositoryType]?: InvitationsRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => Organization, { nullable: true })
  organization?: Rel<Organization> | null;

  @Property()
  email!: string;

  @Property({ type: "text", nullable: true })
  firstName?: string | null;

  @Property({ type: "text", nullable: true })
  lastName?: string | null;

  @Property({ type: "text" })
  role!: string;

  @Enum({ items: () => EInvitationStatus })
  status!: EInvitationStatus;

  @Property()
  expiresAt!: Date;

  @ManyToOne(() => User)
  inviter!: Rel<User>;

  @Property({ type: "text", nullable: true, unique: true })
  token?: string | null;
}
