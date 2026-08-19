import type { EntityManager } from "@mikro-orm/core";

import { Role } from "@/common/entities/roles.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { isSystemLevelRole } from "@/modules/permissions/permissions.role-priority.helpers";

export async function ensureRole(
  em: EntityManager,
  slug: EUserRole,
  isSystem = isSystemLevelRole(slug),
): Promise<Role> {
  let role = await em.findOne(Role, { slug });
  if (!role) {
    role = em.create(Role, {
      slug,
      name: slug,
      isSystem,
    });
    await em.persistAndFlush(role);
  }
  return role;
}

export async function assignUserRole(
  em: EntityManager,
  user: User,
  slug: EUserRole,
  organizationId?: string | null,
): Promise<UserRole> {
  const role = await ensureRole(em, slug);
  const userRole = em.create(UserRole, {
    user,
    role,
    organization: organizationId ?? null,
  });
  em.persist(userRole);
  await em.flush();
  return userRole;
}
