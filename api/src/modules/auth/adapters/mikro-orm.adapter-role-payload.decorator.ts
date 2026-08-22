/* biome-ignore-all lint/suspicious/noExplicitAny: Better Auth adapter signatures require any. */
import type { EntityManager, EntityMetadata } from "@mikro-orm/core";

import { User } from "@/common/entities/users.entity";
import type { EUserRole } from "@/common/enums/roles.enums";

import { USER_ENTITY_NAME } from "./mikro-orm.adapter.constants";

export class MikroOrmAdapterRolePayloadDecorator {
  async decorate(
    em: EntityManager,
    metadata: EntityMetadata,
    output: Record<string, any>,
  ): Promise<Record<string, any>> {
    const userId = this.getUserId(metadata, output);

    if (!userId) {
      return output;
    }

    const roleByUserId = await this.getRoleByUserId(em, [userId]);

    return { ...output, role: roleByUserId.get(userId) ?? null };
  }

  async decorateMany(
    em: EntityManager,
    metadata: EntityMetadata,
    outputs: Array<Record<string, any>>,
  ): Promise<Array<Record<string, any>>> {
    const userIds = outputs
      .map((output) => this.getUserId(metadata, output))
      .filter((userId): userId is string => Boolean(userId));

    if (userIds.length === 0) {
      return outputs;
    }

    const roleByUserId = await this.getRoleByUserId(em, [...new Set(userIds)]);

    return outputs.map((output) => {
      const userId = this.getUserId(metadata, output);

      if (!userId) {
        return output;
      }

      return { ...output, role: roleByUserId.get(userId) ?? null };
    });
  }

  private async getRoleByUserId(
    em: EntityManager,
    userIds: string[],
  ): Promise<Map<string, EUserRole>> {
    const users = await em
      .getRepository(User)
      .find({ id: { $in: userIds } }, { populate: ["role"] });

    return new Map(users.map((user) => [user.id, user.role.code]));
  }

  private getUserId(metadata: EntityMetadata, output: Record<string, any>): string | null {
    if (metadata.className === USER_ENTITY_NAME && typeof output.id === "string") {
      return output.id;
    }


    return null;
  }
}