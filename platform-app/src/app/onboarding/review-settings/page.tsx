"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import StepIcon from "@/components/onboarding/StepIcon";
import ProgressStepper from "@/components/onboarding/ProgressStepper";
import { INDUSTRY_LABELS } from "@/lib/ai/prompts";

interface SessionData {
  name?: string;
  idea?: string;
  audience?: string;
  industry?: string;
  pages?: { title: string; description?: string }[];
  colors?: Record<string, string>;
  fonts?: { heading?: string; body?: string };
  tone?: string;
}

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 text-left">
      <div className="w-28 shrink-0 text-sm text-white/40 pt-0.5">{label}</div>
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
    } else {
      setGenerating(false);
    }
  }

  if (!loaded) return null;

  const pageNames = data.pages?.map((p) => p.title) || [];
  const toneLabel = data.tone?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Default";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-xl mx-auto px-6 text-center">
      <div className="mb-6">
        <StepIcon step="review-settings" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Ready to generate?
      </h1>
      <p className="text-white/50 text-lg mb-8 max-w-md">
        Review your selections below. AI will generate your complete website based on these inputs.
      </p>

      {/* Settings summary */}
      <div className="w-full rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 mb-8">
        <SummarySection label="Site Name">
          {data.name || <span className="text-white/30">Not set</span>}
        </SummarySection>

        <SummarySection label="Business Idea">
          <span className="line-clamp-2">{data.idea || <span className="text-white/30">Not set</span>}</span>
        </SummarySection>

        <SummarySection label="Audience">
          {data.audience || <span className="text-white/30">Not set</span>}
        </SummarySection>

        <SummarySection label="Industry">
          {data.industry ? (INDUSTRY_LABELS[data.industry] || data.industry.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())) : <span className="text-white/30">Auto-detected</span>}
        </SummarySection>

        <SummarySection label="Pages">
          {pageNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pageNames.map((name, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-white/70">
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-white/30">Auto-generated</span>
          )}
        </SummarySection>

        {data.colors && Object.keys(data.colors).length > 0 && (
          <SummarySection label="Colors">
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.colors).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: value }} />
                  <span className="text-xs text-white/50">{key}</span>
                </div>
              ))}
            </div>
          </SummarySection>
        )}

        {data.fonts && (
          <SummarySection label="Fonts">
            {data.fonts.heading || "Default"} / {data.fonts.body || "Default"}
          </SummarySection>
        )}

        <SummarySection label="Tone">
          {toneLabel}
        </SummarySection>
      </div>

      {/* How your inputs are used */}
      <div className="w-full rounded-lg border border-white/5 bg-white/[0.02] p-4 mb-6">
        <p className="text-xs text-white/30 leading-relaxed">
          <span className="text-white/50 font-medium">How your inputs shape your site:</span>{" "}
          Your business idea and audience drive page content and tone. Brand colors and fonts are applied to your chosen theme.
          Pages are structured with SEO-optimized layouts tailored to your industry. Generation takes approximately 2-3 minutes.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push(buildStepUrl("tone"))}
          className="rounded-full px-6 py-3 text-white/60 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-full bg-brand-500 px-10 py-4 text-lg font-medium text-white transition-all hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-brand-500/25"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Starting...
            </>
          ) : (
            <>
              Generate My Website
              <span className="text-xl">&rarr;</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-12">
        <ProgressStepper currentStep="review-settings" />
      </div>
    </div>
  );
}
