import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Mentorship } from "@/common/entities/mentorships.entity";

import { GetMyMentorshipInteractor } from "./interactors/get-my-mentorship.interactor";
import { MentorshipHierarchyService } from "./mentorship-hierarchy.service";
import { MentorshipsController } from "./mentorships.controller";
import { MentorshipsSerializer } from "./mentorships.serializer";

@Module({
  imports: [MikroOrmModule.forFeature([Mentorship])],
  controllers: [MentorshipsController],
  providers: [MentorshipHierarchyService, GetMyMentorshipInteractor, MentorshipsSerializer],
  exports: [MentorshipHierarchyService],
})
export class MentorshipsModule {}
