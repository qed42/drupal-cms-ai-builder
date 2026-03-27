"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import InferenceCard from "@/components/onboarding/InferenceCard";
import type { InferenceCardItem } from "@/components/onboarding/InferenceCard";
import { INDUSTRY_LABELS } from "@/lib/ai/prompts";
import { useOnboarding } from "@/hooks/useOnboarding";

interface AnalyzeData {
  industry: string;
  detectedServices: string[];
  compliance_flags: string[];
}

export default function DescribePage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();

  // Section 1: Business Name
  const [name, setName] = useState("");

  // Section 2: Business Description
  const [idea, setIdea] = useState("");
  const [validating, setValidating] = useState(false);
  const [quality, setQuality] = useState<"good" | "vague" | "nonsense" | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const lastValidated = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Section 3: Target Audience
  const [audience, setAudience] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const audienceSectionRef = useRef<HTMLDivElement>(null);
  const audienceFetched = useRef(false);

  // Inference card state
  const [showInference, setShowInference] = useState(false);
  const [inferenceConfirmed, setInferenceConfirmed] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeData | null>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.name) setName(d.data.name);
        if (d.data?.idea) setIdea(d.data.idea);
        if (d.data?.audience) setAudience(d.data.audience);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  // Fetch audience suggestions when idea is filled and audience section is visible
  const fetchAudienceSuggestions = useCallback(async (ideaText: string) => {
    if (audienceFetched.current || !ideaText || ideaText.trim().length < 20) return;
    audienceFetched.current = true;
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/ai/suggest-audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestions?.length > 0) setSuggestions(data.suggestions);
        if (data.painPoints?.length > 0) setPainPoints(data.painPoints);
      }
    } catch {
      // Non-fatal
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Observe audience section visibility to trigger suggestion fetch
  useEffect(() => {
    if (!loaded || !idea || idea.trim().length < 20) return;
    const el = audienceSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchAudienceSuggestions(idea);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loaded, idea, fetchAudienceSuggestions]);

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

  function handleIdeaBlur() {
    if (idea.trim().length >= 20) {
      validateIdea(idea);
    }
  }

  async function handleSubmit() {
    // Validate idea if not yet validated
    if (!quality && idea.trim().length >= 20) {
      await validateIdea(idea);
    }
    if (quality === "nonsense") return false;

    const res = await save("describe", {
      name,
      idea,
      audience,
    });
    if (res.ok) {
      router.push(buildStepUrl("style"));
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  const isBlocked = quality === "nonsense";
  const showWarning = quality === "vague" && suggestion;
  const canContinue = name.trim().length >= 2 && !isBlocked;

  // Build combined inference card
  const inferenceItems: InferenceCardItem[] = [];
  if (analyzeData) {
    inferenceItems.push({
      label: "Industry",
      value: INDUSTRY_LABELS[analyzeData.industry] || analyzeData.industry,
      type: "text",
    });
    if (analyzeData.detectedServices?.length > 0) {
      inferenceItems.push({
        label: "Key services",
        value: analyzeData.detectedServices,
        type: "list",
      });
    }
  }
  if (suggestions.length > 0) {
    inferenceItems.push({
      label: "Primary audience",
      value: suggestions[0],
      type: "text",
    });
  }
  if (painPoints.length > 0) {
    inferenceItems.push({
      label: "Pain points",
      value: painPoints,
      type: "list",
    });
  }

  const inferenceSlot = showInference && inferenceItems.length > 0 ? (
    <InferenceCard
      title="Archie analyzed your business"
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
      step="describe"
      layoutMode="split"
      title="Describe your business"
      subtitle="Tell Archie about your business in three quick sections."
      buttonLabel="Next: Style & Tone"
      onSubmit={handleSubmit}
      disabled={!canContinue}
      insightSlot={inferenceSlot}
      emptyStateText="Fill in your business details and Archie will identify your industry, services, and audience."
    >
      <div className="space-y-8 text-left">
        {/* Section 1: Business Name */}
        <div className="scroll-mt-24">
          <label className="block text-sm font-medium text-white/80 mb-2">
            What&apos;s your business called?
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name of the Project"
            inputSize="xl"
            autoFocus
          />
          <p className="text-xs text-white/30 mt-1">
            This becomes your site title and appears in search results.
          </p>
        </div>

        <div className="border-t border-white/5" />

        {/* Section 2: Business Description */}
        <div className="scroll-mt-24">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Tell us about your business
          </label>
          <Textarea
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
                audienceFetched.current = false;
              }
            }}
            onBlur={handleIdeaBlur}
            placeholder="Describe what you do, who you serve, and what makes you different..."
            rows={4}
            inputSize="xl"
            className="resize-none"
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
                <p className="text-xs text-amber-400/80">{suggestion}</p>
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
            <p className="text-xs text-white/30">{idea.length} characters</p>
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Section 3: Target Audience */}
        <div ref={audienceSectionRef} className="scroll-mt-24">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Who are your customers?
          </label>
          <Input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Describe your ideal audience..."
            inputSize="xl"
          />
          <div className="flex items-center justify-between mt-2 px-1">
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
            <p className="text-xs text-white/30">{audience.length} characters</p>
          </div>

          {/* AI-suggested audiences */}
          {loadingSuggestions && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-white/30 text-center">Finding audiences...</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-40 rounded-full" />
                <Skeleton className="h-8 w-36 rounded-full" />
              </div>
            </div>
          )}
          {!loadingSuggestions && suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
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
      </div>
    </StepLayout>
  );
}
