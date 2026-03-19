/**
 * DELETE /api/blueprint/[siteId]/remove-page
 *
 * Removes a page from the blueprint by index.
 *
 * TASK-235: Page Add/Remove from Review
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RemovePageBody {
  pageIndex: number;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;
  const body: RemovePageBody = await req.json();

  if (typeof body.pageIndex !== "number") {
    return NextResponse.json({ error: "pageIndex is required" }, { status: 400 });
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
    include: { blueprint: true },
  });

  if (!site?.blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  if (site.status !== "review") {
    return NextResponse.json(
      { error: "Removing pages is only allowed during review" },
      { status: 403 }
    );
  }

  const payload = site.blueprint.payload as Record<string, unknown>;
  const pages = payload.pages as Array<Record<string, unknown>>;

  if (!pages || body.pageIndex >= pages.length || body.pageIndex < 0) {
    return NextResponse.json({ error: "Invalid page index" }, { status: 400 });
  }

  // Must keep at least 1 page
  if (pages.length <= 1) {
    return NextResponse.json(
      { error: "Cannot remove the last page. At least one page is required." },
      { status: 400 }
    );
  }

  const removedPage = pages[body.pageIndex];
  const updatedPages = pages.filter((_, i) => i !== body.pageIndex);

  await prisma.blueprint.update({
    where: { id: site.blueprint.id },
    data: { payload: JSON.parse(JSON.stringify({ ...payload, pages: updatedPages })) },
  });

  return NextResponse.json({
    success: true,
    removedPage,
    remainingPages: updatedPages.length,
  });
}
