import { type FilterQuery, LockMode } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import { User } from "@/common/entities/users.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import type { IFindUsersOptions } from "./users.interfaces";

export class UsersRepository extends CustomSQLBaseRepository<User> {
  findById(id: string, em?: EntityManager): Promise<User | null> {
    return this.getScopedRepository(em).findOne({ id });
  }

  findByEmail(email: string, em?: EntityManager): Promise<User | null> {
    return this.getScopedRepository(em).findOne({ email });
  }

  findByIdForUpdate(id: string, em?: EntityManager): Promise<User> {
    return this.getScopedRepository(em).findOneOrFail(
      { id },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
  }

  async findAllPaginated(
    options: IFindUsersOptions,
    em?: EntityManager,
  ): Promise<{ users: User[]; total: number }> {
    const { page, limit, search, state, organizationId } = options;
    const offset = (page - 1) * limit;

    const where: FilterQuery<User> = {};

    if (state) {
      where.state = state;
    }

    if (search) {
      where.$or = [
        { email: { $like: `%${search}%` } },
        { firstName: { $like: `%${search}%` } },
        { lastName: { $like: `%${search}%` } },
        { name: { $like: `%${search}%` } },
      ];
    }

    if (organizationId) {
      where.memberships = { organization: { id: organizationId } };
    }

    const [users, total] = await this.getScopedEntityManager(em).findAndCount(User, where, {
      limit,
      offset,
      orderBy: { createdAt: "DESC" },
    });

    return { users, total };
  }

  async update(id: string, data: Partial<User>, em?: EntityManager): Promise<User | null> {
    const user = await this.findById(id, em);
    if (!user) {
      return null;
    }
    this.getScopedEntityManager(em).assign(user, data);
    return user;
  }
}
