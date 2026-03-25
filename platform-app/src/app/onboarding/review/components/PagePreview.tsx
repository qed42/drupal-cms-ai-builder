"use client";

import { useState, useCallback } from "react";
import type { PageLayout, PageSection } from "@/lib/blueprint/types";
import type { BlueprintInsights } from "@/lib/transparency/types";
import { getComponentLabel } from "@/lib/blueprint/markdown-renderer";
import { getDefaultAdapter } from "@/lib/design-systems/setup";
import SectionInsight from "./SectionInsight";
import PageInsightsPanel from "./PageInsightsPanel";

interface PagePreviewProps {
  siteId: string;
  page: PageLayout;
  pageIndex: number;
  editingSection: number | null;
  onEditSection: (sectionIndex: number | null) => void;
  onSectionChange: (sectionIndex: number, field: string, value: string) => void;
  onSectionRegenerated: (sectionIndex: number, newSection: PageSection) => void;
  onPageRegenerated?: (newPage: PageLayout) => void;
  // Insights props (TASK-413, TASK-414, TASK-418)
  insightsData?: BlueprintInsights | null;
  insightsOpen?: number | null;
  onInsightClick?: (sectionIndex: number) => void;
  pageInsightsOpen?: boolean;
  onPageInsightsClick?: () => void;
  onPageInsightsClose?: () => void;
  allPageSlugs?: string[];
}

/** Format a prop key into a human-readable label. */
function formatPropLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Render a single prop value as a readable string. */
function renderPropValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "(empty)";
    // For arrays of primitives, join them
    if (value.every((v) => typeof v === "string" || typeof v === "number")) {
      return value.join(", ");
    }
    return `${value.length} item${value.length !== 1 ? "s" : ""}`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 0) return "(empty)";
    return `{${keys.join(", ")}}`;
  }
  return String(value);
}

/** Check if a value is a nested object/array that should be expandable. */
function isExpandableValue(value: unknown): boolean {
  if (Array.isArray(value) && value.length > 0 && value.some((v) => typeof v === "object" && v !== null)) {
    return true;
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return Object.keys(value).length > 0;
  }
  return false;
}

/** Collapsible node for a nested object or array value. */
function ExpandableValue({ label, value }: { label: string; value: unknown }) {
  const [open, setOpen] = useState(false);

  if (Array.isArray(value)) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors w-full text-left"
        >
          <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
          <span className="font-medium">{label}</span>
          <span className="text-white/20 ml-auto">{value.length} item{value.length !== 1 ? "s" : ""}</span>
        </button>
        {open && (
          <div className="ml-4 mt-1 space-y-1 border-l border-white/5 pl-3">
            {value.map((item, i) => {
              if (typeof item === "object" && item !== null) {
                return <PropTree key={i} props={item as Record<string, unknown>} label={`[${i}]`} depth={1} />;
              }
              return (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-white/30">[{i}]</span>
                  <span className="text-white/60">{renderPropValue(item)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Object
  const obj = value as Record<string, unknown>;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors w-full text-left"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
        <span className="font-medium">{label}</span>
        <span className="text-white/20 ml-auto">{Object.keys(obj).length} prop{Object.keys(obj).length !== 1 ? "s" : ""}</span>
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l border-white/5 pl-3">
          <PropEntries props={obj} depth={1} />
        </div>
      )}
    </div>
  );
}

/** Render all prop key-value pairs, with expandable nested values. */
function PropEntries({ props, depth = 0 }: { props: Record<string, unknown>; depth?: number }) {
  const entries = Object.entries(props).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) {
    return <p className="text-xs text-white/20 italic">No properties</p>;
  }
  return (
    <>
      {entries.map(([key, value]) => {
        if (isExpandableValue(value)) {
          return <ExpandableValue key={key} label={formatPropLabel(key)} value={value} />;
        }
        return (
          <div key={key} className="flex gap-2 text-xs py-0.5">
            <span className="text-white/40 shrink-0">{formatPropLabel(key)}</span>
            <span className={`text-white/60 ${typeof value === "string" && (value as string).length > 80 ? "leading-relaxed" : ""}`}>
              {renderPropValue(value)}
            </span>
          </div>
        );
      })}
    </>
  );
}

/** A collapsible prop tree for a single component. */
function PropTree({
  props,
  label,
  componentId,
  depth = 0,
}: {
  props: Record<string, unknown>;
  label?: string;
  componentId?: string;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth === 0);
  const displayLabel = label || (componentId ? getComponentLabel(componentId) : "Component");
  const entries = Object.entries(props).filter(([, v]) => v !== null && v !== undefined);

  return (
    <div className={depth > 0 ? "" : ""}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 w-full text-left transition-colors ${
          depth === 0
            ? "text-xs text-brand-400/80 hover:text-brand-400 font-medium py-1"
            : "text-xs text-white/50 hover:text-white/70 py-0.5"
        }`}
      >
        <span className={`transition-transform text-[10px] ${open ? "rotate-90" : ""}`}>▸</span>
        <span>{displayLabel}</span>
        <span className="text-white/20 ml-auto text-[10px]">{entries.length} prop{entries.length !== 1 ? "s" : ""}</span>
      </button>
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/5 pl-3">
          <PropEntries props={props} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}

/** Slot badge with consistent styling. */
function SlotBadge({ slot }: { slot: string }) {
  return (
    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/25">
      slot: {slot}
    </span>
  );
}

/** A collapsible tree node that represents a component in the Canvas hierarchy. */
function TreeNode({
  label,
  componentId,
  slot,
  props,
  defaultOpen = false,
  depth = 0,
  badge,
  children,
}: {
  label: string;
  componentId?: string;
  slot?: string | null;
  props?: Record<string, unknown>;
  defaultOpen?: boolean;
  depth?: number;
  badge?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasContent = (props && Object.entries(props).some(([, v]) => v !== null && v !== undefined)) || children;
  const indent = depth > 0;

  // Color coding by depth
  const labelColors = [
    "text-brand-400/80 hover:text-brand-400",     // depth 0: container
    "text-cyan-400/70 hover:text-cyan-400",        // depth 1: flexi / section-heading
    "text-emerald-400/70 hover:text-emerald-400",  // depth 2: child components
  ];
  const colorClass = labelColors[Math.min(depth, labelColors.length - 1)];

  return (
    <div className={indent ? "ml-4 border-l border-white/5 pl-3" : ""}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 w-full text-left transition-colors text-xs font-medium py-1 ${colorClass}`}
      >
        <span className={`transition-transform text-[10px] ${open ? "rotate-90" : ""} ${!hasContent ? "invisible" : ""}`}>▸</span>
        <span>{label}</span>
        {slot && <SlotBadge slot={slot} />}
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400/60">{badge}</span>
        )}
      </button>
      {open && hasContent && (
        <div className={indent ? "mt-0.5 space-y-1" : "ml-4 mt-0.5 space-y-1 border-l border-white/5 pl-3"}>
          {props && Object.entries(props).some(([, v]) => v !== null && v !== undefined) && (
            <PropEntries props={props} depth={depth + 1} />
          )}
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Reconstruct the Canvas component hierarchy for a Type B composed section.
 * Shows: container > section-heading (slot=content) + flexi (slot=content) > children (slot=column_*)
 */
function ComposedSectionTree({ section }: { section: PageSection }) {
  const adapter = getDefaultAdapter();
  const bg = section.container_background || "transparent";
  const patternLabel = section.pattern
    ? section.pattern.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Composed";

  // Determine column layout from pattern
  const PATTERN_WIDTHS: Record<string, string> = {
    "text-image-split-50-50": "50-50",
    "text-image-split-66-33": "66-33",
    "image-text-split-33-66": "33-66",
    "features-grid-3col": "33-33-33",
    "features-grid-4col": "25-25-25-25",
    "stats-row": "25-25-25-25",
    "team-grid-4col": "25-25-25-25",
    "team-grid-3col": "33-33-33",
    "card-grid-3col": "33-33-33",
    "contact-info": "33-33-33",
    "full-width-text": "100",
  };
  const columnWidth = section.pattern ? (PATTERN_WIDTHS[section.pattern] ?? "100") : "100";
  const colCount = columnWidth.split("-").length;
  const COLUMN_COUNT_NAMES: Record<number, string> = { 1: "one", 2: "two", 3: "three", 4: "four" };

  // Container props (reconstructed from tree builder logic)
  const containerProps: Record<string, unknown> = {
    width: "boxed-width",
    padding_top: "large",
    padding_bottom: "large",
  };
  if (bg !== "transparent") containerProps.background_color = bg;

  // Flexi props
  const flexiProps: Record<string, unknown> = {
    column_width: columnWidth,
    no_of_columns: COLUMN_COUNT_NAMES[colCount] ?? "none",
    gap: "medium",
  };

  // Group children by slot for visual clarity
  const children = section.children ?? [];

  return (
    <TreeNode
      label="Container"
      componentId={adapter.primaryComponent("container")}
      props={containerProps}
      defaultOpen={true}
      depth={0}
      badge={patternLabel}
    >
      {/* Section heading in content slot */}
      {section.section_heading && (
        <TreeNode
          label="Section Heading"
          componentId={adapter.primaryComponent("section-heading")}
          slot="content"
          props={{
            title: section.section_heading.title,
            ...(section.section_heading.label ? { label: section.section_heading.label } : {}),
            ...(section.section_heading.description ? { description: section.section_heading.description } : {}),
            alignment: section.section_heading.alignment ?? "center",
          }}
          defaultOpen={true}
          depth={1}
        />
      )}

      {/* Flexi grid in content slot */}
      <TreeNode
        label="Layout"
        componentId={adapter.resolveRole("container")[1] || adapter.primaryComponent("container")}
        slot="content"
        props={flexiProps}
        defaultOpen={true}
        depth={1}
      >
        {children.map((child, i) => (
          <TreeNode
            key={`${child.component_id}-${child.slot}-${i}`}
            label={getComponentLabel(child.component_id)}
            componentId={child.component_id}
            slot={child.slot}
            props={child.props}
            defaultOpen={false}
            depth={2}
          />
        ))}
      </TreeNode>
    </TreeNode>
  );
}

/**
 * Reconstruct the Canvas component hierarchy for a Type A organism section.
 * Full-width organisms render at root; others get a container wrapper.
 */
function OrganismSectionTree({ section }: { section: PageSection }) {
  const adapter = getDefaultAdapter();
  const fullWidthOrganisms = new Set(adapter.getFullWidthOrganisms());
  const isFullWidth = fullWidthOrganisms.has(section.component_id);
  const label = getComponentLabel(section.component_id);
  const children = section.children ?? [];

  if (isFullWidth) {
    return (
      <TreeNode
        label={label}
        componentId={section.component_id}
        props={section.props}
        defaultOpen={true}
        depth={0}
      >
        {children.map((child, i) => (
          <TreeNode
            key={`${child.component_id}-${child.slot}-${i}`}
            label={getComponentLabel(child.component_id)}
            componentId={child.component_id}
            slot={child.slot}
            props={child.props}
            defaultOpen={false}
            depth={1}
          />
        ))}
      </TreeNode>
    );
  }

  // Container-wrapped organism
  return (
    <TreeNode
      label="Container"
      componentId={adapter.primaryComponent("container")}
      props={{ width: "boxed-width", padding_top: "large", padding_bottom: "large" }}
      defaultOpen={true}
      depth={0}
    >
      <TreeNode
        label={label}
        componentId={section.component_id}
        slot="content"
        props={section.props}
        defaultOpen={true}
        depth={1}
      >
        {children.map((child, i) => (
          <TreeNode
            key={`${child.component_id}-${child.slot}-${i}`}
            label={getComponentLabel(child.component_id)}
            componentId={child.component_id}
            slot={child.slot}
            props={child.props}
            defaultOpen={false}
            depth={2}
          />
        ))}
      </TreeNode>
    </TreeNode>
  );
}

function SectionView({
  section,
  sectionIndex,
  isEditing,
  onEdit,
  onDone,
  onChange,
  insightProps,
  insightOpen,
  onInsightToggle,
}: {
  section: PageLayout["sections"][number];
  sectionIndex: number;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onChange: (field: string, value: string) => void;
  insightProps?: {
    contentBrief?: string;
    targetKeywords?: string[];
    imageQuery?: string;
    toneGuidance?: string;
    audiencePainPoints?: string[];
  };
  insightOpen?: boolean;
  onInsightToggle?: () => void;
}) {
  const label = getComponentLabel(section.component_id);
  const hasChildren = section.children && section.children.length > 0;
  const isComposed = !!section.pattern || hasChildren;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-400 font-medium">{label}</span>
          <span className="text-xs text-white/20">Section {sectionIndex + 1}</span>
          {isComposed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400/60">composed</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onInsightToggle && (
            <SectionInsight
              contentBrief={insightProps?.contentBrief}
              targetKeywords={insightProps?.targetKeywords}
              imageQuery={insightProps?.imageQuery || section._meta?.imageQuery}
              toneGuidance={insightProps?.toneGuidance}
              audiencePainPoints={insightProps?.audiencePainPoints}
              isEdited={isEditing}
              isOpen={!!insightOpen}
              onClose={onInsightToggle}
            />
          )}
          <button
            type="button"
            onClick={isEditing ? onDone : onEdit}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              isEditing
                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                : "bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10"
            }`}
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* Section content — full component tree hierarchy */}
      <div className="px-5 py-4">
        {isComposed ? (
          <ComposedSectionTree section={section} />
        ) : (
          <OrganismSectionTree section={section} />
        )}
      </div>
    </div>
  );
}

export default function PagePreview({
  siteId,
  page,
  pageIndex,
  editingSection,
  onEditSection,
  onSectionChange,
  onSectionRegenerated,
  onPageRegenerated,
  insightsData,
  insightsOpen,
  onInsightClick,
  pageInsightsOpen,
  onPageInsightsClick,
  onPageInsightsClose,
  allPageSlugs,
}: PagePreviewProps) {
  const [regeneratingPage, setRegeneratingPage] = useState(false);
  const [regenPageError, setRegenPageError] = useState<string | null>(null);

  const handleRegeneratePage = useCallback(async () => {
    setRegeneratingPage(true);
    setRegenPageError(null);
    try {
      const res = await fetch(`/api/blueprint/${siteId}/regenerate-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIndex }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Page regeneration failed");
      }
      const data = await res.json();
      onPageRegenerated?.(data.page);
    } catch (err) {
      setRegenPageError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRegeneratingPage(false);
    }
  }, [siteId, pageIndex, onPageRegenerated]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{page.title}</h1>
              <p className="text-sm text-white/40 mt-1">/{page.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              {onPageInsightsClick && (
                <button
                  type="button"
                  onClick={onPageInsightsClick}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  Page Insights
                </button>
              )}
              <button
                type="button"
                onClick={handleRegeneratePage}
                disabled={regeneratingPage}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {regeneratingPage ? "Regenerating..." : "↻ Regenerate Page"}
              </button>
            </div>
          </div>
          {regenPageError && (
            <p className="text-xs text-red-400 mt-2">{regenPageError}</p>
          )}
          {page.seo && (
            <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-xs text-white/30 mb-1">SEO Title</p>
              <p className="text-sm text-white/60">{page.seo.meta_title}</p>
              <p className="text-xs text-white/30 mt-2 mb-1">Meta Description</p>
              <p className="text-sm text-white/60">{page.seo.meta_description}</p>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {page.sections.map((section, sectionIndex) => {
            // Map insights data to section props (TASK-413)
            const planPage = insightsData?.contentPlan?.pages?.[page.slug];
            const planSection = planPage?.sections?.[sectionIndex];
            const sectionInsightProps = insightsData
              ? {
                  contentBrief: section._meta?.contentBrief || planSection?.contentBrief,
                  targetKeywords: section._meta?.targetKeywords || planPage?.targetKeywords,
                  imageQuery: section._meta?.imageQuery,
                  toneGuidance: insightsData.research?.tone,
                  audiencePainPoints: insightsData.research?.painPoints,
                }
              : undefined;

            return (
              <SectionView
                key={`${pageIndex}-${sectionIndex}`}
                section={section}
                sectionIndex={sectionIndex}
                isEditing={editingSection === sectionIndex}
                onEdit={() => onEditSection(sectionIndex)}
                onDone={() => onEditSection(null)}
                onChange={(field, value) => onSectionChange(sectionIndex, field, value)}
                insightProps={sectionInsightProps}
                insightOpen={insightsOpen === sectionIndex}
                onInsightToggle={onInsightClick ? () => onInsightClick(sectionIndex) : undefined}
              />
            );
          })}
        </div>

        {/* Page Insights Panel (TASK-418) */}
        {onPageInsightsClose && (
          <PageInsightsPanel
            page={page}
            pageSlug={page.slug}
            contentPlan={insightsData?.contentPlan?.pages?.[page.slug]}
            reviewScore={insightsData?.reviewScores?.[page.slug] ?? undefined}
            allPageSlugs={allPageSlugs || []}
            isOpen={!!pageInsightsOpen}
            onClose={onPageInsightsClose}
          />
        )}
      </div>
    </div>
  );
}
