import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";

import { User } from "@/common/entities/users.entity";

export const findUserByEmailOrFail = async (
  dbService: EntityManager<IDatabaseDriver<Connection>>,
  email: string,
) => {
  const user = await dbService.findOneOrFail(User, { email });

  return user;
};
