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
    const {
      site_id,
      status,
      url,
      domain,
      error: errorMessage,
      current_step,
      total_steps,
      step_label,
      failed_step,
      failed_step_name,
    } = body;

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
          pipelinePhase: null,
          pipelineError: null,
        },
      });

      console.log(`[provisioning] Site ${site_id} is now live at ${url}`);
    } else if (status === "failed") {
      // Store failed step info so the UI can show which step failed.
      const errorDetail = failed_step
        ? `Step ${failed_step}/${total_steps} (${failed_step_name}): ${errorMessage || "Provisioning failed"}`
        : errorMessage || "Provisioning failed";

      await prisma.site.update({
        where: { id: site_id },
        data: {
          status: "provisioning_failed",
          pipelineError: errorDetail,
          pipelinePhase: failed_step
            ? `provision:${failed_step}/${total_steps}:failed`
            : null,
        },
      });

      console.error(`[provisioning] Site ${site_id} failed: ${errorDetail}`);
    } else if (status === "progress") {
      // Step-level progress update during provisioning.
      await prisma.site.update({
        where: { id: site_id },
        data: {
          pipelinePhase: `provision:${current_step}/${total_steps}:${step_label}`,
        },
      });
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
