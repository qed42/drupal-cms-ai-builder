/**
 * Curated Component Loader — reads manifest and loads component sources.
 *
 * Server-side only (uses fs.readFileSync). Caches manifest in memory after first load.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { CodeComponentProp } from "@/lib/code-components/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CuratedComponentMeta {
  id: string;
  name: string;
  category: string;
  tags: string[];
  visualStyles: string[];
  animationLevel: string;
  brandTokensUsed: string[];
  hasAnimation: boolean;
  propsSchema: CodeComponentProp[];
  source: { jsx: string; css: string };
}

export interface CuratedComponent extends CuratedComponentMeta {
  /** Raw JSX source loaded from disk. */
  jsx: string;
  /** Raw CSS source loaded from disk. */
  css: string;
}

interface Manifest {
  version: string;
  components: CuratedComponentMeta[];
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const COMPONENTS_DIR = dirname(fileURLToPath(import.meta.url));
let cachedManifest: Manifest | null = null;
const componentCache = new Map<string, CuratedComponent>();

function loadManifest(): Manifest | null {
  if (cachedManifest) return cachedManifest;
  const manifestPath = join(COMPONENTS_DIR, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.warn(`[curated-components] manifest.json not found at ${manifestPath}`);
    return null;
  }
  const raw = readFileSync(manifestPath, "utf-8");
  cachedManifest = JSON.parse(raw) as Manifest;
  return cachedManifest;
}

function loadComponentSource(meta: CuratedComponentMeta): CuratedComponent {
  const cached = componentCache.get(meta.id);
  if (cached) return cached;

  const jsxPath = join(COMPONENTS_DIR, meta.source.jsx);
  const cssPath = join(COMPONENTS_DIR, meta.source.css);

  const jsx = existsSync(jsxPath) ? readFileSync(jsxPath, "utf-8") : "";
  const css = existsSync(cssPath) ? readFileSync(cssPath, "utf-8") : "";

  const component: CuratedComponent = { ...meta, jsx, css };
  componentCache.set(meta.id, component);
  return component;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get all curated components, optionally filtered.
 */
export function getCuratedComponents(filter?: {
  category?: string;
  visualStyle?: string;
  animationLevel?: string;
}): CuratedComponent[] {
  const manifest = loadManifest();
  if (!manifest) return [];
  let components = manifest.components;

  if (filter?.category) {
    components = components.filter((c) => c.category === filter.category);
  }
  if (filter?.visualStyle) {
    components = components.filter((c) => c.visualStyles.includes(filter.visualStyle!));
  }
  if (filter?.animationLevel) {
    components = components.filter((c) => c.animationLevel === filter.animationLevel);
  }

  return components.map(loadComponentSource);
}

/**
 * Get a single curated component by ID.
 */
export function getCuratedComponent(id: string): CuratedComponent | null {
  const manifest = loadManifest();
  if (!manifest) return null;
  const meta = manifest.components.find((c) => c.id === id);
  if (!meta) return null;
  return loadComponentSource(meta);
}

/**
 * Select the best curated component for a section type + style + animation level.
 *
 * Scoring:
 * - Category match: required (no match = null)
 * - Visual style match: +2
 * - Animation level match: +1
 * - More tags = tiebreaker
 */
export function selectCuratedComponent(
  sectionType: string,
  visualStyle: string,
  animationLevel: string
): CuratedComponent | null {
  const manifest = loadManifest();
  if (!manifest) return null;

  // Map section types to categories
  const categoryMap: Record<string, string> = {
    hero: "hero",
    header: "header",
    features: "features",
    services: "services",
    testimonials: "testimonials",
    cta: "cta",
    "cta-banner": "cta",
    pricing: "pricing",
    stats: "stats",
    metrics: "stats",
    faq: "faq",
    team: "team",
    "social-proof": "social-proof",
    logos: "social-proof",
    blog: "blog",
    timeline: "timeline",
    media: "media",
    video: "media",
    contact: "contact",
    comparison: "comparison",
    gallery: "gallery",
    portfolio: "gallery",
    footer: "footer",
  };

  const category = categoryMap[sectionType] || sectionType;
  const candidates = manifest.components.filter((c) => c.category === category);

  if (candidates.length === 0) return null;

  // Score and sort
  const scored = candidates.map((c) => {
    let score = 0;
    if (c.visualStyles.includes(visualStyle)) score += 2;
    if (c.animationLevel === animationLevel) score += 1;
    return { meta: c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return loadComponentSource(scored[0].meta);
}

/**
 * Clear the loader cache (useful for testing).
 */
export function clearLoaderCache(): void {
  cachedManifest = null;
  componentCache.clear();
}
