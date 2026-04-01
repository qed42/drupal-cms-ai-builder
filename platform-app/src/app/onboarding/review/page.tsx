"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PageSidebar from "./components/PageSidebar";
import PagePreview from "./components/PagePreview";
import LivePreviewFrame from "./components/LivePreviewFrame";
import ApproveButton from "./components/ApproveButton";
import { useAutoSave } from "./hooks/useAutoSave";
import type { PageLayout, PageSection, BrandTokens } from "@/lib/blueprint/types";
import type { PreviewPayload } from "@/lib/preview/types";
import type { BlueprintInsights } from "@/lib/transparency/types";
import YAML from "yaml";

type ReviewMode = "celebration" | "preview" | "edit";
type PreviewView = "visual" | "data";

interface CodeComponentConfigs {
  configs: Record<string, string>;
  metadata: Array<{
    machineName: string;
    name: string;
    sectionType: string;
    pageSlug: string;
  }>;
}

interface BlueprintData {
  id: string;
  siteId: string;
  pages: PageLayout[];
  brand?: BrandTokens;
  generationMode?: "design_system" | "code_components";
  _codeComponents?: CodeComponentConfigs;
}

function CelebrationScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <style>{`
          @keyframes check-scale {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes cele-fade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .check-anim { animation: check-scale 400ms ease both; }
          .cele-title { animation: cele-fade 300ms ease both 200ms; opacity: 0; }
          .cele-sub { animation: cele-fade 300ms ease both 400ms; opacity: 0; }
          @media (prefers-reduced-motion: reduce) {
            .check-anim, .cele-title, .cele-sub {
              animation: none; opacity: 1;
            }
          }
        `}</style>
        <div className="check-anim w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="cele-title text-3xl font-bold text-white">Your site is ready!</h1>
        <p className="cele-sub text-white/50 text-lg">
          Let&apos;s take a look at what Archie built
        </p>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = searchParams.get("siteId");

  // Celebration skip for returning visits
  const celebrationKey = siteId ? `celebration-seen-${siteId}` : null;
  const hasSeenCelebration = typeof window !== "undefined" && celebrationKey
    ? localStorage.getItem(celebrationKey) === "true"
    : false;

  const [mode, setMode] = useState<ReviewMode>(hasSeenCelebration ? "preview" : "celebration");

  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [viewedPages, setViewedPages] = useState<Set<number>>(new Set([0]));
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Visual preview vs data view toggle — default to visual for code_components
  const [previewView, setPreviewView] = useState<PreviewView>("visual");

  const [insightsData, setInsightsData] = useState<BlueprintInsights | null>(null);
  const [insightsOpen, setInsightsOpen] = useState<number | null>(null);
  const [pageInsightsOpen, setPageInsightsOpen] = useState(false);
  const insightsFetched = useRef(false);

  const fetchInsights = useCallback(async () => {
    if (insightsFetched.current || !siteId) return;
    insightsFetched.current = true;
    try {
      const res = await fetch(`/api/blueprint/${siteId}/insights`);
      if (res.ok) {
        const data = await res.json();
        setInsightsData(data);
      }
    } catch {
      // Non-critical
    }
  }, [siteId]);

  const handleInsightClick = useCallback(
    (sectionIndex: number) => {
      fetchInsights();
      setInsightsOpen((prev) => (prev === sectionIndex ? null : sectionIndex));
    },
    [fetchInsights]
  );

  const handlePageInsightsClick = useCallback(() => {
    fetchInsights();
    setPageInsightsOpen((prev) => !prev);
  }, [fetchInsights]);

  const { save } = useAutoSave({
    siteId: siteId ?? "",
    onSaveStart: () => setSaveStatus("saving"),
    onSaveComplete: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onSaveError: () => setSaveStatus("error"),
  });

  useEffect(() => {
    if (!siteId) {
      setError("No site ID provided");
      setLoading(false);
      return;
    }

    async function loadBlueprint() {
      try {
        const res = await fetch(`/api/blueprint/${siteId}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/dashboard");
            return;
          }
          throw new Error("Failed to load blueprint");
        }
        const data = await res.json();
        const payload = data.payload as {
          pages?: PageLayout[];
          brand?: BrandTokens;
          _codeComponents?: CodeComponentConfigs;
        } | null;
        setBlueprint({
          id: data.id,
          siteId: data.siteId,
          pages: payload?.pages ?? [],
          brand: payload?.brand,
          generationMode: payload?._codeComponents ? "code_components" : "design_system",
          _codeComponents: payload?._codeComponents,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    loadBlueprint();
  }, [siteId, router]);

  const handlePageSelect = useCallback((index: number) => {
    setActivePageIndex(index);
    setEditingSection(null);
    setViewedPages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const handleSectionRegenerated = useCallback(
    (sectionIndex: number, newSection: PageSection) => {
      setBlueprint((prev) => {
        if (!prev) return prev;
        const pages = [...prev.pages];
        const page = { ...pages[activePageIndex] };
        const sections = [...page.sections];
        sections[sectionIndex] = newSection;
        page.sections = sections;
        pages[activePageIndex] = page;
        return { ...prev, pages };
      });
    },
    [activePageIndex]
  );

  const handlePageRegenerated = useCallback(
    (newPage: PageLayout) => {
      setBlueprint((prev) => {
        if (!prev) return prev;
        const pages = [...prev.pages];
        pages[activePageIndex] = newPage;
        return { ...prev, pages };
      });
    },
    [activePageIndex]
  );

  const handleAddPage = useCallback(
    async (title: string, description: string) => {
      if (!siteId) return;
      const res = await fetch(`/api/blueprint/${siteId}/add-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to add page");
        return;
      }
      const data = await res.json();
      setBlueprint((prev) => {
        if (!prev) return prev;
        return { ...prev, pages: [...prev.pages, data.page] };
      });
    },
    [siteId]
  );

  const handleRemovePage = useCallback(
    async (pageIndex: number) => {
      if (!siteId) return;
      const res = await fetch(`/api/blueprint/${siteId}/remove-page`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIndex }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to remove page");
        return;
      }
      setBlueprint((prev) => {
        if (!prev) return prev;
        const pages = prev.pages.filter((_, i) => i !== pageIndex);
        return { ...prev, pages };
      });
      if (activePageIndex >= (blueprint?.pages.length ?? 1) - 1) {
        setActivePageIndex(Math.max(0, activePageIndex - 1));
      }
    },
    [siteId, activePageIndex, blueprint?.pages.length]
  );

  const handleSectionChange = useCallback(
    (sectionIndex: number, field: string, value: string) => {
      if (!blueprint) return;

      setBlueprint((prev) => {
        if (!prev) return prev;
        const pages = [...prev.pages];
        const page = { ...pages[activePageIndex] };
        const sections = [...page.sections];
        const section = { ...sections[sectionIndex] };
        section.props = { ...section.props, [field]: value };
        sections[sectionIndex] = section;
        page.sections = sections;
        pages[activePageIndex] = page;
        return { ...prev, pages };
      });

      save({
        pageIndex: activePageIndex,
        sectionIndex,
        field,
        value,
      });
    },
    [blueprint, activePageIndex, save]
  );

  const handleCelebrationComplete = useCallback(() => {
    if (celebrationKey) {
      localStorage.setItem(celebrationKey, "true");
    }
    setMode("preview");
  }, [celebrationKey]);

  // Build PreviewPayload for LivePreviewFrame — must be before early returns (Rules of Hooks)
  const activePage = blueprint?.pages[activePageIndex] ?? null;
  const previewPayload: PreviewPayload | null = useMemo(() => {
    if (!activePage || !blueprint?.brand) return null;
    const sources: Record<string, { jsx: string; css: string }> = {};
    if (blueprint._codeComponents?.configs) {
      for (const [name, yamlStr] of Object.entries(blueprint._codeComponents.configs)) {
        try {
          const parsed = YAML.parse(yamlStr);
          sources[name] = {
            jsx: parsed?.js?.original ?? "",
            css: parsed?.css?.original ?? "",
          };
        } catch {
          // If YAML parsing fails, skip this component
        }
      }
    }
    return {
      page: activePage,
      brand: blueprint.brand,
      codeComponentSources: sources,
      generationMode: blueprint.generationMode ?? "design_system",
    };
  }, [activePage, blueprint?.brand, blueprint?._codeComponents, blueprint?.generationMode]);

  // Celebration mode
  if (mode === "celebration" && !loading && !error && blueprint) {
    return <CelebrationScreen onComplete={handleCelebrationComplete} />;
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-white/40 mt-4">Loading your content...</p>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 text-sm">{error || "Blueprint not found"}</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-4 text-sm text-brand-400 hover:text-brand-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Determine if visual preview is available (requires code_components or design_system with brand)
  const hasCodeComponents = blueprint.generationMode === "code_components" && !!blueprint._codeComponents;
  const canShowVisual = hasCodeComponents || (blueprint.brand != null);

  // Preview mode — full-width read-only with floating edit button
  if (mode === "preview") {
    return (
      <div className="w-full h-screen flex flex-col">
        <header className="shrink-0 border-b border-white/10 bg-white/[0.02] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-white/40 hover:text-white/70 transition-colors"
              aria-label="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white">Preview Your Site</h1>
              <p className="text-xs text-white/40">
                {blueprint.pages.length} pages generated &middot; Click &ldquo;Edit Content&rdquo; to make changes
              </p>
            </div>
          </div>
          <ApproveButton
            siteId={blueprint.siteId}
            totalPages={blueprint.pages.length}
            viewedPages={viewedPages}
          />
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Compact page nav */}
          <div className="w-48 shrink-0 border-r border-white/10 bg-white/[0.01] p-3 overflow-y-auto">
            {blueprint.pages.map((page, i) => (
              <button
                key={page.slug}
                type="button"
                onClick={() => handlePageSelect(i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                  i === activePageIndex
                    ? "bg-brand-500/10 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>

          {/* Preview content area */}
          {activePage && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Visual / Data toggle */}
              {canShowVisual && (
                <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-white/[0.01]">
                  <button
                    type="button"
                    onClick={() => setPreviewView("visual")}
                    className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                      previewView === "visual"
                        ? "bg-brand-500/20 text-brand-400"
                        : "text-white/40 hover:text-white/60 hover:bg-white/5"
                    }`}
                  >
                    Visual Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewView("data")}
                    className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                      previewView === "data"
                        ? "bg-brand-500/20 text-brand-400"
                        : "text-white/40 hover:text-white/60 hover:bg-white/5"
                    }`}
                  >
                    Data View
                  </button>
                </div>
              )}

              {/* Visual preview (LivePreviewFrame) */}
              {previewView === "visual" && canShowVisual && previewPayload ? (
                <div className="flex-1 overflow-hidden">
                  <LivePreviewFrame
                    payload={previewPayload}
                    onSectionClick={() => setMode("edit")}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <PagePreview
                    siteId={blueprint.siteId}
                    page={activePage}
                    pageIndex={activePageIndex}
                    editingSection={null}
                    onEditSection={() => setMode("edit")}
                    onSectionChange={() => {}}
                    onSectionRegenerated={handleSectionRegenerated}
                    onPageRegenerated={handlePageRegenerated}
                    insightsData={insightsData}
                    insightsOpen={insightsOpen}
                    onInsightClick={handleInsightClick}
                    pageInsightsOpen={pageInsightsOpen}
                    onPageInsightsClick={handlePageInsightsClick}
                    onPageInsightsClose={() => setPageInsightsOpen(false)}
                    allPageSlugs={blueprint.pages.map((p) => p.slug)}
                    codeComponentConfigs={blueprint._codeComponents?.configs}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Edit button */}
        <Button
          variant="cta"
          size="lg"
          className="fixed bottom-6 right-6 rounded-full shadow-lg shadow-brand-500/25 z-50"
          onClick={() => setMode("edit")}
        >
          Edit Content
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Button>
      </div>
    );
  }

  // Edit mode — full editor (existing layout)
  return (
    <div className="w-full h-screen flex flex-col">
      <header className="shrink-0 border-b border-white/10 bg-white/[0.02] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMode("preview")}
            className="text-white/40 hover:text-white/70 transition-colors"
            aria-label="Back to Preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white">Edit Your Content</h1>
            <p className="text-xs text-white/40">
              Click any section to edit &middot;{" "}
              <button
                type="button"
                onClick={() => setMode("preview")}
                className="text-brand-400 hover:text-brand-300"
              >
                Back to Preview
              </button>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && (
            <span className="text-xs text-white/30">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-emerald-400">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-400">Save failed</span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <PageSidebar
          pages={blueprint.pages.map((p) => ({ slug: p.slug, title: p.title }))}
          activePageIndex={activePageIndex}
          viewedPages={viewedPages}
          onPageSelect={handlePageSelect}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
        />

        {activePage && (
          <PagePreview
            siteId={blueprint.siteId}
            page={activePage}
            pageIndex={activePageIndex}
            editingSection={editingSection}
            onEditSection={setEditingSection}
            onSectionChange={handleSectionChange}
            onSectionRegenerated={handleSectionRegenerated}
            onPageRegenerated={handlePageRegenerated}
            insightsData={insightsData}
            insightsOpen={insightsOpen}
            onInsightClick={handleInsightClick}
            pageInsightsOpen={pageInsightsOpen}
            onPageInsightsClick={handlePageInsightsClick}
            onPageInsightsClose={() => setPageInsightsOpen(false)}
            allPageSlugs={blueprint.pages.map((p) => p.slug)}
          />
        )}
      </div>

      <ApproveButton
        siteId={blueprint.siteId}
        totalPages={blueprint.pages.length}
        viewedPages={viewedPages}
      />
    </div>
  );
}
