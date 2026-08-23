import { ConflictException } from "@nestjs/common";

import type { EntityManager, MikroORM } from "@mikro-orm/postgresql";

import { hashPassword } from "better-auth/crypto";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { Account } from "@/common/entities/accounts.entity";
import { Role } from "@/common/entities/roles.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { CREDENTIAL_PROVIDER_ID } from "@/modules/auth/auth.constants";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { RolesRepository } from "@/modules/permissions/roles.repository";
import { AccountsRepository } from "@/modules/users/accounts.repository";
import { CreateUserInteractor } from "@/modules/users/interactors/create-user.interactor";
import { USER_ERROR_MESSAGES } from "@/modules/users/users.constants";
import type { CreateUserDto } from "@/modules/users/users.dtos";
import { UsersRepository } from "@/modules/users/users.repository";
import { UsersSerializer } from "@/modules/users/users.serializer";
import { UserFactory } from "@/test/utils/factories/users.factory";
import { createOfflineOrm } from "@/test/utils/helpers/offline-orm.helpers";

vi.mock("better-auth/crypto", () => ({
  hashPassword: vi.fn(),
}));

const HASHED_PASSWORD = "argon2id-mock-digest";
const RAW_PASSWORD = "Password123";
const NEW_USER_ID = "11111111-1111-4111-8111-111111111111";
const MENTOR_ROLE_ID = "22222222-2222-4222-8222-222222222222";

describe("CreateUserInteractor", () => {
  let orm: MikroORM;
  let userFactory: UserFactory;

  let usersRepository: DeepMockProxy<UsersRepository>;
  let rolesRepository: DeepMockProxy<RolesRepository>;
  let usersSerializer: DeepMockProxy<UsersSerializer>;
  let caslCacheService: DeepMockProxy<CaslCacheService>;
  let entityManager: DeepMockProxy<EntityManager>;
  let accountsRepository: AccountsRepository;
  let interactor: CreateUserInteractor;

  const buildDto = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => ({
    email: "new.mentor@sazim.io",
    name: "New Mentor",
    password: RAW_PASSWORD,
    role: EUserRole.MENTOR,
    ...overrides,
  });

  const makeRole = () =>
    orm.em.merge(Role, { id: MENTOR_ROLE_ID, code: EUserRole.MENTOR, name: "Mentor" });

  const makeUser = (): User =>
    userFactory.makeEntity({
      id: NEW_USER_ID,
      email: "new.mentor@sazim.io",
      name: "New Mentor",
      role: makeRole(),
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
    entityManager = mockDeep<EntityManager>();
    accountsRepository = new AccountsRepository(entityManager, Account);

    usersRepository.transactional.mockImplementation((callback) => callback(entityManager));

    vi.mocked(hashPassword).mockResolvedValue(HASHED_PASSWORD);

    interactor = new CreateUserInteractor(
      usersRepository,
      accountsRepository,
      rolesRepository,
      usersSerializer,
      caslCacheService,
    );
  });

  afterEach(() => {
    orm.em.clear();
    vi.clearAllMocks();
  });

  const arrangeNewUser = () => {
    const user = makeUser();

    rolesRepository.findByCode.mockResolvedValue(makeRole());
    usersRepository.findByEmailIncludingDeleted.mockResolvedValue(null);
    usersRepository.createUser.mockReturnValue(user);

    return { user };
  };

  it("rejects an email that already belongs to a live user", async () => {
    rolesRepository.findByCode.mockResolvedValue(makeRole());
    usersRepository.findByEmailIncludingDeleted.mockResolvedValue(makeUser());

    await expect(interactor.execute({ dto: buildDto() })).rejects.toThrow(
      new ConflictException(USER_ERROR_MESSAGES.EMAIL_ALREADY_IN_USE),
    );

    expect(usersRepository.createUser).not.toHaveBeenCalled();
  });

  it("resolves the role by its code", async () => {
    arrangeNewUser();

    await interactor.execute({ dto: buildDto({ role: EUserRole.SENSEI }) });

    expect(rolesRepository.findByCode).toHaveBeenCalledWith(EUserRole.SENSEI);
  });

  it("hashes the password and never persists the raw value", async () => {
    arrangeNewUser();

    await interactor.execute({ dto: buildDto() });

    expect(hashPassword).toHaveBeenCalledWith(RAW_PASSWORD);

    const [, accountPayload] = entityManager.create.mock.calls[0];

    expect(accountPayload).toMatchObject({ password: HASHED_PASSWORD });
    expect(JSON.stringify(accountPayload)).not.toContain(RAW_PASSWORD);
  });

  it("binds the credential account to the newly created user", async () => {
    const { user } = arrangeNewUser();

    await interactor.execute({ dto: buildDto() });

    expect(entityManager.create).toHaveBeenCalledWith(
      Account,
      expect.objectContaining({
        user,
        accountId: user.id,
        providerId: CREDENTIAL_PROVIDER_ID,
      }),
    );
  });
});
