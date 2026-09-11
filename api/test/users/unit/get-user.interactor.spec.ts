import { NotFoundException } from "@nestjs/common";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { GetUserInteractor } from "@/modules/users/interactors/get-user.interactor";
import { USER_ERROR_MESSAGES } from "@/modules/users/users.constants";
import { UsersRepository } from "@/modules/users/users.repository";
import { UsersSerializer } from "@/modules/users/users.serializer";

const TARGET_USER_ID = "99999999-9999-4999-8999-999999999999";

describe("GetUserInteractor", () => {
  let usersRepository: DeepMockProxy<UsersRepository>;
  let interactor: GetUserInteractor;

  beforeEach(() => {
    usersRepository = mockDeep<UsersRepository>();
    interactor = new GetUserInteractor(usersRepository, new UsersSerializer());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("throws when no live user matches the id", async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(interactor.execute(TARGET_USER_ID)).rejects.toThrow(
      new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND),
    );
  });
});
