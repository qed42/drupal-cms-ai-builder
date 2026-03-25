"use client";

import { useEffect, useRef, useCallback } from "react";
import type { PageLayout } from "@/lib/blueprint/types";

interface ContentPlanPage {
  title: string;
  targetKeywords: string[];
  sections: Array<{
    heading: string;
    type: string;
    contentBrief: string;
  }>;
}

interface PageInsightsPanelProps {
  page: PageLayout;
  pageSlug: string;
  contentPlan?: ContentPlanPage;
  reviewScore?: { score: number; passed: boolean };
  allPageSlugs: string[];
  isOpen: boolean;
  onClose: () => void;
}

function countWords(sections: PageLayout["sections"]): number {
  let count = 0;
  for (const section of sections) {
    const props = section.props;
    for (const value of Object.values(props)) {
      if (typeof value === "string") {
        count += value.split(/\s+/).filter(Boolean).length;
      }
    }
    if (section.children) {
      for (const child of section.children) {
        for (const value of Object.values(child.props)) {
          if (typeof value === "string") {
            count += value.split(/\s+/).filter(Boolean).length;
          }
        }
      }
    }
  }
  return count;
}

function countInternalLinks(sections: PageLayout["sections"], allSlugs: string[]): number {
  const slugSet = new Set(allSlugs.map((s) => `/${s}`));
  let count = 0;

  function checkProps(props: Record<string, unknown>) {
    for (const value of Object.values(props)) {
      if (typeof value === "string" && slugSet.has(value)) {
        count++;
      }
      if (typeof value === "object" && value !== null) {
        if (typeof (value as Record<string, unknown>).url === "string") {
          if (slugSet.has((value as Record<string, unknown>).url as string)) count++;
        }
      }
    }
  }

  for (const section of sections) {
    checkProps(section.props);
    if (section.children) {
      for (const child of section.children) {
        checkProps(child.props);
      }
    }
  }
  return count;
}

function matchKeywords(sections: PageLayout["sections"], targetKeywords: string[]): number {
  if (!targetKeywords.length) return 0;

  // Collect all text from sections
  const textParts: string[] = [];
  for (const section of sections) {
    for (const value of Object.values(section.props)) {
      if (typeof value === "string") textParts.push(value);
    }
    if (section.children) {
      for (const child of section.children) {
        for (const value of Object.values(child.props)) {
          if (typeof value === "string") textParts.push(value);
        }
      }
    }
  }
  const fullText = textParts.join(" ").toLowerCase();
  return targetKeywords.filter((kw) => fullText.includes(kw.toLowerCase())).length;
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    score >= 0.8
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : score >= 0.6
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
        : "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${color}`}>
      {pct}%
    </span>
  );
}

export default function PageInsightsPanel({
  page,
  pageSlug,
  contentPlan,
  reviewScore,
  allPageSlugs,
  isOpen,
  onClose,
}: PageInsightsPanelProps) {
  const panelRef = useRef<HTMLElement>(null);

  // Focus panel on open
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  const wordCount = countWords(page.sections);
  const linkCount = countInternalLinks(page.sections, allPageSlugs);
  const targetKeywords = contentPlan?.targetKeywords || [];
  const keywordsFound = matchKeywords(page.sections, targetKeywords);

  // Build input-to-content mapping
  const mappings: Array<{ input: string; output: string }> = [];
  if (contentPlan) {
    for (let i = 0; i < Math.min(contentPlan.sections.length, page.sections.length); i++) {
      const planSection = contentPlan.sections[i];
      const pageSection = page.sections[i];
      const heading =
        (pageSection.props.title as string) ||
        (pageSection.props.heading as string) ||
        pageSection.section_heading?.title ||
        "";
      if (planSection.contentBrief && heading) {
        mappings.push({
          input: planSection.contentBrief.length > 60
            ? planSection.contentBrief.slice(0, 60) + "..."
            : planSection.contentBrief,
          output: heading,
        });
      }
    }
  }

  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="complementary"
        aria-label="Page insights"
        onKeyDown={handleKeyDown}
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-slate-900 border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Page Insights</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white/30 hover:text-white/60 text-sm"
              aria-label="Close insights panel"
            >
              &times;
            </button>
          </div>

          <p className="text-xs text-white/40">{page.title}</p>

          {/* Quality Score */}
          {reviewScore && (
            <div className="space-y-1">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Quality Score</p>
              <div className="flex items-center gap-2">
                <ScoreBadge score={reviewScore.score} />
                <span className="text-xs text-white/40">
                  {reviewScore.passed ? "Passed review" : "Needs improvement"}
                </span>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-lg font-semibold text-white">{wordCount.toLocaleString()}</p>
              <p className="text-[10px] text-white/30">Words</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-lg font-semibold text-white">
                {keywordsFound}/{targetKeywords.length}
              </p>
              <p className="text-[10px] text-white/30">Keywords</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-lg font-semibold text-white">{linkCount}</p>
              <p className="text-[10px] text-white/30">Links</p>
            </div>
          </div>

          {/* Keyword coverage */}
          {targetKeywords.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Keyword Coverage</p>
              <div className="flex flex-wrap gap-1">
                {targetKeywords.map((kw) => {
                  const found = page.sections.some((s) => {
                    const text = Object.values(s.props)
                      .filter((v) => typeof v === "string")
                      .join(" ")
                      .toLowerCase();
                    return text.includes(kw.toLowerCase());
                  });
                  return (
                    <span
                      key={kw}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        found
                          ? "bg-emerald-500/10 text-emerald-400/70"
                          : "bg-white/5 text-white/25"
                      }`}
                    >
                      {kw}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input-to-content mapping */}
          {mappings.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">
                Your Input &rarr; This Page
              </p>
              <div className="space-y-2">
                {mappings.slice(0, 5).map((m, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-white/[0.03] border border-white/5 p-3"
                  >
                    <p className="text-[10px] text-white/30 mb-1">Brief</p>
                    <p className="text-xs text-white/50">{m.input}</p>
                    <p className="text-[10px] text-white/30 mt-2 mb-1">Generated</p>
                    <p className="text-xs text-white/60 font-medium">{m.output}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
