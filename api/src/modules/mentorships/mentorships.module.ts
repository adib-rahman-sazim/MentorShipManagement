import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Mentorship } from "@/common/entities/mentorships.entity";
import { User } from "@/common/entities/users.entity";

import { GetMentorshipGraphInteractor } from "./interactors/get-mentorship-graph.interactor";
import { GetMyMentorshipInteractor } from "./interactors/get-my-mentorship.interactor";
import { MentorshipHierarchyService } from "./mentorship-hierarchy.service";
import { MentorshipsController } from "./mentorships.controller";
import { MentorshipsSerializer } from "./mentorships.serializer";

@Module({
  imports: [MikroOrmModule.forFeature([Mentorship, User])],
  controllers: [MentorshipsController],
  providers: [
    MentorshipHierarchyService,
    GetMyMentorshipInteractor,
    GetMentorshipGraphInteractor,
    MentorshipsSerializer,
  ],
  exports: [MentorshipHierarchyService],
})
export class MentorshipsModule {}
