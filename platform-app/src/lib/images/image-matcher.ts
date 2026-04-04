/**
 * Image matching engine — ranks user-uploaded images against component context.
 * TASK-440: Image Matcher Module
 *
 * Pure in-memory scoring with no API calls. Designed for <5ms per slot
 * with up to 20 candidate images.
 */

import type { ImageOrientation, ImageSubject } from "./image-description-service";

// ── Public types ───────────────────────────────────────────────────

export interface UserImage {
  id: string;
  description: string;
  tags: string[];
  subject: ImageSubject;
  orientation: ImageOrientation;
}

export interface ComponentContext {
  textContent: string;
  componentType: string; // e.g., "hero", "testimonial", "card", "cta"
  orientation: ImageOrientation;
  pageTitle: string;
}

export interface MatchCandidate {
  imageId: string;
  score: number; // 0–1 normalized
  reasons: string[];
}

// ── Scoring weights ────────────────────────────────────────────────

const W_TAG = 0.4;
const W_DESC = 0.3;
const W_ORIENT = 0.15;
const W_SUBJECT = 0.15;

// ── Stopwords for tokenization ─────────────────────────────────────

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "this", "that",
  "these", "those", "it", "its", "we", "our", "you", "your", "they",
  "their", "my", "i", "me", "he", "she", "him", "her", "us", "them",
  "not", "no", "so", "if", "as", "about", "up", "out", "into", "over",
  "just", "also", "very", "more", "most", "all", "any", "each", "every",
  "both", "few", "some", "such", "than", "too", "only", "own", "same",
  "then", "when", "what", "which", "who", "how", "here", "there", "where",
]);

// ── Subject fit heuristics ─────────────────────────────────────────

const SUBJECT_FIT: Record<string, Record<ImageSubject, number>> = {
  hero:         { person: 0.8, group: 0.8, place: 0.8, product: 0.8, food: 0.8, abstract: 0.8 },
  testimonial:  { person: 1.0, group: 1.0, place: 0.3, product: 0.3, food: 0.3, abstract: 0.2 },
  team:         { person: 1.0, group: 1.0, place: 0.3, product: 0.2, food: 0.2, abstract: 0.2 },
  card:         { person: 0.7, group: 0.7, place: 0.7, product: 0.8, food: 0.8, abstract: 0.5 },
  cta:          { person: 0.6, group: 0.6, place: 0.7, product: 0.7, food: 0.7, abstract: 0.8 },
  feature:      { person: 0.5, group: 0.5, place: 0.6, product: 1.0, food: 0.8, abstract: 0.6 },
  gallery:      { person: 0.8, group: 0.8, place: 0.9, product: 0.9, food: 0.9, abstract: 0.7 },
  logo:         { person: 0.2, group: 0.2, place: 0.3, product: 0.8, food: 0.3, abstract: 0.9 },
};

const DEFAULT_SUBJECT_FIT: Record<ImageSubject, number> = {
  person: 0.6, group: 0.6, place: 0.6, product: 0.6, food: 0.6, abstract: 0.5,
};

// ── Core ranking function ──────────────────────────────────────────

/**
 * Rank all user images against a component's context.
 * Returns candidates sorted by score descending.
 * Images in `usedImageIds` are excluded from results.
 */
export function rankImages(
  userImages: UserImage[],
  context: ComponentContext,
  usedImageIds: Set<string>
): MatchCandidate[] {
  const contextTokens = tokenize(context.textContent + " " + context.pageTitle);
  const contextKeywords = removeStopwords(contextTokens);

  const candidates: MatchCandidate[] = [];

  for (const image of userImages) {
    if (usedImageIds.has(image.id)) continue;

    const reasons: string[] = [];

    // 1. Tag overlap
    const tagScore = computeTagOverlap(image.tags, contextKeywords);
    if (tagScore > 0) {
      const matchingTags = image.tags.filter((t) =>
        contextKeywords.has(t.toLowerCase())
      );
      reasons.push(`tag match: ${matchingTags.join(", ")}`);
    }

    // 2. Description overlap (Jaccard)
    const descTokens = removeStopwords(tokenize(image.description));
    const descScore = jaccardSimilarity(descTokens, contextKeywords);
    if (descScore > 0) {
      reasons.push(`description overlap: ${(descScore * 100).toFixed(0)}%`);
    }

    // 3. Orientation match
    const orientScore = image.orientation === context.orientation ? 1.0 : 0.3;
    if (image.orientation === context.orientation) {
      reasons.push(`orientation match: ${image.orientation}`);
    }

    // 4. Subject fit
    const componentKey = normalizeComponentType(context.componentType);
    const fitMap = SUBJECT_FIT[componentKey] ?? DEFAULT_SUBJECT_FIT;
    const subjectScore = fitMap[image.subject];
    if (subjectScore >= 0.8) {
      reasons.push(`subject match: ${image.subject}`);
    }

    const score =
      tagScore * W_TAG +
      descScore * W_DESC +
      orientScore * W_ORIENT +
      subjectScore * W_SUBJECT;

    candidates.push({
      imageId: image.id,
      score: Math.round(score * 1000) / 1000, // 3 decimal precision
      reasons,
    });
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}

// ── Scoring helpers ────────────────────────────────────────────────

function computeTagOverlap(
  imageTags: string[],
  contextKeywords: Set<string>
): number {
  if (imageTags.length === 0 && contextKeywords.size === 0) return 0;

  const lowerTags = imageTags.map((t) => t.toLowerCase());
  let matches = 0;
  for (const tag of lowerTags) {
    if (contextKeywords.has(tag)) matches++;
  }

  const denominator = Math.max(lowerTags.length, contextKeywords.size);
  return denominator === 0 ? 0 : matches / denominator;
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ── Tokenization ───────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function removeStopwords(tokens: string[]): Set<string> {
  const result = new Set<string>();
  for (const token of tokens) {
    if (!STOPWORDS.has(token)) {
      result.add(token);
    }
  }
  return result;
}

function normalizeComponentType(type: string): string {
  const lower = type.toLowerCase();
  // Map component names to generic types
  if (lower.includes("logo")) return "logo";
  if (lower.includes("hero")) return "hero";
  if (lower.includes("testimonial")) return "testimonial";
  if (lower.includes("team")) return "team";
  if (lower.includes("card")) return "card";
  if (lower.includes("cta") || lower.includes("call")) return "cta";
  if (lower.includes("feature")) return "feature";
  if (lower.includes("gallery")) return "gallery";
  return lower;
}
