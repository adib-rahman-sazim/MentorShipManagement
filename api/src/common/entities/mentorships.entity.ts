import {
  Entity,
  EntityRepositoryType,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  type Rel,
} from "@mikro-orm/core";

import dayjs from "dayjs";

import { EMentorshipRelationshipType, EMentorshipStatus } from "@/common/enums/mentorships.enums";
import { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { MentorshipDraft } from "./mentorship-drafts.entity";
import { User } from "./users.entity";

@Entity({ tableName: "mentorships", repository: () => MentorshipsRepository })
@Index({
  name: "mentorships_active_subordinate_unique",
  expression:
    'create unique index "mentorships_active_subordinate_unique" on "mentorships" ' +
    `("subordinate_id") where "status" = 'ACTIVE' and "deleted_at" is null`,
})
export class Mentorship extends CustomBaseEntity {
  [EntityRepositoryType]?: MentorshipsRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => User)
  @Index({ name: "mentorships_supervisor_id_index" })
  supervisor!: Rel<User>;

  @ManyToOne(() => User)
  @Index({ name: "mentorships_subordinate_id_index" })
  subordinate!: Rel<User>;

  @Enum(() => EMentorshipRelationshipType)
  relationshipType!: EMentorshipRelationshipType;

  @Enum(() => EMentorshipStatus)
  status: EMentorshipStatus = EMentorshipStatus.ACTIVE;

  @Property({ type: "datetime" })
  startedAt: Date = dayjs().toDate();

  @Property({ type: "datetime", nullable: true })
  endedAt?: Date | null;

  @ManyToOne(() => MentorshipDraft, { nullable: true })
  startedByDraft?: Rel<MentorshipDraft> | null;

  @ManyToOne(() => MentorshipDraft, { nullable: true })
  endedByDraft?: Rel<MentorshipDraft> | null;

  @Property({ type: "datetime", nullable: true })
  @Index({ name: "mentorships_deleted_at_index" })
  deletedAt?: Date | null;
}
