import { spawn } from "node:child_process";
import { writeFile, mkdtemp } from "node:fs/promises";
import { openSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export interface ProvisioningParams {
  siteId: string;
  siteName: string;
  email: string;
  industry: string;
  subdomain: string;
  blueprintPayload: Record<string, unknown>;
}

/**
 * Generates a unique subdomain from a site name.
 * Slugifies the name and appends a short random suffix.
 */
export function generateSubdomain(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug || "site"}-${suffix}`;
}

/**
 * Spawns the provisioning engine as a detached child process.
 * Returns immediately — provisioning runs in the background.
 */
export async function spawnProvisioning(
  params: ProvisioningParams
): Promise<void> {
  // Write blueprint to the shared drupal-site volume so both the platform
  // container and DDEV web container can access it.
  const sharedDir = "/drupal-site/blueprints";
  const tempDir = await mkdtemp(join(sharedDir, "bp-"));
  const blueprintPath = join(tempDir, "blueprint.json");
  await writeFile(
    blueprintPath,
    JSON.stringify(params.blueprintPayload),
    "utf-8"
  );

  const domainSuffix = process.env.SITE_DOMAIN_SUFFIX || "drupalcms.app";
  const domain = `${params.subdomain}.${domainSuffix}`;
  const provisioningScript = "/provisioning/src/provision.ts";

  // Build the platform callback URL.
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const callbackUrl = `${baseUrl}/api/provision/callback`;

  const args = [
    provisioningScript,
    "--blueprint",
    blueprintPath,
    "--domain",
    domain,
    "--email",
    params.email,
    "--site-name",
    params.siteName,
    "--site-id",
    params.siteId,
    "--industry",
    params.industry,
    "--callback-url",
    callbackUrl,
  ];

  // Add database config from env if available.
  if (process.env.DB_HOST) args.push("--db-host", process.env.DB_HOST);
  if (process.env.DB_PORT) args.push("--db-port", process.env.DB_PORT);
  if (process.env.DB_USER) args.push("--db-user", process.env.DB_USER);
  if (process.env.DB_PASSWORD)
    args.push("--db-password", process.env.DB_PASSWORD);

  const logPath = join(tempDir, "provision.log");
  const logFd = openSync(logPath, "a");

  const child = spawn("npx", ["tsx", ...args], {
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env: { ...process.env },
  });

  child.unref();

  console.log(
    `[provisioning] Spawned for site ${params.siteId} (PID: ${child.pid})`
  );
  console.log(`[provisioning] Logs: ${logPath}`);
}
