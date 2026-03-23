"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function IdeaPage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [idea, setIdea] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [validating, setValidating] = useState(false);
  const [quality, setQuality] = useState<"good" | "vague" | "nonsense" | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const lastValidated = useRef("");

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.idea) setIdea(d.data.idea);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  async function validateIdea(text: string) {
    if (text.trim().length < 20 || text === lastValidated.current) return;
    lastValidated.current = text;
    setValidating(true);
    try {
      const res = await fetch("/api/ai/validate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuality(data.quality);
        setSuggestion(data.suggestion);
      }
    } catch {
      // On failure, don't block
      setQuality("good");
    } finally {
      setValidating(false);
    }
  }

  function handleBlur() {
    if (idea.trim().length >= 20) {
      validateIdea(idea);
    }
  }

  async function handleSubmit() {
    // Validate before proceeding if not yet validated
    if (!quality && idea.trim().length >= 20) {
      await validateIdea(idea);
    }
    // Block submission if quality is nonsense
    if (quality === "nonsense") return false;

    const res = await save("idea", { idea });
    if (res.ok) {
      router.push(buildStepUrl("audience"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  const isBlocked = quality === "nonsense";
  const showWarning = quality === "vague" && suggestion;

  return (
    <StepLayout
      step="idea"
      title="What's the big idea?"
      subtitle="In a few lines, tell us what this is all about."
      buttonLabel="Your Audience"
      onSubmit={handleSubmit}
      disabled={idea.trim().length < 20 || isBlocked}
    >
      <div className="w-full">
        <textarea
          value={idea}
          onChange={(e) => {
            setIdea(e.target.value);
            // Reset validation when user changes text
            if (quality) {
              setQuality(null);
              setSuggestion(null);
            }
          }}
          onBlur={handleBlur}
          placeholder="Describe your project or business..."
          rows={4}
          className="w-full rounded-xl bg-white/10 px-6 py-4 text-lg text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none text-center"
          autoFocus
        />
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex-1">
            {validating && (
              <p className="text-xs text-white/40">Checking...</p>
            )}
            {!validating && idea.trim().length > 0 && idea.trim().length < 20 && (
              <p className="text-xs text-amber-400/80">
                Add a bit more detail for better results
              </p>
            )}
            {!validating && showWarning && (
              <p className="text-xs text-amber-400/80">
                {suggestion}
              </p>
            )}
            {!validating && isBlocked && (
              <p className="text-xs text-red-400/80">
                {suggestion || "Please describe a real project or business idea"}
              </p>
            )}
            {!validating && quality === "good" && (
              <p className="text-xs text-emerald-400/80">
                Looks great!
              </p>
            )}
          </div>
          <p className="text-xs text-white/30">
            {idea.length} characters
          </p>
        </div>
      </div>
    </StepLayout>
  );
}
