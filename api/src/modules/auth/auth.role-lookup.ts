import type { MikroORM } from "@mikro-orm/postgresql";

import { Role } from "@/common/entities/roles.entity";
import type { EUserRole } from "@/common/enums/roles.enums";

export class AuthRoleLookup {
  private roleCodeById: Map<string, EUserRole> | null = null;

  constructor(private readonly orm: MikroORM) {}

  async getRoleCode(roleId?: string | null): Promise<EUserRole | null> {
    if (!roleId) {
      return null;
    }

    const cached = this.roleCodeById?.get(roleId);

    if (cached) {
      return cached;
    }

    await this.refresh();

    return this.roleCodeById?.get(roleId) ?? null;
  }

  private async refresh(): Promise<void> {
    const roles = await this.orm.em.fork().getRepository(Role).findAll();

    this.roleCodeById = new Map(roles.map((role) => [role.id, role.code]));
  }
}
