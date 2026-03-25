import { createHash } from "crypto";

/**
 * Fields from onboarding data that affect the Research phase output.
 * Changes to any of these fields should invalidate the research preview cache.
 */
const PREVIEW_RELEVANT_FIELDS = [
  "idea",
  "audience",
  "industry",
  "tone",
  "pages",
  "differentiators",
  "followUpAnswers",
] as const;

type PreviewRelevantField = (typeof PREVIEW_RELEVANT_FIELDS)[number];

/**
 * Sorts object keys recursively to ensure deterministic JSON serialization.
 */
function sortValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(sortValue);
  if (typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortValue((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Sort pages array by slug for deterministic ordering.
 */
function sortPages(
  pages: Array<{ slug?: string; [key: string]: unknown }> | undefined
): unknown[] | null {
  if (!pages || !Array.isArray(pages)) return null;
  return [...pages]
    .sort((a, b) => (a.slug ?? "").localeCompare(b.slug ?? ""))
    .map(sortValue);
}

/**
 * Computes a deterministic SHA-256 hash from the onboarding fields
 * that affect the Research phase output.
 *
 * Only preview-relevant fields are included in the hash.
 * Changes to name, colors, fonts, logo_url, design_source etc.
 * do NOT affect the hash.
 */
export function computeInputHash(
  data: Record<string, unknown> | null | undefined
): string {
  if (!data) return createHash("sha256").update("{}").digest("hex");

  const relevant: Record<string, unknown> = {};

  for (const field of PREVIEW_RELEVANT_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null) continue;

    if (field === "pages") {
      const sorted = sortPages(
        value as Array<{ slug?: string; [key: string]: unknown }>
      );
      if (sorted) relevant[field] = sorted;
    } else if (field === "followUpAnswers" && typeof value === "object") {
      relevant[field] = sortValue(value);
    } else {
      relevant[field] = value;
    }
  }

  const serialized = JSON.stringify(relevant);
  return createHash("sha256").update(serialized).digest("hex");
}

/**
 * Checks if any preview-relevant fields changed between old and new data.
 * Used by the save endpoint to decide whether to invalidate the cache.
 */
export function previewRelevantFieldsChanged(
  oldData: Record<string, unknown> | null | undefined,
  newData: Record<string, unknown> | null | undefined
): boolean {
  if (!oldData || !newData) return true;

  for (const field of PREVIEW_RELEVANT_FIELDS) {
    const oldVal = oldData[field];
    const newVal = newData[field];

    // Skip if the new save doesn't include this field
    if (newVal === undefined) continue;

    if (JSON.stringify(sortValue(oldVal)) !== JSON.stringify(sortValue(newVal))) {
      return true;
    }
  }

  return false;
}

export { PREVIEW_RELEVANT_FIELDS };
