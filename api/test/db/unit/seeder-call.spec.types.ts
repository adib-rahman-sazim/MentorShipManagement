import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

export type TSeederPrototypeWithCall = Seeder & {
  call: (em: EntityManager, seeders: unknown[]) => Promise<void>;
};
