import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { siteId } = await req.json();

    if (!siteId) {
      return NextResponse.json(
        { error: "site_id is required" },
        { status: 400 }
      );
    }

    // Look up the site and verify ownership.
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (!site.drupalUrl) {
      return NextResponse.json(
        { error: "Site is not yet provisioned" },
        { status: 400 }
      );
    }

    // Generate a one-time login link via Drupal's built-in mechanism.
    // This is more secure than custom JWT: single-use, time-limited, no custom code.
    const domainSuffix = process.env.SITE_DOMAIN_SUFFIX || "drupalcms.app";
    const domain = site.subdomain
      ? `${site.subdomain}.${domainSuffix}`
      : new URL(site.drupalUrl).hostname;

    const ddevWebContainer =
      process.env.DDEV_WEB_CONTAINER || "ddev-ai-site-builder-web";
    const drushBin = "/var/www/html/vendor/bin/drush";

    const { stdout } = await execFileAsync("docker", [
      "exec",
      ddevWebContainer,
      drushBin,
      `--root=/var/www/html`,
      `--uri=${domain}`,
      "user:login",
      "--uid=1",
      "--redirect-path=/canvas",
      "-y",
    ], { timeout: 30_000 });

    // drush uli outputs a URL like: https://domain/user/reset/1/1234567890/hash/login?destination=/canvas
    // or http://default/user/reset/... — we need to rewrite the base URL.
    let loginUrl = stdout.trim();

    // Replace the drush-generated base URL with the actual site URL.
    // Drush may output http://default or http://{domain} depending on config.
    loginUrl = loginUrl.replace(
      /^https?:\/\/[^/]+/,
      site.drupalUrl.replace(/\/$/, "")
    );

    return NextResponse.json({ url: loginUrl });
  } catch (error) {
    console.error("Error creating one-time login:", error);
    return NextResponse.json(
      { error: "Failed to create login link" },
      { status: 500 }
    );
  }
}
