import { Logger } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import dayjs from "dayjs";

import { Mentorship } from "@/common/entities/mentorships.entity";
import { User } from "@/common/entities/users.entity";
import { EMentorshipStatus } from "@/common/enums/mentorships.enums";

import { MENTORSHIP_FIXTURES } from "./mentorships.constants";

export class Seed20260723000006_Mentorships extends Seeder {
  private readonly logger = new Logger(Seed20260723000006_Mentorships.name);

  async run(em: EntityManager): Promise<void> {
    for (const fixture of MENTORSHIP_FIXTURES) {
      const [supervisor, subordinate] = await Promise.all([
        em.findOne(User, { email: fixture.supervisorEmail }),
        em.findOne(User, { email: fixture.subordinateEmail }),
      ]);

      if (!supervisor || !subordinate) {
        this.logger.warn(
          `Skipping mentorship ${fixture.supervisorEmail} -> ${fixture.subordinateEmail}: user not found. Run the mock users seeder first.`,
        );
        continue;
      }

      const existing = await em.findOne(Mentorship, {
        subordinate,
        status: EMentorshipStatus.ACTIVE,
        deletedAt: null,
      });

      if (existing) {
        continue;
      }

      em.persist(
        em.create(Mentorship, {
          supervisor,
          subordinate,
          relationshipType: fixture.relationshipType,
          status: EMentorshipStatus.ACTIVE,
          startedAt: dayjs().toDate(),
        }),
      );
    }

    await em.flush();
  }
}
