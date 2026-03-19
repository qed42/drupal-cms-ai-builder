import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verify internal API key to prevent unauthorized callbacks.
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = process.env.PROVISION_CALLBACK_KEY;

    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { site_id, status, url, domain, error: errorMessage } = body;

    if (!site_id || !status) {
      return NextResponse.json(
        { error: "site_id and status are required" },
        { status: 400 }
      );
    }

    if (status === "live") {
      await prisma.site.update({
        where: { id: site_id },
        data: {
          status: "live",
          drupalUrl: url || null,
          subdomain: domain?.replace(`.${process.env.SITE_DOMAIN_SUFFIX || "drupalcms.app"}`, "") || undefined,
        },
      });

      console.log(`[provisioning] Site ${site_id} is now live at ${url}`);
    } else if (status === "failed") {
      await prisma.site.update({
        where: { id: site_id },
        data: { status: "provisioning_failed" },
      });

      console.error(
        `[provisioning] Site ${site_id} failed: ${errorMessage || "Provisioning failed"}`
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Provision callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
