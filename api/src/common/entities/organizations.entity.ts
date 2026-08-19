import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  type Rel,
  Unique,
} from "@mikro-orm/core";

import { OrganizationsRepository } from "@/modules/organizations/organizations.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Invitation } from "./invitations.entity";
import { Member } from "./members.entity";
import { User } from "./users.entity";

@Entity({ tableName: "organizations", repository: () => OrganizationsRepository })
export class Organization extends CustomBaseEntity {
  [EntityRepositoryType]?: OrganizationsRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Property()
  name!: string;

  @Property()
  @Unique()
  slug!: string;

  @Property({ nullable: true })
  logo?: string;

  @Property({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => User, { nullable: true, fieldName: "created_by" })
  createdBy?: Rel<User> | null;

  @OneToMany(
    () => Member,
    (member) => member.organization,
  )
  members = new Collection<Member>(this);

  @OneToMany(
    () => Invitation,
    (invitation) => invitation.organization,
  )
  invitations = new Collection<Invitation>(this);
}
