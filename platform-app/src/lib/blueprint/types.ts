// Blueprint bundle types — the output of AI generation

export interface BlueprintBundle {
  site: SiteMetadata;
  brand: BrandTokens;
  pages: PageLayout[];
  content: ContentItems;
  forms: FormDefinitions;
  header?: HeaderConfig;
  footer?: FooterConfig;
  /** Manifest of ALL user-uploaded images (TASK-442). */
  user_images?: UserImageManifestEntry[];
}

/** A single entry in the blueprint's user_images manifest. */
export interface UserImageManifestEntry {
  id: string;
  file_url: string;
  description: string;
  tags: string[];
  filename: string;
}

export interface HeaderConfig {
  /** Drupal theme region name (e.g., "header"). */
  region: string;
  menu_align: "left" | "center" | "right";
  cta_text?: string;
  cta_url?: string;
  component_tree?: ComponentTreeItem[];
}

export interface FooterConfig {
  /** Drupal theme region name (e.g., "footer"). */
  region: string;
  brand_description?: string;
  disclaimer?: string;
  social_links?: Array<{ platform: string; url: string; icon: string }>;
  legal_links?: Array<{ title: string; url: string }>;
  component_tree?: ComponentTreeItem[];
}

export interface SiteMetadata {
  name: string;
  tagline: string;
  industry: string;
  audience: string;
  compliance_flags: string[];
  tone: string;
}

export interface BrandTokens {
  colors: Record<string, string>;
  fonts: { heading: string; body: string };
  logo_url?: string;
}

export interface PageLayout {
  slug: string;
  title: string;
  seo: { meta_title: string; meta_description: string };
  sections: PageSection[];
  component_tree?: ComponentTreeItem[];
}

export interface ComponentTreeItem {
  uuid: string;
  component_id: string;       // Canvas format: "sdc.space_ds.space-{name}"
  component_version: string;  // xxh64 hash (16 hex chars)
  parent_uuid: string | null; // null = root level
  slot: string | null;        // null = root level
  inputs: Record<string, unknown>;
  label?: string;
}

export interface PageSectionChild {
  component_id: string;
  slot: string;                        // Target slot name
  props: Record<string, unknown>;
}

export interface PageSection {
  // Type A: Organism section (hero, CTA, accordion, slider)
  component_id: string;
  props: Record<string, unknown>;
  // Type B: Composed section (flexi grid with atoms in slots)
  pattern?: string;                    // Composition pattern name
  section_heading?: {
    label?: string;
    title: string;
    description?: string;
    alignment?: string;
  };
  container_background?: string;       // Container background color
  children?: PageSectionChild[];       // Child components for slots
  // Transparency metadata (TASK-411, TASK-412, TASK-441)
  _meta?: {
    imageQuery?: string;               // Search query used for this section
    imageSource?: "user" | "stock";    // Provenance: user upload or Pexels stock
    imageMatchScore?: number;          // Match confidence for user images (0-1)
    contentBrief?: string;             // Content brief from ContentPlan
    targetKeywords?: string[];         // Target keywords from ContentPlan page
  };
}

export interface ContentItems {
  services?: ContentItem[];
  team_members?: ContentItem[];
  testimonials?: ContentItem[];
  [key: string]: ContentItem[] | undefined;
}

export interface ContentItem {
  title: string;
  [key: string]: unknown;
}

export interface FormDefinitions {
  contact: {
    fields: FormField[];
  };
}

export interface FormField {
  name: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  label: string;
  required: boolean;
  options?: string[];
}

export type GenerationStep =
  | "pending"
  | "site_metadata"
  | "page_layouts"
  | "content"
  | "forms"
  | "ready"
  | "failed";

// --- Onboarding data types (v2 includes enrichment fields) ---

export interface OnboardingPageSelection {
  slug: string;
  title: string;
  description?: string; // v2: AI-generated page description
}

export interface OnboardingData {
  // v1 fields
  name?: string;
  idea?: string;
  audience?: string;
  industry?: string;
  tone?: string;
  pages?: OnboardingPageSelection[];
  colors?: Record<string, string>;
  fonts?: { heading: string; body: string };
  logo_url?: string;
  compliance_flags?: string[];
  keywords?: string[];

  // Design system selection (M19)
  designSystemId?: string;

  // Generation mode (M26): design_system uses SDC adapters, code_components uses Canvas Code Components
  generationMode?: "design_system" | "code_components";

  // Design preferences for code_components mode (M26)
  designPreferences?: {
    animationLevel: "subtle" | "moderate" | "dramatic";
    visualStyle: "minimal" | "bold" | "elegant" | "playful";
    interactivity: "static" | "scroll_effects" | "interactive";
  };

  // v2 enrichment fields (US-033, US-034, US-035, US-036)
  followUpAnswers?: Record<string, string>;
  differentiators?: string;
  referenceUrls?: string[];
  existingCopy?: string;
}
