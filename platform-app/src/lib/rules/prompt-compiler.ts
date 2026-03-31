/**
 * Prompt Compiler (M27).
 *
 * Converts a resolved DesignRuleSet into a markdown-formatted prompt
 * fragment for injection into the code component generation prompt.
 */

import type { DesignRuleSet } from "./types";

/**
 * Compile a resolved ruleset into a prompt fragment string.
 * Returns empty string if the ruleset has no meaningful rules.
 */
export function compileRulesToPromptFragment(rules: DesignRuleSet): string {
  const sections: string[] = [];

  // --- Composition ---
  const comp = rules.composition;
  const compLines: string[] = [];
  if (comp.requiredSections?.length) {
    compLines.push(`- REQUIRED sections for this site type: ${comp.requiredSections.join(", ")}`);
  }
  if (comp.avoidSections?.length) {
    compLines.push(`- AVOID these section types: ${comp.avoidSections.join(", ")}`);
  }
  if (comp.maxSectionsPerPage) {
    compLines.push(`- Maximum sections per page: ${comp.maxSectionsPerPage}`);
  }
  if (comp.sectionOrder?.length) {
    compLines.push(`- Preferred section order: ${comp.sectionOrder.join(" → ")}`);
  }
  if (compLines.length > 0) {
    sections.push(`### Composition Constraints\n${compLines.join("\n")}`);
  }

  // --- Content ---
  const cnt = rules.content;
  const cntLines: string[] = [];
  if (cnt.toneOverrides?.length) {
    cntLines.push(`- Tone adjustments: ${cnt.toneOverrides.join(", ")}`);
  }
  if (cnt.ctaGuidance) {
    cntLines.push(`- CTA style: ${cnt.ctaGuidance}`);
  }
  if (cnt.terminologyPrefer?.length) {
    cntLines.push(`- PREFERRED terminology: ${cnt.terminologyPrefer.join(", ")}`);
  }
  if (cnt.terminologyAvoid?.length) {
    cntLines.push(`- AVOID terminology: ${cnt.terminologyAvoid.join(", ")}`);
  }
  if (cntLines.length > 0) {
    sections.push(`### Content Guidelines\n${cntLines.join("\n")}`);
  }

  // --- Visual ---
  const vis = rules.visual;
  const visLines: string[] = [];
  if (vis.heroStyle) {
    visLines.push(`- Hero treatment: ${vis.heroStyle}`);
  }
  if (vis.colorGuidance) {
    visLines.push(`- Color emphasis: ${vis.colorGuidance}`);
  }
  if (vis.imageGuidance) {
    visLines.push(`- Image guidance: ${vis.imageGuidance}`);
  }
  if (vis.layoutPreference) {
    visLines.push(`- Layout preference: ${vis.layoutPreference}`);
  }
  if (visLines.length > 0) {
    sections.push(`### Visual Direction\n${visLines.join("\n")}`);
  }

  // --- Compliance (elevated priority) ---
  const cpl = rules.compliance;
  const cplLines: string[] = [];
  if (cpl.requiredDisclosures?.length) {
    cplLines.push(`- Required disclosures: ${cpl.requiredDisclosures.join("; ")}`);
  }
  if (cpl.footerRequirements?.length) {
    cplLines.push(`- Footer requirements: ${cpl.footerRequirements.join("; ")}`);
  }
  if (cpl.accessibilityNotes?.length) {
    cplLines.push(`- Accessibility: ${cpl.accessibilityNotes.join("; ")}`);
  }
  if (cplLines.length > 0) {
    sections.push(`### Compliance (MUST FOLLOW)\n${cplLines.join("\n")}`);
  }

  if (sections.length === 0) return "";

  const layerTrace = rules._meta.layers.join(" → ");
  return `## DESIGN RULES (Auto-resolved: ${layerTrace})\n\n${sections.join("\n\n")}`;
}
