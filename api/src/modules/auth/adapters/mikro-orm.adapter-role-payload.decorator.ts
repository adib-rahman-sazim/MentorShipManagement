/* biome-ignore-all lint/suspicious/noExplicitAny: Better Auth adapter signatures require any. */
import type { EntityManager, EntityMetadata } from "@mikro-orm/core";

import { UserRole } from "@/common/entities/user-roles.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import {
  isOrganizationBoundRole,
  isSystemLevelRole,
  normalizeRolesByPriority,
  resolveEffectiveRole,
} from "@/modules/permissions/permissions.role-priority.helpers";

import { SESSION_ENTITY_NAME, USER_ENTITY_NAME } from "./mikro-orm.adapter.constants";
import type { IRoleDecorationContext } from "./mikro-orm.adapter-role-payload.interfaces";

export class MikroOrmAdapterRolePayloadDecorator {
  async decorate(
    em: EntityManager,
    metadata: EntityMetadata,
    output: Record<string, any>,
  ): Promise<Record<string, any>> {
    const context = this.getRoleDecorationContext(metadata, output);

    if (!context) {
      return output;
    }

    const { userId, activeOrganizationId } = context;
    const roles = await this.getDecoratedRoles(em, userId, activeOrganizationId);

    return this.assignRoles(output, roles);
  }

  async decorateMany(
    em: EntityManager,
    metadata: EntityMetadata,
    outputs: Array<Record<string, any>>,
  ): Promise<Array<Record<string, any>>> {
    const contexts = outputs
      .map((output) => this.getRoleDecorationContext(metadata, output))
      .filter((context): context is IRoleDecorationContext => Boolean(context));
    const rolesByContextKey = await this.getDecoratedRolesByContextKey(em, contexts);

    return outputs.map((output) => {
      const context = this.getRoleDecorationContext(metadata, output);

      if (!context) {
        return output;
      }

      return this.assignRoles(output, rolesByContextKey.get(this.getContextKey(context)) ?? []);
    });
  }

  private async getDecoratedRoles(
    em: EntityManager,
    userId: string,
    activeOrganizationId?: string | null,
  ): Promise<EUserRole[]> {
    const rolesByContextKey = await this.getDecoratedRolesByContextKey(em, [
      { userId, activeOrganizationId },
    ]);

    return rolesByContextKey.get(this.getContextKey({ userId, activeOrganizationId })) ?? [];
  }

  private async getDecoratedRolesByContextKey(
    em: EntityManager,
    contexts: IRoleDecorationContext[],
  ): Promise<Map<string, EUserRole[]>> {
    const userIds = [...new Set(contexts.map((context) => context.userId))];

    if (userIds.length === 0) {
      return new Map();
    }

    const activeOrganizationIds = [
      ...new Set(
        contexts
          .map((context) => context.activeOrganizationId)
          .filter((activeOrganizationId): activeOrganizationId is string =>
            Boolean(activeOrganizationId),
          ),
      ),
    ];

    const rows = await em.getRepository(UserRole).find(
      {
        user: { id: { $in: userIds } },
        $or: [
          { organization: null },
          ...(activeOrganizationIds.length > 0
            ? [{ organization: { id: { $in: activeOrganizationIds } } }]
            : []),
        ],
      },
      { populate: ["role"] },
    );

    const activeOrganizationIdByContextKey = new Map(
      contexts.map((context) => [this.getContextKey(context), context.activeOrganizationId]),
    );
    const rolesByContextKey = new Map<string, Set<EUserRole>>();

    activeOrganizationIdByContextKey.forEach((_activeOrganizationId, contextKey) => {
      rolesByContextKey.set(contextKey, new Set<EUserRole>());
    });

    rows.forEach((row) => {
      const slug = row.role.slug as EUserRole;
      if (!Object.values(EUserRole).includes(slug)) {
        return;
      }

      const userId = row.user.id;
      activeOrganizationIdByContextKey.forEach((activeOrganizationId, contextKey) => {
        if (!contextKey.startsWith(`${userId}:`)) {
          return;
        }

        const roles = rolesByContextKey.get(contextKey) ?? new Set<EUserRole>();

        if (row.organization == null && (isSystemLevelRole(slug) || slug === EUserRole.CUSTOMER)) {
          roles.add(slug);
        }

        if (
          row.organization != null &&
          row.organization.id === activeOrganizationId &&
          isOrganizationBoundRole(slug)
        ) {
          roles.add(slug);
        }

        rolesByContextKey.set(contextKey, roles);
      });
    });

    return new Map(
      [...rolesByContextKey.entries()].map(([contextKey, roles]) => [
        contextKey,
        normalizeRolesByPriority([...roles]),
      ]),
    );
  }

  private getContextKey({ userId, activeOrganizationId }: IRoleDecorationContext): string {
    return `${userId}:${activeOrganizationId ?? ""}`;
  }

  private getRoleDecorationContext(
    metadata: EntityMetadata,
    output: Record<string, any>,
  ): IRoleDecorationContext | null {
    let userId: unknown;

    if (metadata.className === USER_ENTITY_NAME) {
      userId = output.id;
    } else if (metadata.className === SESSION_ENTITY_NAME) {
      userId = output.userId;
    }

    if (typeof userId !== "string") {
      return null;
    }

    const activeOrganizationId =
      metadata.className === SESSION_ENTITY_NAME && typeof output.activeOrganizationId === "string"
        ? output.activeOrganizationId
        : undefined;

    return { userId, activeOrganizationId };
  }

  private assignRoles(output: Record<string, any>, roles: EUserRole[]): Record<string, any> {
    return {
      ...output,
      roles,
      role: resolveEffectiveRole(roles),
    };
  }
}
