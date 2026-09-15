import { ForbiddenException, NotFoundException } from "@nestjs/common";

import type { EntityManager, MikroORM } from "@mikro-orm/postgresql";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { Role } from "@/common/entities/roles.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { DeleteUserInteractor } from "@/modules/users/interactors/delete-user.interactor";
import { USER_ERROR_MESSAGES } from "@/modules/users/users.constants";
import { UsersRepository } from "@/modules/users/users.repository";
import { UserFactory } from "@/test/utils/factories/users.factory";
import { createOfflineOrm } from "@/test/utils/helpers/offline-orm.helpers";

const TARGET_USER_ID = "33333333-3333-4333-8333-333333333333";
const ACTOR_ID = "44444444-4444-4444-8444-444444444444";
const MENTEE_ROLE_ID = "55555555-5555-4555-8555-555555555555";

describe("DeleteUserInteractor", () => {
  let orm: MikroORM;
  let userFactory: UserFactory;

  let usersRepository: DeepMockProxy<UsersRepository>;
  let caslCacheService: DeepMockProxy<CaslCacheService>;
  let transactionalEntityManager: DeepMockProxy<EntityManager>;
  let interactor: DeleteUserInteractor;

  const makeUser = (): User =>
    userFactory.makeEntity({
      id: TARGET_USER_ID,
      email: "mentee@sazim.io",
      name: "Mock Mentee",
      role: orm.em.merge(Role, { id: MENTEE_ROLE_ID, code: EUserRole.MENTEE, name: "Mentee" }),
    });

  beforeAll(() => {
    orm = createOfflineOrm();
    userFactory = new UserFactory(orm.em);
  });

  afterAll(async () => {
    await orm.close();
  });

  beforeEach(() => {
    usersRepository = mockDeep<UsersRepository>();
    caslCacheService = mockDeep<CaslCacheService>();
    transactionalEntityManager = mockDeep<EntityManager>();

    usersRepository.transactional.mockImplementation((callback) =>
      callback(transactionalEntityManager),
    );
    usersRepository.softDelete.mockImplementation(UsersRepository.prototype.softDelete);

    interactor = new DeleteUserInteractor(usersRepository, caslCacheService);
  });

  afterEach(() => {
    orm.em.clear();
    vi.clearAllMocks();
  });

  it("refuses to let an actor delete their own account", async () => {
    await expect(interactor.execute({ userId: ACTOR_ID, actorId: ACTOR_ID })).rejects.toThrow(
      new ForbiddenException(USER_ERROR_MESSAGES.CANNOT_DELETE_SELF),
    );

    expect(usersRepository.transactional).not.toHaveBeenCalled();
  });

  it("throws when the target user does not exist", async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(interactor.execute({ userId: TARGET_USER_ID, actorId: ACTOR_ID })).rejects.toThrow(
      new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND),
    );

    expect(usersRepository.softDelete).not.toHaveBeenCalled();
  });

  it("stamps deletedAt rather than removing the row", async () => {
    const user = makeUser();
    usersRepository.findById.mockResolvedValue(user);

    await interactor.execute({ userId: TARGET_USER_ID, actorId: ACTOR_ID });

    expect(user.deletedAt).toBeInstanceOf(Date);
    expect(usersRepository.remove).not.toHaveBeenCalled();
  });

  it("invalidates the ability cache for the deleted user", async () => {
    usersRepository.findById.mockResolvedValue(makeUser());

    await interactor.execute({ userId: TARGET_USER_ID, actorId: ACTOR_ID });

    expect(caslCacheService.invalidateUser).toHaveBeenCalledWith(TARGET_USER_ID);
  });
});
