// Blueprint bundle types — the output of AI generation

export interface BlueprintBundle {
  site: SiteMetadata;
  brand: BrandTokens;
  pages: PageLayout[];
  content: ContentItems;
  forms: FormDefinitions;
  header?: HeaderConfig;
  footer?: FooterConfig;
}

export interface HeaderConfig {
  menu_align: "left" | "center" | "right";
  cta_text?: string;
  cta_url?: string;
  component_tree?: ComponentTreeItem[];
}

export interface FooterConfig {
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

  // v2 enrichment fields (US-033, US-034, US-035, US-036)
  followUpAnswers?: Record<string, string>;
  differentiators?: string;
  referenceUrls?: string[];
  existingCopy?: string;
}
