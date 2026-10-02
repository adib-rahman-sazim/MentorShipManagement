import {
  Check,
  Entity,
  EntityRepositoryType,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  type Rel,
  Unique,
} from "@mikro-orm/core";

import { EMentorshipDraftOperation } from "@/common/enums/mentorships.enums";
import { MentorshipDraftItemsRepository } from "@/modules/mentorship-drafts/mentorship-draft-items.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { MentorshipDraft } from "./mentorship-drafts.entity";
import { Mentorship } from "./mentorships.entity";
import { User } from "./users.entity";

@Entity({
  tableName: "mentorship_draft_items",
  repository: () => MentorshipDraftItemsRepository,
})
@Unique({
  name: "mentorship_draft_items_draft_id_subordinate_id_unique",
  properties: ["draft", "subordinate"],
})
@Check({
  name: "mentorship_draft_items_proposed_supervisor_check",
  expression:
    `("operation" = 'UNASSIGN' and "proposed_supervisor_id" is null) or ` +
    `("operation" <> 'UNASSIGN' and "proposed_supervisor_id" is not null)`,
})
export class MentorshipDraftItem extends CustomBaseEntity {
  [EntityRepositoryType]?: MentorshipDraftItemsRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @ManyToOne(() => MentorshipDraft, { deleteRule: "cascade" })
  draft!: Rel<MentorshipDraft>;

  @Enum(() => EMentorshipDraftOperation)
  operation!: EMentorshipDraftOperation;

  @ManyToOne(() => User)
  @Index({ name: "mentorship_draft_items_subordinate_id_index" })
  subordinate!: Rel<User>;

  @ManyToOne(() => User, { nullable: true, deleteRule: "no action" })
  proposedSupervisor?: Rel<User> | null;

  @ManyToOne(() => Mentorship, { nullable: true, deleteRule: "no action" })
  expectedCurrentMentorship?: Rel<Mentorship> | null;
}
