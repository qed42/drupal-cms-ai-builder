"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import InferenceCard from "@/components/onboarding/InferenceCard";
import { useOnboarding } from "@/hooks/useOnboarding";

interface Page {
  slug: string;
  title: string;
  description: string;
  required: boolean;
  custom?: boolean;
}

const MIN_PAGES = 3;
const MAX_PAGES = 12;
const MAX_CUSTOM_PAGES = 3;

export default function PagesPage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [pages, setPages] = useState<Page[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [inferenceConfirmed, setInferenceConfirmed] = useState(false);

  const customPageCount = pages.filter((p) => p.custom).length;

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
        setPages(
          suggestData.pages.map((p: Page) => ({
            ...p,
            description: p.description || "",
            custom: false,
          }))
        );
      }
    } catch {
      // Fallback handled by API
    } finally {
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.suggested_pages?.length > 0) {
          setPages(
            d.data.suggested_pages.map((p: Page) => ({
              ...p,
              description: p.description || "",
              custom: p.custom || false,
            }))
          );
          setLoaded(true);
        } else {
          setLoaded(true);
          runAIAnalysis(d.data || {});
        }
      })
      .catch(() => setLoaded(true));
  }, [resume, runAIAnalysis]);

  function removePage(slug: string) {
    if (pages.length <= MIN_PAGES) return;
    setPages(pages.filter((p) => p.slug !== slug));
  }

  function addCustomPage() {
    if (!customTitle.trim() || customPageCount >= MAX_CUSTOM_PAGES || pages.length >= MAX_PAGES) return;
    const slug = customTitle.trim().toLowerCase().replace(/\s+/g, "-");
    setPages([
      ...pages,
      {
        slug,
        title: customTitle.trim(),
        description: customDescription.trim() || `Custom page about ${customTitle.trim().toLowerCase()}`,
        required: false,
        custom: true,
      },
    ]);
    setCustomTitle("");
    setCustomDescription("");
    setAddingCustom(false);
  }

  async function handleSubmit() {
    const res = await save("pages", {
      pages: pages.map(({ slug, title, description, required, custom }) => ({
        slug,
        title,
        description,
        required,
        custom,
      })),
    });
    if (res.ok) {
      router.push(buildStepUrl("design"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  const inferenceSlot =
    !analyzing && pages.length > 0 ? (
      <InferenceCard
        title="Archie planned your site"
        items={[
          { label: "Pages", value: `${pages.length} pages`, type: "text" },
          { label: "Structure", value: pages.map((p) => p.title), type: "list" },
        ]}
        explanation="This structure is based on your industry and what similar businesses need. You can add or remove pages above."
        variant={inferenceConfirmed ? "compact" : "full"}
        onConfirm={() => setInferenceConfirmed(true)}
        onEdit={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        editLabel="Edit pages above"
      />
    ) : null;

  return (
    <StepLayout
      step="pages"
      layoutMode="split"
      title="Here's your site plan"
      subtitle="Archie mapped these pages based on your business. Add, remove, or rename as you like."
      buttonLabel="Continue"
      onSubmit={handleSubmit}
      disabled={analyzing || pages.length < MIN_PAGES}
      insightSlot={inferenceSlot}
      emptyStateText="Archie is planning your site structure based on your business type."
    >
      {analyzing ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Analyzing your idea with AI...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Page cards with descriptions */}
          <div className="space-y-2">
            {pages.map((page) => (
              <div
                key={page.slug}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                  page.custom
                    ? "bg-brand-500/10 border border-brand-500/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {page.title}
                    </span>
                    {page.custom && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/30 text-brand-300 uppercase tracking-wide">
                        Custom
                      </span>
                    )}
                  </div>
                  {page.description && (
                    <p className="text-xs text-white/40 mt-0.5 truncate">
                      {page.description}
                    </p>
                  )}
                </div>
                {pages.length > MIN_PAGES && !page.required && (
                  <button
                    type="button"
                    onClick={() => removePage(page.slug)}
                    className="shrink-0 rounded-full hover:bg-white/10 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white transition-colors mt-0.5"
                    aria-label={`Remove ${page.title}`}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Custom Page */}
          {pages.length < MAX_PAGES && (
            <div className="flex justify-center">
              {addingCustom ? (
                <div className="w-full rounded-xl border border-dashed border-brand-500/40 bg-brand-500/5 p-4 space-y-3">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Page title..."
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none"
                    autoFocus
                  />
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Brief description of what this page should contain..."
                    rows={2}
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addCustomPage}
                      disabled={!customTitle.trim()}
                      className="rounded-full bg-brand-500 px-4 py-1.5 text-sm text-white hover:bg-brand-600 transition-colors disabled:opacity-40"
                    >
                      Add Page
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCustom(false);
                        setCustomTitle("");
                        setCustomDescription("");
                      }}
                      className="text-white/40 hover:text-white text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : customPageCount >= MAX_CUSTOM_PAGES ? (
                <p className="text-xs text-white/30">
                  Maximum {MAX_CUSTOM_PAGES} custom pages reached
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingCustom(true)}
                  className="rounded-full border border-dashed border-brand-500/40 px-4 py-2 text-sm text-brand-300/70 hover:text-brand-300 hover:border-brand-500/60 transition-colors"
                >
                  + Add Custom Page
                </button>
              )}
            </div>
          )}

          <p className="text-white/30 text-xs text-center">
            {pages.length} of {MAX_PAGES} pages
            {customPageCount > 0 && ` (${customPageCount} custom)`}
          </p>
        </div>
      )}
    </StepLayout>
  );
}
