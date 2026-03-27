"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import InferenceCard from "@/components/onboarding/InferenceCard";
import type { InferenceCardItem } from "@/components/onboarding/InferenceCard";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function AudiencePage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [audience, setAudience] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showInference, setShowInference] = useState(false);
  const [inferenceConfirmed, setInferenceConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.audience) setAudience(d.data.audience);
        setLoaded(true);

        // Fetch audience suggestions based on the idea from previous step
        if (d.data?.idea) {
          setLoadingSuggestions(true);
          setShowInference(true);
          fetch("/api/ai/suggest-audiences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idea: d.data.idea }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.suggestions?.length > 0) {
                setSuggestions(data.suggestions);
              }
              if (data.painPoints?.length > 0) {
                setPainPoints(data.painPoints);
              }
              // Show inference card whenever API responds with suggestions
              if (data.suggestions?.length > 0) {
                setShowInference(true);
              }
            })
            .catch(() => {
              // Still show inference if we already have suggestions from resume
            })
            .finally(() => setLoadingSuggestions(false));
        }
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  async function handleSubmit() {
    const res = await save("audience", { audience });
    if (res.ok) {
      router.push(buildStepUrl("pages"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  // Build inference card items
  const inferenceItems: InferenceCardItem[] = [];
  if (suggestions.length > 0) {
    inferenceItems.push({
      label: "Primary audience",
      value: suggestions[0],
      type: "text",
    });
  }
  if (painPoints.length > 0) {
    inferenceItems.push({
      label: "Pain points identified",
      value: painPoints,
      type: "list",
    });
  }

  const inferenceSlot =
    showInference ? (
      <InferenceCard
        items={inferenceItems}
        explanation="These pain points will drive your homepage messaging and CTA language."
        isLoading={loadingSuggestions}
        variant={inferenceConfirmed ? "compact" : "full"}
        onConfirm={() => setInferenceConfirmed(true)}
        onEdit={() => {
          setShowInference(false);
          setInferenceConfirmed(false);
          inputRef.current?.focus();
          inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        editLabel="Edit my audience"
      />
    ) : null;

  return (
    <StepLayout
      step="audience"
      layoutMode="split"
      title="Who are your customers?"
      subtitle="Help Archie understand who'll visit your site — their needs drive your messaging."
      buttonLabel="Next: Site Structure"
      onSubmit={handleSubmit}
      disabled={audience.trim().length < 10}
      insightSlot={inferenceSlot}
      emptyStateText="I'm analyzing your audience suggestions..."
    >
      <div className="w-full space-y-4">
        <input
          ref={inputRef}
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Describe your ideal audience..."
          className="w-full rounded-xl bg-white/10 px-6 py-4 text-lg text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          autoFocus
        />
        <div className="flex items-center justify-between px-1">
          <div className="flex-1">
            {audience.trim().length > 0 && audience.trim().length < 30 && (
              <p className="text-xs text-amber-400/80">
                Give Archie more detail &mdash; who exactly are your customers?
              </p>
            )}
            {audience.trim().length >= 30 && audience.trim().length <= 80 && (
              <p className="text-xs text-amber-400/60">
                Good start. Adding age range, location, or pain points helps.
              </p>
            )}
            {audience.trim().length > 80 && (
              <p className="text-xs text-emerald-400/80">
                Excellent. Archie can really target your messaging now.
              </p>
            )}
          </div>
          <p className="text-xs text-white/30">
            {audience.length} characters
          </p>
        </div>

        {/* AI-suggested audiences */}
        {loadingSuggestions && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="w-3.5 h-3.5 border-2 border-brand-400/40 border-t-brand-400 rounded-full animate-spin" />
            <span className="text-xs text-white/40">Suggesting audiences...</span>
          </div>
        )}
        {!loadingSuggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/30 text-center">Suggestions based on your idea</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAudience(s)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    audience === s
                      ? "bg-brand-500/20 border border-brand-500/40 text-brand-300"
                      : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
