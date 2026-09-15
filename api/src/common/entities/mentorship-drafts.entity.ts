import { Entity, Enum, Index, ManyToOne, PrimaryKey, Property, type Rel } from "@mikro-orm/core";

import { EMentorshipDraftStatus } from "@/common/enums/mentorships.enums";

import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";

@Entity({ tableName: "mentorship_drafts" })
export class MentorshipDraft extends CustomBaseEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Property({ type: "varchar", length: 255 })
  title!: string;

  @Enum(() => EMentorshipDraftStatus)
  @Index({ name: "mentorship_drafts_status_index" })
  status: EMentorshipDraftStatus = EMentorshipDraftStatus.DRAFT;

  @ManyToOne(() => User)
  @Index({ name: "mentorship_drafts_created_by_id_index" })
  createdBy!: Rel<User>;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy?: Rel<User> | null;

  @ManyToOne(() => User, { nullable: true })
  approvedBy?: Rel<User> | null;

  @ManyToOne(() => User, { nullable: true })
  publishedBy?: Rel<User> | null;

  @Property({ type: "text", nullable: true })
  decisionComment?: string | null;

  @Property({ type: "datetime", nullable: true })
  @Index({ name: "mentorship_drafts_deleted_at_index" })
  deletedAt?: Date | null;
}
