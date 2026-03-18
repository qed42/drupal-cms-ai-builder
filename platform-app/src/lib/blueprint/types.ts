// Blueprint bundle types — the output of AI generation

export interface BlueprintBundle {
  site: SiteMetadata;
  brand: BrandTokens;
  pages: PageLayout[];
  content: ContentItems;
  forms: FormDefinitions;
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
}

export interface PageSection {
  component_id: string;
  props: Record<string, unknown>;
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
