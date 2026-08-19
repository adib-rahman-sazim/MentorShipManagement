import type { EntityData } from "@mikro-orm/core";
import { Factory } from "@mikro-orm/seeder";

import { Organization } from "@/common/entities/organizations.entity";

export class OrganizationFactory extends Factory<Organization> {
  readonly model = Organization;

  protected definition(): EntityData<Organization> {
    return {
      name: "Default Organization",
      slug: "default-organization",
    };
  }
}
