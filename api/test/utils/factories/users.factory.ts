import type { EntityData } from "@mikro-orm/core";
import { Factory } from "@mikro-orm/seeder";

import { User } from "@/common/entities/users.entity";
import { EUserState } from "@/common/enums/users.enums";

export class UserFactory extends Factory<User> {
  readonly model = User;

  protected definition(): EntityData<User> {
    return {
      email: "user@test.com",
      emailVerified: true,
      firstName: "Test",
      lastName: "User",
      name: "Test User",
      state: EUserState.ACTIVE,
    };
  }
}
