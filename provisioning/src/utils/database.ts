import mysql from "mysql2/promise";
import type winston from "winston";

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

/**
 * Create a new MySQL database and a dedicated per-site user.
 */
export async function createDatabase(
  dbName: string,
  config: DatabaseConfig,
  logger: winston.Logger,
  siteUser?: { user: string; password: string }
): Promise<void> {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });

  try {
    const safeName = dbName.replace(/[^a-zA-Z0-9_]/g, "");
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${safeName}\``);

    if (siteUser) {
      // Create a dedicated MySQL user for this site with limited privileges.
      const safeUser = siteUser.user.replace(/[^a-zA-Z0-9_]/g, "");
      // Escape password for SQL string (replace \ and ' to prevent injection).
      // Note: DDL statements like CREATE USER don't support ? placeholders in mysql2.
      const safePassword = siteUser.password.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      // CREATE USER ... IF NOT EXISTS to support retries.
      await connection.execute(
        `CREATE USER IF NOT EXISTS '${safeUser}'@'%' IDENTIFIED BY '${safePassword}'`
      );
      await connection.execute(
        `GRANT ALL PRIVILEGES ON \`${safeName}\`.* TO '${safeUser}'@'%'`
      );
      await connection.execute("FLUSH PRIVILEGES");
      logger.info(`Database "${safeName}" created with dedicated user "${safeUser}".`, { step: "create-database" });
    } else {
      // Fallback: grant to the admin user.
      const safeUser = config.user.replace(/[^a-zA-Z0-9_]/g, "");
      await connection.execute(
        `GRANT ALL PRIVILEGES ON \`${safeName}\`.* TO '${safeUser}'@'%'`
      );
      logger.info(`Database "${safeName}" created.`, { step: "create-database" });
    }
  } finally {
    await connection.end();
  }
}

/**
 * Drop a database and optionally its dedicated user (for rollback).
 */
export async function dropDatabase(
  dbName: string,
  config: DatabaseConfig,
  logger: winston.Logger,
  siteUser?: string
): Promise<void> {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });

  try {
    const safeName = dbName.replace(/[^a-zA-Z0-9_]/g, "");
    await connection.execute(`DROP DATABASE IF EXISTS \`${safeName}\``);
    logger.info(`Database "${safeName}" dropped.`, { step: "rollback" });

    if (siteUser) {
      const safeUser = siteUser.replace(/[^a-zA-Z0-9_]/g, "");
      await connection.execute(`DROP USER IF EXISTS '${safeUser}'@'%'`);
      logger.info(`User "${safeUser}" dropped.`, { step: "rollback" });
    }
  } finally {
    await connection.end();
  }
}
