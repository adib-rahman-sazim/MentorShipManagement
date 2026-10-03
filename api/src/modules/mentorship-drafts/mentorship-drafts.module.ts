import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { Mentorship } from "@/common/entities/mentorships.entity";
import { User } from "@/common/entities/users.entity";

import { ApproveMentorshipDraftInteractor } from "./interactors/approve-mentorship-draft.interactor";
import { CreateMentorshipDraftInteractor } from "./interactors/create-mentorship-draft.interactor";
import { GetMentorshipDraftInteractor } from "./interactors/get-mentorship-draft.interactor";
import { GetMentorshipDraftChangeSummaryInteractor } from "./interactors/get-mentorship-draft-change-summary.interactor";
import { ListMentorshipDraftsInteractor } from "./interactors/list-mentorship-drafts.interactor";
import { RejectMentorshipDraftInteractor } from "./interactors/reject-mentorship-draft.interactor";
import { SubmitMentorshipDraftInteractor } from "./interactors/submit-mentorship-draft.interactor";
import { UpdateMentorshipDraftInteractor } from "./interactors/update-mentorship-draft.interactor";
import { MentorshipDraftItemsService } from "./mentorship-draft-items.service";
import { MentorshipDraftsController } from "./mentorship-drafts.controller";
import { MentorshipDraftsSerializer } from "./mentorship-drafts.serializer";
import { MentorshipDraftsService } from "./mentorship-drafts.service";

@Module({
  imports: [MikroOrmModule.forFeature([MentorshipDraft, MentorshipDraftItem, Mentorship, User])],
  controllers: [MentorshipDraftsController],
  providers: [
    MentorshipDraftItemsService,
    MentorshipDraftsService,
    CreateMentorshipDraftInteractor,
    UpdateMentorshipDraftInteractor,
    SubmitMentorshipDraftInteractor,
    ListMentorshipDraftsInteractor,
    GetMentorshipDraftInteractor,
    GetMentorshipDraftChangeSummaryInteractor,
    ApproveMentorshipDraftInteractor,
    RejectMentorshipDraftInteractor,
    MentorshipDraftsSerializer,
  ],
})
export class MentorshipDraftsModule {}
