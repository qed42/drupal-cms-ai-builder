import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;

  // Verify ownership and fetch blueprint with versions
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
    include: {
      blueprint: {
        include: {
          versions: {
            orderBy: { version: "asc" },
            select: { version: true, label: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!site || !site.blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  const blueprint = site.blueprint;

  // Build version list — always include "current" as the working version
  const versions = [
    ...blueprint.versions.map((v) => ({
      version: v.version,
      label: v.label,
      createdAt: v.createdAt,
    })),
    {
      version: blueprint.versions.length + 1,
      label: "current",
      createdAt: blueprint.updatedAt,
    },
  ];

  return NextResponse.json({
    blueprintId: blueprint.id,
    hasOriginal: blueprint.originalPayload !== null,
    versions,
  });
}
