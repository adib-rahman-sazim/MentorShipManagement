import type { MikroORM } from "@mikro-orm/postgresql";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { Role } from "@/common/entities/roles.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { RolesRepository } from "@/modules/permissions/roles.repository";
import { UpdateUserInteractor } from "@/modules/users/interactors/update-user.interactor";
import { UsersRepository } from "@/modules/users/users.repository";
import { UsersSerializer } from "@/modules/users/users.serializer";
import { UserFactory } from "@/test/utils/factories/users.factory";
import { createOfflineOrm } from "@/test/utils/helpers/offline-orm.helpers";

const TARGET_USER_ID = "66666666-6666-4666-8666-666666666666";
const MENTEE_ROLE_ID = "77777777-7777-4777-8777-777777777777";
const MENTOR_ROLE_ID = "88888888-8888-4888-8888-888888888888";

describe("UpdateUserInteractor", () => {
  let orm: MikroORM;
  let userFactory: UserFactory;

  let usersRepository: DeepMockProxy<UsersRepository>;
  let rolesRepository: DeepMockProxy<RolesRepository>;
  let usersSerializer: DeepMockProxy<UsersSerializer>;
  let caslCacheService: DeepMockProxy<CaslCacheService>;
  let interactor: UpdateUserInteractor;

  const makeUser = (): User =>
    userFactory.makeEntity({
      id: TARGET_USER_ID,
      email: "mentee@sazim.io",
      name: "Mock Mentee",
      state: EUserState.ACTIVE,
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
    rolesRepository = mockDeep<RolesRepository>();
    usersSerializer = mockDeep<UsersSerializer>();
    caslCacheService = mockDeep<CaslCacheService>();

    interactor = new UpdateUserInteractor(
      usersRepository,
      rolesRepository,
      usersSerializer,
      caslCacheService,
    );
  });

  afterEach(() => {
    orm.em.clear();
    vi.clearAllMocks();
  });

  it("invalidates the ability cache when the role actually changes", async () => {
    const user = makeUser();
    usersRepository.findById.mockResolvedValue(user);
    rolesRepository.findByCode.mockResolvedValue(
      orm.em.merge(Role, { id: MENTOR_ROLE_ID, code: EUserRole.MENTOR, name: "Mentor" }),
    );

    await interactor.execute({ userId: TARGET_USER_ID, dto: { role: EUserRole.MENTOR } });

    expect(user.role.code).toBe(EUserRole.MENTOR);
    expect(caslCacheService.invalidateUser).toHaveBeenCalledWith(TARGET_USER_ID);
  });

  it("does not invalidate the ability cache when only the name changes", async () => {
    const user = makeUser();
    usersRepository.findById.mockResolvedValue(user);

    await interactor.execute({ userId: TARGET_USER_ID, dto: { name: "Renamed" } });

    expect(user.name).toBe("Renamed");
    expect(caslCacheService.invalidateUser).not.toHaveBeenCalled();
  });
});
