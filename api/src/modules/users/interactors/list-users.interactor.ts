import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import type { IListUsersContext, IPaginatedUsersResponse } from "../users.interfaces";
import { UsersRepository } from "../users.repository";
import { UsersSerializer } from "../users.serializer";

@Injectable()
export class ListUsersInteractor
  implements IBaseInteractor<IListUsersContext, IPaginatedUsersResponse>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSerializer: UsersSerializer,
  ) {}

  async execute({ query, organizationId }: IListUsersContext): Promise<IPaginatedUsersResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { users, total } = await this.usersRepository.findAllPaginated({
      page,
      limit,
      search: query.search,
      state: query.state,
      organizationId,
    });

    return {
      data: this.usersSerializer.serializeMany(users),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
