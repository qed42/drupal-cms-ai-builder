import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAutoLoginToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

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

    const token = createAutoLoginToken({
      email: session.user.email,
      name: session.user.name || "",
      domain: site.subdomain || site.drupalUrl,
    });

    const autoLoginUrl = `${site.drupalUrl}/auto-login?token=${encodeURIComponent(token)}&redirect=/canvas`;

    return NextResponse.json({ token, url: autoLoginUrl });
  } catch (error) {
    console.error("Error creating login token:", error);
    return NextResponse.json(
      { error: "Failed to create login token" },
      { status: 500 }
    );
  }
}
