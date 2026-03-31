/**
 * Design Rules Engine types (M27).
 *
 * Defines the rule categories and resolved ruleset structure
 * for the cascading design rules system.
 */

export interface CompositionRules {
  /** Section types that MUST appear (e.g., ["hero", "cta"]) */
  requiredSections?: string[];
  /** Section types to avoid (e.g., ["pricing"] for healthcare) */
  avoidSections?: string[];
  /** Max sections per page */
  maxSectionsPerPage?: number;
  /** Preferred section ordering hints */
  sectionOrder?: string[];
}

export interface ContentRules {
  /** Tone adjustments (e.g., ["empathetic", "reassuring"]) */
  toneOverrides?: string[];
  /** CTA style guidance */
  ctaGuidance?: string;
  /** Preferred terminology */
  terminologyPrefer?: string[];
  /** Terminology to avoid */
  terminologyAvoid?: string[];
}

export interface VisualRules {
  /** Hero section treatment guidance */
  heroStyle?: string;
  /** Color emphasis guidance */
  colorGuidance?: string;
  /** Image selection guidance */
  imageGuidance?: string;
  /** Layout preference description */
  layoutPreference?: string;
}

export interface ComplianceRules {
  /** Required legal/regulatory disclosures */
  requiredDisclosures?: string[];
  /** Footer-specific requirements */
  footerRequirements?: string[];
  /** Accessibility notes beyond WCAG AA baseline */
  accessibilityNotes?: string[];
}

/** Fully resolved ruleset after cascade merge. */
export interface DesignRuleSet {
  composition: CompositionRules;
  content: ContentRules;
  visual: VisualRules;
  compliance: ComplianceRules;
  _meta: {
    layers: string[];
    persona: string;
    resolvedAt: string;
  };
}

/** Raw shape of a YAML rule file — all fields optional. */
export interface DesignRuleDefinition {
  composition?: CompositionRules;
  content?: ContentRules;
  visual?: VisualRules;
  compliance?: ComplianceRules;
}
