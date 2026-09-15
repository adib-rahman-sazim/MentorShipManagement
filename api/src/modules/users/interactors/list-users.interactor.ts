import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import type { IListUsersContext } from "../users.interfaces";
import { UsersRepository } from "../users.repository";
import type { PaginatedUsersResponse } from "../users.responses";
import { UsersSerializer } from "../users.serializer";

@Injectable()
export class ListUsersInteractor
  implements IBaseInteractor<IListUsersContext, PaginatedUsersResponse>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSerializer: UsersSerializer,
  ) {}

  async execute({ query }: IListUsersContext): Promise<PaginatedUsersResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { users, total } = await this.usersRepository.findAllPaginated({
      page,
      limit,
      search: query.search,
      state: query.state,
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
