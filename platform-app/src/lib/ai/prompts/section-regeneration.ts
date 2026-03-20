/**
 * Prompt builder for per-section AI regeneration.
 * Uses research brief + content plan for context consistency.
 *
 * TASK-233: Per-Section AI Regeneration
 */

import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";
import type { PageSection } from "@/lib/blueprint/types";
import { getManifestComponent } from "@/lib/blueprint/component-validator";

interface SectionRegenerationContext {
  siteName: string;
  pageTitle: string;
  pageSlug: string;
  sectionIndex: number;
  currentSection: PageSection;
  surroundingSections: PageSection[];
  research: ResearchBrief;
  plan: ContentPlan;
  guidance?: string;
}

/**
 * Build a prompt for regenerating a single section within a page.
 * Provides full context (research, plan, surrounding sections) so
 * the regenerated content stays consistent with the rest of the site.
 */
export function buildSectionRegenerationPrompt(ctx: SectionRegenerationContext): string {
  const comp = getManifestComponent(ctx.currentSection.component_id);
  const compName = comp?.name ?? ctx.currentSection.component_id;

  // Get valid string props for this component
  const validProps = comp?.props
    .filter((p) => p.type === "string" && !p.enum)
    .map((p) => p.name) ?? [];

  // Get slots for this component (compositional model) — cast to access slot data from manifest
  const compAny = comp as unknown as { slots?: Array<{ name: string }> } | undefined;
  const validSlots = compAny?.slots
    ?.filter((s) => s.name)
    .map((s) => s.name) ?? [];

  const lines: string[] = [
    `You are a professional website copywriter. Regenerate the content for a single section on a website page.`,
    ``,
    `## Site Context`,
    `- **Business:** ${ctx.siteName}`,
    `- **Industry:** ${ctx.research.industry}`,
    `- **Audience:** ${ctx.research.targetAudience.primary}`,
    `- **Tone:** ${ctx.research.toneGuidance.primary}`,
    `- **Key Messages:** ${ctx.research.keyMessages.join("; ")}`,
    ``,
    `## Page: ${ctx.pageTitle} (/${ctx.pageSlug})`,
    ``,
    `## Section to Regenerate`,
    `- **Component:** ${compName} (${ctx.currentSection.component_id})`,
    `- **Position:** Section ${ctx.sectionIndex + 1} of ${ctx.surroundingSections.length + 1}`,
  ];

  // Show current content for reference
  const currentProps = ctx.currentSection.props;
  if (Object.keys(currentProps).length > 0) {
    lines.push(
      `- **Current content:**`,
      ...Object.entries(currentProps)
        .filter(([, v]) => typeof v === "string")
        .map(([k, v]) => `  - ${k}: "${String(v).substring(0, 200)}${String(v).length > 200 ? "..." : ""}"`),
    );
  }

  // User guidance
  if (ctx.guidance) {
    lines.push(``, `## User Instructions`, `"${ctx.guidance}"`);
  }

  // Surrounding sections for context
  if (ctx.surroundingSections.length > 0) {
    lines.push(``, `## Surrounding Sections (for context — do NOT regenerate these)`);
    for (const s of ctx.surroundingSections) {
      const title = (s.props.title as string) ?? "(untitled)";
      lines.push(`- ${s.component_id}: "${title}"`);
    }
  }

  // Output format
  lines.push(
    ``,
    `## Output Format`,
    `Return a JSON object with:`,
    `- "component_id": "${ctx.currentSection.component_id}"`,
    `- "props_json": A JSON-encoded STRING of the component props.`,
  );

  if (validSlots.length > 0) {
    lines.push(
      `- "children": (optional) array of child components for slots, each with:`,
      `  - "component_id": child component ID`,
      `  - "slot": one of [${validSlots.join(", ")}]`,
      `  - "props_json": JSON-encoded STRING of child props`,
    );
  }

  lines.push(
    ``,
    `Valid props for ${compName}: ${validProps.length > 0 ? validProps.join(", ") : "none (layout-only)"}`,
    validSlots.length > 0
      ? `Valid slots for ${compName}: ${validSlots.join(", ")}`
      : "",
    ``,
    `CRITICAL: Only use props listed above. Do NOT add props that don't exist on this component.`,
    `Write REAL, specific content that matches the tone and is consistent with surrounding sections.`,
    `${ctx.guidance ? `Follow the user's instructions: "${ctx.guidance}"` : ""}`,
    ``,
    `Return ONLY valid JSON.`,
  );

  return lines.filter(Boolean).join("\n");
}
