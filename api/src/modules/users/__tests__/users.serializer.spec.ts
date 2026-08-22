import { MikroORM } from "@mikro-orm/postgresql";

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { Account } from "@/common/entities/accounts.entity";
import { Role } from "@/common/entities/roles.entity";
import { Session } from "@/common/entities/sessions.entity";
import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { UserFactory } from "@/test/utils/factories/users.factory";

import type { IUserResponse } from "../users.interfaces";
import { UsersSerializer } from "../users.serializer";

describe("UsersSerializer", () => {
  let orm: MikroORM;
  let userFactory: UserFactory;

  const serializer = new UsersSerializer();

  beforeAll(() => {
    orm = MikroORM.initSync({
      clientUrl: "postgresql://localhost:5432/unused",
      connect: false,
      allowGlobalContext: true,
      entities: [User, Account, Role, Session],
    });
    userFactory = new UserFactory(orm.em);
  });

  afterAll(async () => {
    await orm.close();
  });

  afterEach(() => {
    orm.em.clear();
  });

  
  const makeManagedRole = (id: string, code: EUserRole, name: string) =>
    orm.em.merge(Role, { id, code, name });

  const makeUser = (overrides: Parameters<UserFactory["makeEntity"]>[0] = {}) =>
    userFactory.makeEntity({
      id: "user-123",
      email: "sensei@sazim.io",
      name: "Mock Sensei",
      state: EUserState.ACTIVE,
      role: makeManagedRole("role-123", EUserRole.SENSEI, "Sensei"),
      ...overrides,
    });

  describe("serialize", () => {
    it("should flatten the populated role relation down to its code", () => {
      const result = serializer.serialize<User, IUserResponse>(makeUser());

      expect(result.role).toBe(EUserRole.SENSEI);
    });

    it("should leave the rest of the user intact", () => {
      const result = serializer.serialize<User, IUserResponse>(makeUser());

      expect(result).toMatchObject({
        id: "user-123",
        email: "sensei@sazim.io",
        name: "Mock Sensei",
        state: EUserState.ACTIVE,
      });
    });

    it("should not expose sessions or accounts", () => {
      const result = serializer.serialize<User, IUserResponse>(makeUser());

      expect(result).not.toHaveProperty("sessions");
      expect(result).not.toHaveProperty("accounts");
    });

    it("should leave an unpopulated role reference alone rather than inventing a code", () => {
      const user = makeUser({ role: orm.em.getReference(Role, "role-456") });

      const result = serializer.serialize<User, IUserResponse>(user);

      expect(result.role).toEqual({ id: "role-456" });
    });
  });

  describe("serializeMany", () => {
    it("should flatten the role on each row independently", () => {
      const users = [
        makeUser(),
        makeUser({
          id: "user-456",
          email: "mentee@sazim.io",
          name: "Mock Mentee",
          role: makeManagedRole("role-456", EUserRole.MENTEE, "Mentee"),
        }),
      ];

      const result = serializer.serializeMany<User, IUserResponse>(users);

      expect(result.map((user) => user.role)).toEqual([EUserRole.SENSEI, EUserRole.MENTEE]);
    });

    it("should return an empty array when given no rows", () => {
      expect(serializer.serializeMany<User, IUserResponse>([])).toEqual([]);
    });
  });
});
