"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import PageChip from "@/components/onboarding/PageChip";

interface Page {
  slug: string;
  title: string;
  required: boolean;
}

const MIN_PAGES = 3;
const MAX_PAGES = 12;

export default function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [addingPage, setAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");

  const runAIAnalysis = useCallback(async (data: Record<string, unknown>) => {
    setAnalyzing(true);
    try {
      // Step 1: Analyze the idea
      const analyzeRes = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: data.idea || "",
          audience: data.audience || "",
        }),
      });
      const analyzeData = await analyzeRes.json();

      // Step 2: Get page suggestions
      const suggestRes = await fetch("/api/ai/suggest-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: analyzeData.industry || "other",
          idea: data.idea || "",
          audience: data.audience || "",
        }),
      });
      const suggestData = await suggestRes.json();

      if (suggestData.pages?.length > 0) {
        setPages(suggestData.pages);
      }
    } catch {
      // Fallback handled by API
    } finally {
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/onboarding/resume")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.suggested_pages?.length > 0) {
          setPages(d.data.suggested_pages);
          setLoaded(true);
        } else {
          setLoaded(true);
          // Run AI analysis if no pages yet
          runAIAnalysis(d.data || {});
        }
      })
      .catch(() => setLoaded(true));
  }, [runAIAnalysis]);

  function removePage(slug: string) {
    if (pages.length <= MIN_PAGES) return;
    setPages(pages.filter((p) => p.slug !== slug));
  }

  function addPage() {
    if (!newPageTitle.trim() || pages.length >= MAX_PAGES) return;
    const slug = newPageTitle.trim().toLowerCase().replace(/\s+/g, "-");
    setPages([...pages, { slug, title: newPageTitle.trim(), required: false }]);
    setNewPageTitle("");
    setAddingPage(false);
  }

  async function handleSubmit() {
    const res = await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "pages", data: { pages } }),
    });
    if (res.ok) {
      router.push("/onboarding/design");
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  return (
    <StepLayout
      step="pages"
      title="Let's map your site."
      subtitle="Based on what you've shared, here are the suggested pages. Keep it, tweak it, or make it your own."
      buttonLabel="Shape the Experience"
      onSubmit={handleSubmit}
      disabled={analyzing || pages.length < MIN_PAGES}
    >
      {analyzing ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Analyzing your idea with AI...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {pages.map((page) => (
              <PageChip
                key={page.slug}
                title={page.title}
                onRemove={() => removePage(page.slug)}
                removable={pages.length > MIN_PAGES}
              />
            ))}
          </div>

          {pages.length < MAX_PAGES && (
            <div className="flex justify-center">
              {addingPage ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPage()}
                    placeholder="Page name..."
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:border-indigo-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addPage}
                    className="rounded-full bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-600 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAddingPage(false); setNewPageTitle(""); }}
                    className="text-white/40 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingPage(true)}
                  className="rounded-full border border-dashed border-white/30 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/60 transition-colors"
                >
                  + Add page
                </button>
              )}
            </div>
          )}

          <p className="text-white/30 text-xs text-center">
            {pages.length} of {MAX_PAGES} pages
          </p>
        </div>
      )}
    </StepLayout>
  );
}
