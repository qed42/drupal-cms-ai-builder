"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import InferenceCard from "@/components/onboarding/InferenceCard";
import type { InferenceCardItem } from "@/components/onboarding/InferenceCard";
import { INDUSTRY_LABELS } from "@/lib/ai/prompts";
import { useOnboarding } from "@/hooks/useOnboarding";

interface AnalyzeData {
  industry: string;
  detectedServices: string[];
  compliance_flags: string[];
}

export default function IdeaPage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();
  const [idea, setIdea] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [validating, setValidating] = useState(false);
  const [quality, setQuality] = useState<"good" | "vague" | "nonsense" | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const lastValidated = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inference card state
  const [showInference, setShowInference] = useState(false);
  const [inferenceConfirmed, setInferenceConfirmed] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeData | null>(null);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.idea) setIdea(d.data.idea);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  const fetchAnalysis = useCallback(async (text: string) => {
    setAnalyzeLoading(true);
    setShowInference(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyzeData(data);
      }
    } catch {
      // Non-fatal — card will just not show
      setShowInference(false);
    } finally {
      setAnalyzeLoading(false);
    }
  }, []);

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

        // Trigger analyze for inference card when quality is good
        if (data.quality === "good") {
          fetchAnalysis(text);
        }
      }
    } catch {
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
    if (!quality && idea.trim().length >= 20) {
      await validateIdea(idea);
    }
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

  // Build inference card items from analyze data
  const inferenceItems: InferenceCardItem[] = [];
  if (analyzeData) {
    inferenceItems.push({
      label: "Industry",
      value: INDUSTRY_LABELS[analyzeData.industry] || analyzeData.industry,
      type: "text",
    });
    if (analyzeData.detectedServices?.length > 0) {
      inferenceItems.push({
        label: "Key services detected",
        value: analyzeData.detectedServices,
        type: "list",
      });
    }
    if (analyzeData.compliance_flags?.length > 0) {
      inferenceItems.push({
        label: "Compliance",
        value: analyzeData.compliance_flags.join(", ").toUpperCase(),
        type: "text",
      });
    }
  }

  const inferenceSlot = showInference ? (
    <InferenceCard
      items={inferenceItems}
      explanation="This shapes your page suggestions, content tone, and SEO keywords."
      isLoading={analyzeLoading}
      variant={inferenceConfirmed ? "compact" : "full"}
      onConfirm={() => setInferenceConfirmed(true)}
      onEdit={() => {
        setShowInference(false);
        setInferenceConfirmed(false);
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    />
  ) : null;

  return (
    <StepLayout
      step="idea"
      layoutMode="split"
      title="Tell us about your business"
      subtitle="Describe what you do, who you serve, and what makes you different. The more detail, the better Archie can tailor your content."
      buttonLabel="Next: Your Audience"
      onSubmit={handleSubmit}
      disabled={idea.trim().length < 20 || isBlocked}
      insightSlot={inferenceSlot}
      emptyStateText="Describe your business and Archie will identify your industry, services, and compliance needs."
    >
      <div className="w-full">
        <textarea
          ref={textareaRef}
          value={idea}
          onChange={(e) => {
            setIdea(e.target.value);
            if (quality) {
              setQuality(null);
              setSuggestion(null);
              setShowInference(false);
              setInferenceConfirmed(false);
              setAnalyzeData(null);
            }
          }}
          onBlur={handleBlur}
          placeholder="Describe your project or business..."
          rows={4}
          className="w-full rounded-xl bg-white/10 px-6 py-4 text-lg text-white placeholder-white/30 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          autoFocus
        />
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex-1">
            {validating && (
              <p className="text-xs text-white/40">Checking...</p>
            )}
            {!validating && idea.trim().length > 0 && idea.trim().length < 20 && (
              <p className="text-xs text-amber-400/80">
                Give Archie more detail for a better site
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
                Archie has plenty to work with
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
