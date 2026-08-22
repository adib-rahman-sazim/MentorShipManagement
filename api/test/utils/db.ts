import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";

import { TEST_DATABASE_SUFFIX } from "./db.constants";


const assertTestDatabase = (dbConnection: ReturnType<EntityManager["getConnection"]>): void => {
  const databaseName = dbConnection.getPlatform().getConfig().get("dbName");

  if (!databaseName?.endsWith(TEST_DATABASE_SUFFIX)) {
    throw new Error(
      `Refusing to truncate "${databaseName}": it does not look like a test database ` +
        `(expected a name ending in "${TEST_DATABASE_SUFFIX}"). Check that the test scripts ` +
        `run dotenv with -o so .env.test.local actually overrides the container environment.`,
    );
  }
};

/**
 * @description
 * Truncates database tables with deadlock prevention mechanisms:
 * 1. Refuses to run against anything but a test database
 * 2. Uses advisory locks to ensure only one truncation happens at a time
 * 3. Sorts tables to ensure consistent locking order
 * 4. Implements retry logic for resilience
 */
export const truncateTables = async (
  dbService: EntityManager<IDatabaseDriver<Connection>>,
  excludeTables: string[] = [],
): Promise<void> => {
  const dbConnection = dbService.getConnection();

  assertTestDatabase(dbConnection);

  try {
    await dbConnection.execute("SELECT pg_advisory_lock(1234)");

    const excludeClause = excludeTables.length
      ? `AND table_name NOT IN (${excludeTables.map((table) => `'${table}'`).join(",")})`
      : "";

    const tableNames: Array<{ table_name: string }> = await dbConnection.execute(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name != 'mikro_orm_migrations' ${excludeClause};`,
    );

    if (tableNames.length === 0) {
      return;
    }

    tableNames.sort((a, b) => a.table_name.localeCompare(b.table_name));
    const tableList = tableNames.map((tableNameObj) => `"${tableNameObj.table_name}"`).join(", ");

    let retries = 3;
    let success = false;
    let lastError: unknown;

    while (!success && retries > 0) {
      try {
        await dbConnection.execute(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
        success = true;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries === 0) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100 * (4 - retries)));
      }
    }

    if (!success) {
      console.error("Failed to truncate tables after multiple attempts:", lastError);
      throw lastError;
    }
  } finally {
    await dbConnection.execute("SELECT pg_advisory_unlock(1234)");
  }
};
