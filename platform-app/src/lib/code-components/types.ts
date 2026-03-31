/**
 * Code Component types for Canvas JS Components (M26).
 *
 * Canvas Code Components use React/Preact + Tailwind CSS v4 and are stored
 * as Drupal config entities: canvas.js_component.{machineName}.yml
 */

/** Allowed prop types for Canvas JS Component schema. */
export type CodeComponentPropType =
  | "string"
  | "formatted_text"
  | "boolean"
  | "integer"
  | "number"
  | "link"
  | "image"
  | "video"
  | "list:text"
  | "list:integer";

/** A single prop definition for a Code Component. */
export interface CodeComponentProp {
  name: string;
  type: CodeComponentPropType;
  required: boolean;
  default?: unknown;
  description?: string;
}

/** A slot definition for a Code Component (child component insertion point). */
export interface CodeComponentSlot {
  name: string;
  description?: string;
}

/**
 * Output of the AI code component generator.
 * Contains everything needed to create a Canvas JS Component config entity.
 */
export interface CodeComponentOutput {
  /** Drupal machine name (lowercase, underscores, no dots). */
  machineName: string;
  /** Human-readable label. */
  name: string;
  /** JSX/TSX source code (React/Preact component). */
  jsx: string;
  /** CSS/Tailwind source code for the component. */
  css: string;
  /** Props schema for the component. */
  props: CodeComponentProp[];
  /** Optional slots for child component insertion. */
  slots?: CodeComponentSlot[];
}

/**
 * Design preferences for code component generation.
 * Mirrors the onboarding designPreferences field.
 */
export interface DesignPreferences {
  animationLevel: "subtle" | "moderate" | "dramatic";
  visualStyle: "minimal" | "bold" | "elegant" | "playful";
  interactivity: "static" | "scroll_effects" | "interactive";
}

/**
 * Brief sent to the AI Designer Agent for each section.
 * Contains all context needed to generate a unique code component.
 */
export interface SectionDesignBrief {
  /** Section heading text. */
  heading: string;
  /** Content brief describing what the section should communicate. */
  contentBrief: string;
  /** Section type (hero, features, testimonials, cta, etc.). */
  sectionType: string;
  /** Position on the page (0-based index). */
  position: number;
  /** Total number of sections on the page (for background alternation). */
  totalSections?: number;
  /** Brand tokens (colors, fonts) for the site. */
  brandTokens: {
    colors: Record<string, string>;
    fonts: { heading: string; body: string };
  };
  /** Tone guidance (professional, friendly, etc.). */
  toneGuidance: string;
  /** Animation level preference. */
  animationLevel: "subtle" | "moderate" | "dramatic";
  /** Visual style preference. */
  visualStyle: "minimal" | "bold" | "elegant" | "playful";
  /** Summary of the previous section for visual flow continuity. */
  previousSectionSummary?: string;
  /** SEO target keywords for this section. */
  targetKeywords?: string[];
}

/** Validation result for a code component. */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  rule: string;
  message: string;
  line?: number;
}

export interface ValidationWarning {
  rule: string;
  message: string;
  line?: number;
}

/**
 * CodeComponentGenerator interface — parallel to DesignSystemAdapter.
 * Implementations generate unique code components from design briefs.
 */
export interface CodeComponentGenerator {
  /** Generate a code component from a section design brief. */
  generate(brief: SectionDesignBrief): Promise<CodeComponentOutput>;

  /** Validate a generated component's JSX, a11y, and security. */
  validate(output: CodeComponentOutput): ValidationResult;

  /** Build Drupal config YAML from a component output. */
  buildConfig(output: CodeComponentOutput): string;
}
