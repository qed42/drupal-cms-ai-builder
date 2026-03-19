import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface EditPayload {
  pageIndex: number;
  sectionIndex: number;
  field: string;
  value: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await params;
  const body: EditPayload = await req.json();

  // Validate payload
  if (
    typeof body.pageIndex !== "number" ||
    typeof body.sectionIndex !== "number" ||
    typeof body.field !== "string" ||
    typeof body.value !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid payload: pageIndex, sectionIndex, field, and value are required" },
      { status: 400 }
    );
  }

  // Fetch blueprint via siteId with ownership verification
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
    include: { blueprint: true },
  });

  if (!site || !site.blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  // Only allow editing when site is in "review" status
  if (site.status !== "review") {
    return NextResponse.json(
      { error: "Editing is only allowed during review" },
      { status: 403 }
    );
  }

  const blueprint = site.blueprint;

  // Parse the current payload
  const payload = blueprint.payload as Record<string, unknown>;
  const pages = payload.pages as Array<{
    sections: Array<{ component_id: string; props: Record<string, unknown> }>;
    [key: string]: unknown;
  }>;

  if (!pages || body.pageIndex >= pages.length || body.pageIndex < 0) {
    return NextResponse.json({ error: "Invalid page index" }, { status: 400 });
  }

  const page = pages[body.pageIndex];
  if (!page.sections || body.sectionIndex >= page.sections.length || body.sectionIndex < 0) {
    return NextResponse.json({ error: "Invalid section index" }, { status: 400 });
  }

  // TASK-236: Preserve original blueprint on first edit
  if (!blueprint.originalPayload) {
    // Deep copy current payload as the original before any edits
    const originalPayload = JSON.parse(JSON.stringify(payload));

    // Create a BlueprintVersion record for the original
    await prisma.blueprintVersion.create({
      data: {
        blueprintId: blueprint.id,
        version: 1,
        label: "original",
        payload: originalPayload,
      },
    });

    // Save the original payload
    await prisma.blueprint.update({
      where: { id: blueprint.id },
      data: { originalPayload },
    });
  }

  // Apply the edit
  const updatedPages = JSON.parse(JSON.stringify(pages));
  updatedPages[body.pageIndex].sections[body.sectionIndex].props[body.field] = body.value;

  // Also update component_tree inputs if present
  const updatedPage = updatedPages[body.pageIndex];
  if (updatedPage.component_tree && updatedPage.component_tree[body.sectionIndex]) {
    updatedPage.component_tree[body.sectionIndex].inputs[body.field] = body.value;
  }

  const updatedPayload = { ...payload, pages: updatedPages };

  await prisma.blueprint.update({
    where: { id: blueprint.id },
    data: { payload: updatedPayload },
  });

  return NextResponse.json({ success: true });
}
