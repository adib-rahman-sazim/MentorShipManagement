import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { ensureCredentialUser } from "@/db/seeders/core-seeders/shared/credential-user/credential-user.helpers";

import {
  BOOTSTRAP_SUPERADMIN_ERROR_MESSAGES,
  BOOTSTRAP_SUPERADMIN_NAME,
} from "./bootstrap-superadmin.constants";

export class Seed20260723000003_BootstrapSuperadmin extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existingSuperadmin = await em.findOne(User, {
      role: { code: EUserRole.SUPERADMIN },
      state: EUserState.ACTIVE,
      deletedAt: null,
    });

    if (existingSuperadmin) {
      return;
    }

    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(BOOTSTRAP_SUPERADMIN_ERROR_MESSAGES.MISSING_CREDENTIALS);
    }

    
    const userWithOtherRole = await em.findOne(User, {
      email,
      role: { code: { $ne: EUserRole.SUPERADMIN } },
    });

    if (userWithOtherRole) {
      throw new Error(BOOTSTRAP_SUPERADMIN_ERROR_MESSAGES.EMAIL_TAKEN_BY_OTHER_ROLE);
    }

    await ensureCredentialUser(em, {
      email,
      password,
      name: BOOTSTRAP_SUPERADMIN_NAME,
      role: EUserRole.SUPERADMIN,
      updateExistingPassword: true,
    });
  }
}
