"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import InferenceCard from "@/components/onboarding/InferenceCard";
import type { InferenceCardItem } from "@/components/onboarding/InferenceCard";
import { useOnboarding } from "@/hooks/useOnboarding";
import { INDUSTRY_LABELS } from "@/lib/ai/prompts";
import { TONE_SAMPLES } from "@/lib/onboarding/tone-samples";
import StrategyPreview from "@/components/onboarding/StrategyPreview";

interface ImageUploadSummary {
  id: string;
  filename: string;
  description: string;
  status: string;
}

interface SessionData {
  name?: string;
  idea?: string;
  audience?: string;
  industry?: string;
  pages?: { title: string; description?: string }[];
  colors?: Record<string, string>;
  fonts?: { heading?: string; body?: string };
  tone?: string;
  user_images?: ImageUploadSummary[];
  use_stock_only?: boolean;
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 text-left">
      <div className="w-24 shrink-0 text-xs font-medium text-white/40 pt-0.5 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm text-white/80 flex-1">{children}</div>
    </div>
  );
}

export default function ReviewSettingsPage() {
  const router = useRouter();
  const { siteId, resume, buildStepUrl } = useOnboarding();
  const [data, setData] = useState<SessionData>({});
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        setData(d.data || {});
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  async function handleGenerate() {
    setGenerating(true);

    // Mark onboarding complete
    await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "review-settings", data: { onboarding_complete: true }, siteId }),
    });

    // Trigger generation
    const res = await fetch("/api/provision/generate-blueprint", {
      method: "POST",
    });

    if (res.ok) {
      const genData = await res.json();
      const progressSiteId = genData.siteId || siteId;
      router.push(`/onboarding/progress?siteId=${progressSiteId}`);
      return true;
    }

    setGenerating(false);
    return false;
  }

  if (!loaded) return null;

  const pageNames = data.pages?.map((p) => p.title) || [];
  const toneLabel =
    (data.tone && TONE_SAMPLES.find((t) => t.id === data.tone)?.name) ||
    data.tone
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Default";

  const readyImages = data.user_images?.filter((i) => i.status === "ready") || [];

  // Build inference card for right panel
  const inferenceItems: InferenceCardItem[] = [
    { label: "Site name", value: data.name || "Not set", type: "text" },
    { label: "Industry", value: data.industry ? (INDUSTRY_LABELS[data.industry] || data.industry) : "Auto-detected", type: "text" },
    { label: "Voice", value: toneLabel, type: "text" },
  ];
  if (pageNames.length > 0) {
    inferenceItems.push({ label: "Pages", value: `${pageNames.length} pages`, type: "text" });
  }
  if (data.fonts) {
    inferenceItems.push({ label: "Fonts", value: `${data.fonts.heading || "Default"} / ${data.fonts.body || "Default"}`, type: "text" });
  }

  const insightSlot = (
    <div className="space-y-4">
      <InferenceCard
        title="Your site summary"
        items={inferenceItems}
        explanation="These settings drive every page, section, and piece of copy Archie generates."
        onConfirm={() => {}}
        onEdit={() => router.push(buildStepUrl("describe"))}
        editLabel="Edit from start"
      />
      {siteId && <StrategyPreview siteId={siteId} />}
    </div>
  );

  return (
    <StepLayout
      step="review-settings"
      layoutMode="split"
      title="Review & launch"
      subtitle="Here's everything Archie will use to build your site. Make any final changes."
      buttonLabel={generating ? "Starting..." : "Generate My Website"}
      onSubmit={handleGenerate}
      submitting={generating}
      insightSlot={insightSlot}
      emptyStateText="Review your settings before Archie starts building."
    >
      <div className="space-y-6 text-left">
        {/* Settings summary card */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
          <SummaryRow label="Name">
            {data.name || <span className="text-white/30">Not set</span>}
          </SummaryRow>

          <SummaryRow label="Idea">
            <span className="line-clamp-2">
              {data.idea || <span className="text-white/30">Not set</span>}
            </span>
          </SummaryRow>

          <SummaryRow label="Audience">
            {data.audience || <span className="text-white/30">Not set</span>}
          </SummaryRow>

          <SummaryRow label="Pages">
            {pageNames.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {pageNames.map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-white/70"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-white/30">Auto-generated</span>
            )}
          </SummaryRow>

          {data.colors && Object.keys(data.colors).length > 0 && (
            <SummaryRow label="Colors">
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-xs text-white/50">{key}</span>
                  </div>
                ))}
              </div>
            </SummaryRow>
          )}

          {data.fonts && (
            <SummaryRow label="Fonts">
              {data.fonts.heading || "Default"} / {data.fonts.body || "Default"}
            </SummaryRow>
          )}

          <SummaryRow label="Tone">{toneLabel}</SummaryRow>

          <SummaryRow label="Images">
            {data.use_stock_only ? (
              <span className="text-white/50">Stock photos (auto-selected)</span>
            ) : readyImages.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 text-xs text-green-400 border border-green-500/20">
                  Your photos
                </span>
                <span className="text-xs text-white/50">
                  {readyImages.length} image{readyImages.length !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <span className="text-white/50">Stock photos (auto-selected)</span>
            )}
          </SummaryRow>
        </div>

        {/* How your inputs are used */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/30 leading-relaxed">
            <span className="text-white/50 font-medium">How Archie builds your site:</span>{" "}
            Your business idea and audience drive page content and tone. Brand colors and fonts
            are applied to your chosen theme. Pages are structured with SEO-optimized layouts
            tailored to your industry. Generation takes approximately 2-3 minutes.
          </p>
        </div>
      </div>
    </StepLayout>
  );
}
