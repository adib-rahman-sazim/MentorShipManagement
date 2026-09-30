import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Mentorship } from "@/common/entities/mentorships.entity";

import { MentorshipHierarchyService } from "./mentorship-hierarchy.service";

@Module({
  imports: [MikroOrmModule.forFeature([Mentorship])],
  providers: [MentorshipHierarchyService],
  exports: [MentorshipHierarchyService],
})
export class MentorshipsModule {}
