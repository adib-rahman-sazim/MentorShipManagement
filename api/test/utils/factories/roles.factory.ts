import type { EntityData } from "@mikro-orm/core";
import { Factory } from "@mikro-orm/seeder";

import { Role } from "@/common/entities/roles.entity";
import { EUserRole } from "@/common/enums/roles.enums";

export class RoleFactory extends Factory<Role> {
  readonly model = Role;

  protected definition(): EntityData<Role> {
    return {
      slug: EUserRole.MENTEE,
      name: "Mentee",
      description: "Mentee taking part in the programme",
      isSystem: true,
    };
  }
}
