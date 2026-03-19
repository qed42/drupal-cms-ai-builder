"use client";

import { useState, useCallback } from "react";
import type { PageLayout, PageSection } from "@/lib/blueprint/types";
import { getComponentLabel } from "@/lib/blueprint/markdown-renderer";
import RegenerateButton from "./RegenerateButton";

interface PagePreviewProps {
  siteId: string;
  page: PageLayout;
  pageIndex: number;
  editingSection: number | null;
  onEditSection: (sectionIndex: number | null) => void;
  onSectionChange: (sectionIndex: number, field: string, value: string) => void;
  onSectionRegenerated: (sectionIndex: number, newSection: PageSection) => void;
  onPageRegenerated?: (newPage: PageLayout) => void;
}

/**
 * Extract a flat list of displayable fields from component props.
 */
function getEditableFields(
  props: Record<string, unknown>
): Array<{ key: string; label: string; value: string; multiline: boolean }> {
  const fields: Array<{ key: string; label: string; value: string; multiline: boolean }> = [];

  const fieldConfig: Array<{ keys: string[]; label: string; multiline: boolean }> = [
    { keys: ["title", "heading"], label: "Title", multiline: false },
    { keys: ["sub_headline", "subtitle", "subheading"], label: "Subtitle", multiline: false },
    { keys: ["description", "body", "text", "content"], label: "Content", multiline: true },
    { keys: ["button_text", "cta_text", "button_label"], label: "Button Text", multiline: false },
    { keys: ["quote"], label: "Quote", multiline: true },
  ];

  for (const config of fieldConfig) {
    for (const key of config.keys) {
      if (typeof props[key] === "string" && props[key]) {
        fields.push({ key, label: config.label, value: props[key] as string, multiline: config.multiline });
        break;
      }
    }
  }

  return fields;
}

function SectionView({
  section,
  sectionIndex,
  isEditing,
  onEdit,
  onDone,
  onChange,
  siteId,
  pageIndex,
  onRegenerated,
}: {
  section: PageLayout["sections"][number];
  sectionIndex: number;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onChange: (field: string, value: string) => void;
  siteId: string;
  pageIndex: number;
  onRegenerated: (newSection: PageSection, previousSection: PageSection) => void;
}) {
  const [undoSection, setUndoSection] = useState<PageSection | null>(null);
  const label = getComponentLabel(section.component_id);
  const fields = getEditableFields(section.props);

  function handleRegenerated(newSection: PageSection, previousSection: PageSection) {
    setUndoSection(previousSection);
    onRegenerated(newSection, previousSection);
  }

  function handleUndo() {
    if (undoSection) {
      onRegenerated(undoSection, { component_id: section.component_id, props: section.props });
      setUndoSection(null);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-indigo-400 font-medium">{label}</span>
          <span className="text-xs text-white/20">Section {sectionIndex + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          {undoSection && (
            <button
              type="button"
              onClick={handleUndo}
              className="text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              ↶ Undo
            </button>
          )}
          <RegenerateButton
            siteId={siteId}
            pageIndex={pageIndex}
            sectionIndex={sectionIndex}
            onRegenerated={handleRegenerated}
          />
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

      {/* Section content */}
      <div className="px-5 py-4 space-y-3">
        {fields.length === 0 && (
          <p className="text-sm text-white/30 italic">No editable text content</p>
        )}
        {fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs text-white/40 block mb-1">{field.label}</label>
            {isEditing ? (
              field.multiline ? (
                <textarea
                  value={field.value}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50 resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50"
                />
              )
            ) : (
              <p className={`text-sm ${field.key === "title" || field.key === "heading" ? "text-white font-semibold text-lg" : field.key === "sub_headline" || field.key === "subtitle" ? "text-white/70 italic" : "text-white/60 leading-relaxed"}`}>
                {field.value}
              </p>
            )}
          </div>
        ))}

        {/* Render list items (read-only for now) */}
        {renderListItems(section.props)}

        {/* Render form fields (read-only) */}
        {renderFormFields(section.props)}
      </div>
    </div>
  );
}

function renderListItems(props: Record<string, unknown>): React.ReactNode {
  const items = (props.items ?? props.features ?? props.list ?? props.cards) as unknown[] | undefined;
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="space-y-2 pt-2">
      <label className="text-xs text-white/40 block">Items</label>
      {items.map((item, i) => {
        if (typeof item === "string") {
          return <p key={i} className="text-sm text-white/60 pl-3 border-l border-white/10">{item}</p>;
        }
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>;
          const itemTitle = (obj.title ?? obj.heading ?? obj.name) as string | undefined;
          const itemDesc = (obj.description ?? obj.text ?? obj.body) as string | undefined;
          return (
            <div key={i} className="pl-3 border-l border-white/10">
              {itemTitle && <p className="text-sm text-white/80 font-medium">{itemTitle}</p>}
              {itemDesc && <p className="text-sm text-white/50">{itemDesc}</p>}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function renderFormFields(props: Record<string, unknown>): React.ReactNode {
  const fields = props.fields as Array<{ label?: string; type?: string; required?: boolean }> | undefined;
  if (!Array.isArray(fields) || fields.length === 0) return null;

  return (
    <div className="space-y-1 pt-2">
      <label className="text-xs text-white/40 block">Form Fields</label>
      {fields.map((field, i) => (
        <p key={i} className="text-sm text-white/60">
          {field.label ?? field.type ?? "Field"}
          {field.required && <span className="text-red-400/60 ml-1">*</span>}
        </p>
      ))}
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
            <button
              type="button"
              onClick={handleRegeneratePage}
              disabled={regeneratingPage}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {regeneratingPage ? "Regenerating..." : "↻ Regenerate Page"}
            </button>
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
          {page.sections.map((section, sectionIndex) => (
            <SectionView
              key={`${pageIndex}-${sectionIndex}`}
              section={section}
              sectionIndex={sectionIndex}
              isEditing={editingSection === sectionIndex}
              onEdit={() => onEditSection(sectionIndex)}
              onDone={() => onEditSection(null)}
              onChange={(field, value) => onSectionChange(sectionIndex, field, value)}
              siteId={siteId}
              pageIndex={pageIndex}
              onRegenerated={(newSection) => {
                onSectionRegenerated(sectionIndex, newSection);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
