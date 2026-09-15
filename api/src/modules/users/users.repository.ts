import { type FilterQuery, LockMode, type RequiredEntityData } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import dayjs from "dayjs";

import { Session } from "@/common/entities/sessions.entity";
import { User } from "@/common/entities/users.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { NOT_SOFT_DELETED } from "./users.constants";
import type { IFindUsersOptions } from "./users.interfaces";

export class UsersRepository extends CustomSQLBaseRepository<User> {
  findById(id: string, em?: EntityManager): Promise<User | null> {
    return this.getScopedRepository(em).findOne(
      { id, ...NOT_SOFT_DELETED },
      { populate: ["role"] },
    );
  }

  findByEmail(email: string, em?: EntityManager): Promise<User | null> {
    return this.getScopedRepository(em).findOne({ email, ...NOT_SOFT_DELETED });
  }

  findByEmailIncludingDeleted(email: string, em?: EntityManager): Promise<User | null> {
    return this.getScopedRepository(em).findOne({ email }, { populate: ["role"] });
  }

  findByIdForUpdate(id: string, em?: EntityManager): Promise<User> {
    return this.getScopedRepository(em).findOneOrFail(
      { id, ...NOT_SOFT_DELETED },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
  }

  async findAllPaginated(
    options: IFindUsersOptions,
    em?: EntityManager,
  ): Promise<{ users: User[]; total: number }> {
    const { page, limit, search, state } = options;
    const offset = (page - 1) * limit;

    const where: FilterQuery<User> = { ...NOT_SOFT_DELETED };

    if (state) {
      where.state = state;
    }

    if (search) {
      where.$or = [{ email: { $like: `%${search}%` } }, { name: { $like: `%${search}%` } }];
    }

    const [users, total] = await this.getScopedEntityManager(em).findAndCount(User, where, {
      limit,
      offset,
      orderBy: { createdAt: "DESC" },
      populate: ["role"],
    });

    return { users, total };
  }

  createUser(data: RequiredEntityData<User>, em?: EntityManager): User {
    const scopedEntityManager = this.getScopedEntityManager(em);
    const user = scopedEntityManager.create(User, data);
    scopedEntityManager.persist(user);

    return user;
  }

  async update(id: string, data: Partial<User>, em?: EntityManager): Promise<User | null> {
    const user = await this.findById(id, em);
    if (!user) {
      return null;
    }
    this.getScopedEntityManager(em).assign(user, data);
    return user;
  }

  softDelete(user: User): void {
    user.deletedAt = dayjs().toDate();
  }

  deleteSessionsForUser(userId: string, em?: EntityManager): Promise<number> {
    return this.getScopedEntityManager(em).nativeDelete(Session, { user: userId });
  }
}
