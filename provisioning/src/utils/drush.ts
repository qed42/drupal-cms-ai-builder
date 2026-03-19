import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type winston from "winston";

const execFileAsync = promisify(execFile);

export interface DrushOptions {
  /** The sites subdirectory (e.g., "example.com"). */
  sitesSubdir: string;
  /** Path to the Drupal root. */
  drupalRoot: string;
  /** Logger instance. */
  logger: winston.Logger;
}

/**
 * Execute a Drush command inside the DDEV web container.
 *
 * The provisioning engine runs in the platform container, so we use
 * `docker exec` to run drush inside the DDEV web container which has
 * PHP, Drupal, and drush available.
 */
export async function drush(
  command: string,
  args: string[],
  options: DrushOptions
): Promise<string> {
  const { sitesSubdir, drupalRoot, logger } = options;

  const ddevWebContainer =
    process.env.DDEV_WEB_CONTAINER || "ddev-ai-site-builder-web";

  // Map the drupal root to the path inside the DDEV web container.
  // The platform mounts drupal-site at /drupal-site, but inside DDEV
  // web container the docroot is at /var/www/html.
  const ddevDrupalRoot = "/var/www/html";

  // Translate paths from platform container (/drupal-site/) to DDEV web
  // container (/var/www/html/) so file references resolve correctly.
  const translatedArgs = args.map((arg) =>
    arg.replace(/\/drupal-site\//g, "/var/www/html/")
  );

  const drushArgs = [
    `--root=${ddevDrupalRoot}`,
    `--uri=${sitesSubdir}`,
    command,
    ...translatedArgs,
    "-y",
  ];

  const drushBin = "/var/www/html/vendor/bin/drush";

  const dockerArgs = [
    "exec", ddevWebContainer,
    drushBin,
    ...drushArgs,
  ];

  logger.info(`Running: docker exec ${ddevWebContainer} drush ${drushArgs.join(" ")}`, { step: "drush" });

  try {
    const { stdout, stderr } = await execFileAsync("docker", dockerArgs, {
      timeout: 300_000, // 5 minute timeout
    });

    if (stderr) {
      logger.warn(`Drush stderr: ${stderr}`, { step: "drush" });
    }

    return stdout.trim();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    logger.error(`Drush command failed: ${message}`, { step: "drush" });
    throw error;
  }
}
