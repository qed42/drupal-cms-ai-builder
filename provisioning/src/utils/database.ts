import mysql from "mysql2/promise";
import type winston from "winston";

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

/**
 * Create a new MySQL database for a site.
 */
export async function createDatabase(
  dbName: string,
  config: DatabaseConfig,
  logger: winston.Logger
): Promise<void> {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });

  try {
    // Sanitize database name to prevent SQL injection.
    const safeName = dbName.replace(/[^a-zA-Z0-9_]/g, "");
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${safeName}\``);
    const safeUser = config.user.replace(/[^a-zA-Z0-9_]/g, "");
    await connection.execute(
      `GRANT ALL PRIVILEGES ON \`${safeName}\`.* TO '${safeUser}'@'%'`
    );
    logger.info(`Database "${safeName}" created.`, { step: "create-database" });
  } finally {
    await connection.end();
  }
}

/**
 * Drop a database (for rollback).
 */
export async function dropDatabase(
  dbName: string,
  config: DatabaseConfig,
  logger: winston.Logger
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
  } finally {
    await connection.end();
  }
}
