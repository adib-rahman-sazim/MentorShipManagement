import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { Mentorship } from "@/common/entities/mentorships.entity";
import { User } from "@/common/entities/users.entity";

import { CreateMentorshipDraftInteractor } from "./interactors/create-mentorship-draft.interactor";
import { UpdateMentorshipDraftInteractor } from "./interactors/update-mentorship-draft.interactor";
import { MentorshipDraftItemsService } from "./mentorship-draft-items.service";
import { MentorshipDraftsController } from "./mentorship-drafts.controller";
import { MentorshipDraftsSerializer } from "./mentorship-drafts.serializer";

@Module({
  imports: [MikroOrmModule.forFeature([MentorshipDraft, MentorshipDraftItem, Mentorship, User])],
  controllers: [MentorshipDraftsController],
  providers: [
    MentorshipDraftItemsService,
    CreateMentorshipDraftInteractor,
    UpdateMentorshipDraftInteractor,
    MentorshipDraftsSerializer,
  ],
})
export class MentorshipDraftsModule {}
