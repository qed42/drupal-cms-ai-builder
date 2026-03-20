import { createDatabase } from "../utils/database.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function createDatabaseStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const { name: dbName, user: siteUser, password: sitePassword } = config.siteDatabase;

  await createDatabase(dbName, config.database, logger, {
    user: siteUser,
    password: sitePassword,
  });

  return {
    success: true,
    message: `Database ${dbName} created with dedicated user ${siteUser}`,
    data: { dbName, siteUser },
  };
}
