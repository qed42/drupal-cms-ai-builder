/**
 * Template functions for building human-readable pipeline phase summaries.
 * Pure string interpolation — no AI calls, zero cost, deterministic output.
 */

interface ResearchBriefContent {
  industry?: string;
  targetAudience?: {
    primary?: string;
    painPoints?: string[];
  };
  competitors?: Array<{ name: string }>;
  toneGuidance?: { primary?: string };
  seoKeywords?: string[];
  complianceNotes?: string[];
}

interface ContentPlanContent {
  siteName?: string;
  pages?: Array<{
    slug: string;
    title: string;
    sections?: Array<{ heading: string }>;
  }>;
}

interface OnboardingDataSubset {
  industry?: string;
  audience?: string;
  tone?: string;
  pages?: Array<{ slug: string; title: string }>;
}

/**
 * Research phase summary — references industry, audience, pain points, compliance.
 */
export function buildResearchSummary(brief: ResearchBriefContent): string {
  const parts: string[] = [];

  const industry = brief.industry || "your industry";
  const audience = brief.targetAudience?.primary || "your target audience";
  parts.push(`Identified your business as ${industry} targeting ${audience}`);

  const painPointCount = brief.targetAudience?.painPoints?.length ?? 0;
  if (painPointCount > 0) {
    parts.push(`Found ${painPointCount} key customer need${painPointCount === 1 ? "" : "s"}`);
  }

  const keywordCount = brief.seoKeywords?.length ?? 0;
  if (keywordCount > 0) {
    parts.push(`Selected ${keywordCount} SEO keywords`);
  }

  if (brief.complianceNotes && brief.complianceNotes.length > 0) {
    const flags = brief.complianceNotes.join(", ");
    parts.push(`Noted ${flags} compliance considerations`);
  }

  return parts.join(". ") + ".";
}

/**
 * Plan phase summary — references page count, section count, proactive pages.
 */
export function buildPlanSummary(
  plan: ContentPlanContent,
  onboardingPages?: string[]
): string {
  const pages = plan.pages || [];
  const pageCount = pages.length;
  const sectionCount = pages.reduce(
    (sum, p) => sum + (p.sections?.length ?? 0),
    0
  );

  const parts: string[] = [];
  parts.push(
    `Organized ${pageCount} page${pageCount === 1 ? "" : "s"} with ${sectionCount} content section${sectionCount === 1 ? "" : "s"}`
  );

  // Detect proactively-added pages (in plan but not in onboarding selections)
  if (onboardingPages && onboardingPages.length > 0) {
    const onboardingSlugs = new Set(onboardingPages);
    const proactive = pages.filter((p) => !onboardingSlugs.has(p.slug));
    if (proactive.length > 0) {
      const names = proactive.map((p) => p.title).join(", ");
      parts.push(
        `Added ${names} — ${proactive.length === 1 ? "this page improves" : "these pages improve"} engagement for your industry`
      );
    }
  }

  return parts.join(". ") + ".";
}

/**
 * Per-page generate progress summary.
 */
export function buildGenerateProgressSummary(
  currentPage: string,
  pageIndex: number,
  totalPages: number,
  keywords?: string[]
): string {
  let summary = `Writing ${currentPage} page (${pageIndex} of ${totalPages})`;

  if (keywords && keywords.length > 0) {
    summary += `. Targeting "${keywords[0]}"`;
    if (keywords.length > 1) {
      summary += ` and ${keywords.length - 1} more keyword${keywords.length - 1 === 1 ? "" : "s"}`;
    }
  }

  return summary + ".";
}

/**
 * Final completion summary with concrete metrics.
 */
export function buildCompletionSummary(
  pageCount: number,
  wordCount: number,
  imageCount: number,
  keywordCount: number
): string {
  const parts: string[] = [];

  parts.push(
    `Generated ${pageCount} page${pageCount === 1 ? "" : "s"}`
  );

  if (wordCount > 0) {
    parts.push(`~${wordCount.toLocaleString()} words`);
  }

  if (imageCount > 0) {
    parts.push(`${imageCount} image${imageCount === 1 ? "" : "s"}`);
  }

  if (keywordCount > 0) {
    parts.push(`optimized for ${keywordCount} keyword${keywordCount === 1 ? "" : "s"}`);
  }

  return parts.join(", ") + ".";
}

/**
 * Impact bullets for dashboard summary (3-5 items).
 */
export function buildImpactBullets(
  brief: ResearchBriefContent,
  plan: ContentPlanContent,
  data: OnboardingDataSubset
): string[] {
  const bullets: string[] = [];

  // Tone
  const tone = brief.toneGuidance?.primary || data.tone;
  if (tone) {
    bullets.push(`Content written in a ${tone} tone to match your brand`);
  }

  // SEO keywords
  const keywordCount = brief.seoKeywords?.length ?? 0;
  if (keywordCount > 0) {
    bullets.push(
      `Optimized for ${keywordCount} SEO keyword${keywordCount === 1 ? "" : "s"} targeting your audience`
    );
  }

  // Compliance
  if (brief.complianceNotes && brief.complianceNotes.length > 0) {
    bullets.push(
      `${brief.complianceNotes.join(", ")} compliance guidelines applied`
    );
  }

  // Proactive pages
  if (data.pages && plan.pages) {
    const onboardingSlugs = new Set(data.pages.map((p) => p.slug));
    const proactive = plan.pages.filter((p) => !onboardingSlugs.has(p.slug));
    if (proactive.length > 0) {
      const names = proactive.map((p) => p.title).join(", ");
      bullets.push(`Proactively added ${names} for better engagement`);
    }
  }

  // Page count
  const pageCount = plan.pages?.length ?? 0;
  if (pageCount > 0) {
    bullets.push(
      `${pageCount} fully structured page${pageCount === 1 ? "" : "s"} ready for review`
    );
  }

  return bullets.slice(0, 5);
}
