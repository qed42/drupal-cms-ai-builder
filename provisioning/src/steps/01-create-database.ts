import { createDatabase } from "../utils/database.js";
import type { ProvisioningConfig, StepResult } from "../types.js";
import type winston from "winston";

export async function createDatabaseStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult> {
  const dbName = `site_${config.siteId}`;

  await createDatabase(dbName, config.database, logger);

  return {
    success: true,
    message: `Database ${dbName} created`,
    data: { dbName },
  };
}
