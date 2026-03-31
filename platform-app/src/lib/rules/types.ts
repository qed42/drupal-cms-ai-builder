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

export interface TokenTypography {
  h1?: string;
  h2?: string;
  h3?: string;
  body?: string;
  small?: string;
  /** Max-width for readable text blocks */
  maxWidth?: string;
}

export interface TokenButton {
  primary?: string;
  secondary?: string;
}

export interface TokenRules {
  /** Shared container class for consistent content width */
  container?: string;
  /** Vertical padding for section spacing */
  sectionSpacing?: string;
  /** Typography scale tokens */
  typography?: TokenTypography;
  /** Card base style token */
  card?: string;
  /** Button style tokens */
  button?: TokenButton;
  /** Background alternation pattern description */
  backgroundAlternation?: string;
  /** Focus state token */
  focus?: string;
  /** Grid gap token */
  gridGap?: string;
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
  tokens: TokenRules;
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
  tokens?: TokenRules;
  compliance?: ComplianceRules;
}
