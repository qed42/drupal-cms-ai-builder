import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
    include: { blueprint: true },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  if (!site.blueprint || site.blueprint.status !== "ready") {
    return NextResponse.json(
      { error: "Blueprint not available" },
      { status: 400 }
    );
  }

  const download = req.nextUrl.searchParams.get("download") === "true";
  const payload = site.blueprint.payload;

  if (download) {
    const filename = `${sanitizeFilename(site.name || "site")}-blueprint.json`;
    const body = JSON.stringify(payload, null, 2);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json({
    siteId: site.id,
    siteName: site.name,
    status: site.blueprint.status,
    payload,
  });
}
