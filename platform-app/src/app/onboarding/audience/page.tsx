"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function AudiencePage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [audience, setAudience] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.audience) setAudience(d.data.audience);
        setLoaded(true);

        // Fetch audience suggestions based on the idea from previous step
        if (d.data?.idea) {
          setLoadingSuggestions(true);
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
            })
            .catch(() => {})
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

  return (
    <StepLayout
      step="audience"
      title="Who is this for?"
      subtitle="Describe your ideal audience — who will visit your site?"
      buttonLabel="Plan the Structure"
      onSubmit={handleSubmit}
      disabled={audience.trim().length < 10}
    >
      <div className="w-full space-y-4">
        <input
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Describe your ideal audience..."
          className="w-full rounded-xl bg-white/10 px-6 py-4 text-lg text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-center"
          autoFocus
        />
        <div className="flex items-center justify-between px-1">
          {audience.trim().length > 0 && audience.trim().length < 10 ? (
            <p className="text-xs text-amber-400/80">
              A bit more detail helps us tailor your site
            </p>
          ) : (
            <span />
          )}
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
