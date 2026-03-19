"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageSidebar from "./components/PageSidebar";
import PagePreview from "./components/PagePreview";
import ApproveButton from "./components/ApproveButton";
import { useAutoSave } from "./hooks/useAutoSave";
import type { PageLayout } from "@/lib/blueprint/types";

interface BlueprintData {
  id: string;
  siteId: string;
  pages: PageLayout[];
}

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = searchParams.get("siteId");

  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [viewedPages, setViewedPages] = useState<Set<number>>(new Set([0]));
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const { save } = useAutoSave({
    siteId: siteId ?? "",
    onSaveStart: () => setSaveStatus("saving"),
    onSaveComplete: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onSaveError: () => setSaveStatus("error"),
  });

  // Load blueprint
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
        // Extract pages from the BlueprintBundle payload
        const payload = data.payload as { pages?: PageLayout[] } | null;
        setBlueprint({
          id: data.id,
          siteId: data.siteId,
          pages: payload?.pages ?? [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    loadBlueprint();
  }, [siteId, router]);

  // Track viewed pages
  const handlePageSelect = useCallback((index: number) => {
    setActivePageIndex(index);
    setEditingSection(null);
    setViewedPages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Handle section edits
  const handleSectionChange = useCallback(
    (sectionIndex: number, field: string, value: string) => {
      if (!blueprint) return;

      // Update local state
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

      // Auto-save
      save({
        pageIndex: activePageIndex,
        sectionIndex,
        field,
        value,
      });
    },
    [blueprint, activePageIndex, save]
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin mx-auto" />
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
            className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activePage = blueprint.pages[activePageIndex];

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top bar */}
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
            <h1 className="text-sm font-semibold text-white">Review Your Content</h1>
            <p className="text-xs text-white/40">
              Review and edit your generated content before building your site
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

      {/* Main layout: sidebar + preview */}
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar
          pages={blueprint.pages.map((p) => ({ slug: p.slug, title: p.title }))}
          activePageIndex={activePageIndex}
          viewedPages={viewedPages}
          onPageSelect={handlePageSelect}
        />

        {activePage && (
          <PagePreview
            page={activePage}
            pageIndex={activePageIndex}
            editingSection={editingSection}
            onEditSection={setEditingSection}
            onSectionChange={handleSectionChange}
          />
        )}
      </div>

      {/* Bottom approve bar */}
      <ApproveButton
        siteId={blueprint.siteId}
        totalPages={blueprint.pages.length}
        viewedPages={viewedPages}
      />
    </div>
  );
}
