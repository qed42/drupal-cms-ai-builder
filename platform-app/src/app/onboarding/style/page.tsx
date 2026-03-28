"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DesignOptionCard from "@/components/onboarding/DesignOptionCard";
import InferenceCard from "@/components/onboarding/InferenceCard";
import type { InferenceCardItem } from "@/components/onboarding/InferenceCard";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TONE_SAMPLES, getDifferentiatorPlaceholder } from "@/lib/onboarding/tone-samples";
import { useOnboarding } from "@/hooks/useOnboarding";

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  features: string[];
}

const THEMES: ThemeOption[] = [
  {
    id: "space_ds",
    name: "Space DS",
    description: "Modern, flexible design system with compositional layouts.",
    features: ["31 components", "Flexible grid", "Brand customization"],
  },
  {
    id: "mercury",
    name: "Mercury",
    description: "Clean, minimal theme with Tailwind CSS and design tokens.",
    features: ["22 components", "Tailwind v4", "Dark mode"],
  },
];

export default function StylePage() {
  const router = useRouter();
  const { buildStepUrl, resume, save } = useOnboarding();

  // Section 0: Generation Mode
  const [generationMode, setGenerationMode] = useState<"design_system" | "code_components">("design_system");
  const [animationLevel, setAnimationLevel] = useState<"subtle" | "moderate" | "dramatic">("subtle");
  const [visualStyle, setVisualStyle] = useState<"minimal" | "bold" | "elegant" | "playful">("minimal");
  const [interactivity, setInteractivity] = useState<"static" | "scroll_effects" | "interactive">("static");

  // Section 1: Theme
  const [selectedTheme, setSelectedTheme] = useState("space_ds");

  // Section 2: Design Source
  const [designSource, setDesignSource] = useState<"ai" | "figma">("ai");

  // Section 3: Brand Voice
  const [selectedTone, setSelectedTone] = useState("");
  const [differentiators, setDifferentiators] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([""]);
  const [existingCopy, setExistingCopy] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [industry, setIndustry] = useState("_default");

  const [loaded, setLoaded] = useState(false);
  const [showInference, setShowInference] = useState(false);
  const [inferenceConfirmed, setInferenceConfirmed] = useState(false);

  useEffect(() => {
    resume()
      .then((d) => {
        if (d.data?.generationMode) setGenerationMode(d.data.generationMode);
        if (d.data?.designPreferences) {
          const prefs = d.data.designPreferences;
          if (prefs.animationLevel) setAnimationLevel(prefs.animationLevel);
          if (prefs.visualStyle) setVisualStyle(prefs.visualStyle);
          if (prefs.interactivity) setInteractivity(prefs.interactivity);
        }
        if (d.data?.designSystemId) setSelectedTheme(d.data.designSystemId);
        if (d.data?.design_source) setDesignSource(d.data.design_source);
        if (d.data?.industry) setIndustry(d.data.industry);
        if (d.data?.tone) {
          setSelectedTone(d.data.tone);
          setShowInference(true);
        }
        if (d.data?.differentiators) setDifferentiators(d.data.differentiators);
        if (d.data?.referenceUrls?.length) setReferenceUrls(d.data.referenceUrls);
        if (d.data?.existingCopy) setExistingCopy(d.data.existingCopy);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [resume]);

  function updateUrl(index: number, value: string) {
    setReferenceUrls((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }

  function addUrlField() {
    if (referenceUrls.length < 3) {
      setReferenceUrls((prev) => [...prev, ""]);
    }
  }

  function removeUrlField(index: number) {
    setReferenceUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    const cleanUrls = referenceUrls.filter((u) => u.trim() !== "");

    const res = await save("style", {
      generationMode,
      designPreferences: generationMode === "code_components"
        ? { animationLevel, visualStyle, interactivity }
        : undefined,
      designSystemId: selectedTheme,
      design_source: designSource,
      tone: selectedTone,
      differentiators,
      referenceUrls: cleanUrls,
      existingCopy: existingCopy || undefined,
    });
    if (res.ok) {
      router.push(buildStepUrl("brand"));
      return true;
    }
    return false;
  }

  // Build inference card
  const selectedToneData = useMemo(
    () => TONE_SAMPLES.find((t) => t.id === selectedTone),
    [selectedTone]
  );

  const selectedThemeData = THEMES.find((t) => t.id === selectedTheme);

  const inferenceItems: InferenceCardItem[] = [];
  if (selectedThemeData) {
    inferenceItems.push({
      label: "Theme",
      value: selectedThemeData.name,
      type: "text",
    });
  }
  if (selectedToneData) {
    inferenceItems.push({
      label: "Voice",
      value: `${selectedToneData.name} — ${selectedToneData.description}`,
      type: "text",
    });
    inferenceItems.push({
      label: "Example",
      value: [selectedToneData.sample],
      type: "list",
    });
  }

  const inferenceSlot =
    showInference && selectedToneData ? (
      <InferenceCard
        title="Your site personality"
        items={inferenceItems}
        explanation="This combination of theme and voice will be used across all your website content."
        variant={inferenceConfirmed ? "compact" : "full"}
        onConfirm={() => setInferenceConfirmed(true)}
        onEdit={() => {
          setShowInference(false);
          setInferenceConfirmed(false);
          setSelectedTone("");
        }}
        editLabel="Change selections"
      />
    ) : null;

  if (!loaded) return null;

  return (
    <StepLayout
      step="style"
      layoutMode="split"
      title="Style & voice"
      subtitle="Choose how your site looks and speaks to visitors."
      buttonLabel="Next: Brand Identity"
      onSubmit={handleSubmit}
      disabled={!selectedTone}
      insightSlot={inferenceSlot}
      emptyStateText="Pick a theme and tone, and I'll show you how they come together..."
    >
      <div className="space-y-8 text-left">
        {/* Section 0: Design Approach */}
        <div className="scroll-mt-24">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Design approach
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGenerationMode("design_system")}
              className={`text-left p-5 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${
                generationMode === "design_system"
                  ? "border-brand-500 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <h3 className="text-sm font-semibold text-white mb-1">Polished & Consistent</h3>
              <p className="text-white/50 text-xs mb-2">
                Uses a curated design system with pre-built components for a professional, cohesive look.
              </p>
              <ul className="space-y-0.5">
                <li className="text-white/40 text-[11px] flex items-center gap-1">
                  <span className="text-brand-400">&#10003;</span> Proven layouts
                </li>
                <li className="text-white/40 text-[11px] flex items-center gap-1">
                  <span className="text-brand-400">&#10003;</span> Fast generation
                </li>
                <li className="text-white/40 text-[11px] flex items-center gap-1">
                  <span className="text-brand-400">&#10003;</span> Brand-consistent
                </li>
              </ul>
            </button>
            <button
              type="button"
              onClick={() => setGenerationMode("code_components")}
              className={`text-left p-5 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${
                generationMode === "code_components"
                  ? "border-brand-500 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <h3 className="text-sm font-semibold text-white mb-1">Unique & Creative</h3>
              <p className="text-white/50 text-xs mb-2">
                AI generates custom components with animations and unique visual treatments.
              </p>
              <ul className="space-y-0.5">
                <li className="text-white/40 text-[11px] flex items-center gap-1">
                  <span className="text-brand-400">&#10003;</span> Custom designs
                </li>
                <li className="text-white/40 text-[11px] flex items-center gap-1">
                  <span className="text-brand-400">&#10003;</span> Animations
                </li>
                <li className="text-white/40 text-[11px] flex items-center gap-1">
                  <span className="text-brand-400">&#10003;</span> Standout visuals
                </li>
              </ul>
            </button>
          </div>

          {/* Design preferences for code_components mode */}
          {generationMode === "code_components" && (
            <div className="mt-4 space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-2">Fine-tune your creative direction</p>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Animation level</label>
                <select
                  value={animationLevel}
                  onChange={(e) => setAnimationLevel(e.target.value as "subtle" | "moderate" | "dramatic")}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:border-brand-500 focus:outline-none"
                >
                  <option value="subtle">Subtle — gentle transitions</option>
                  <option value="moderate">Moderate — noticeable motion</option>
                  <option value="dramatic">Dramatic — bold animations</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Visual style</label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value as "minimal" | "bold" | "elegant" | "playful")}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:border-brand-500 focus:outline-none"
                >
                  <option value="minimal">Minimal — clean and spacious</option>
                  <option value="bold">Bold — strong contrasts</option>
                  <option value="elegant">Elegant — refined details</option>
                  <option value="playful">Playful — vibrant and fun</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Interactivity</label>
                <select
                  value={interactivity}
                  onChange={(e) => setInteractivity(e.target.value as "static" | "scroll_effects" | "interactive")}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white text-sm px-3 py-2 focus:border-brand-500 focus:outline-none"
                >
                  <option value="static">Static — no scroll effects</option>
                  <option value="scroll_effects">Scroll effects — parallax and reveals</option>
                  <option value="interactive">Interactive — hover effects and micro-interactions</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/5" />

        {/* Section 1: Visual Theme */}
        <div className="scroll-mt-24">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Pick your visual style
          </label>
          <RadioGroup
            value={selectedTheme}
            onValueChange={setSelectedTheme}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {THEMES.map((theme) => (
              <label
                key={theme.id}
                className={`text-left p-5 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${
                  selectedTheme === theme.id
                    ? "border-brand-500 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <RadioGroupItem value={theme.id} className="sr-only" />
                <h3 className="text-sm font-semibold text-white mb-1">
                  {theme.name}
                </h3>
                <p className="text-white/50 text-xs mb-2">{theme.description}</p>
                <ul className="space-y-0.5">
                  {theme.features.map((feature) => (
                    <li key={feature} className="text-white/40 text-[11px] flex items-center gap-1">
                      <span className="text-brand-400">&#10003;</span> {feature}
                    </li>
                  ))}
                </ul>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="border-t border-white/5" />

        {/* Section 2: Design Source */}
        <div className="scroll-mt-24">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Design approach
          </label>
          <RadioGroup
            value={designSource}
            onValueChange={(val: string) => setDesignSource(val as "ai" | "figma")}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <DesignOptionCard
              title="Let Space AI choose"
              subtitle="We'll generate a template based on your answers"
              icon={
                <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              }
              selected={designSource === "ai"}
              value="ai"
            />
            <DesignOptionCard
              title="Provide Figma details"
              subtitle="Upload your design or paste a URL"
              icon={
                <svg className="w-6 h-6 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5zM12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
                </svg>
              }
              selected={designSource === "figma"}
              disabled={true}
              badge="Coming soon"
              value="figma"
            />
          </RadioGroup>
        </div>

        <div className="border-t border-white/5" />

        {/* Section 3: Brand Voice */}
        <div className="scroll-mt-24">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Set your brand voice
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {TONE_SAMPLES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => {
                  setSelectedTone(tone.id);
                  setShowInference(true);
                }}
                className={`rounded-xl p-4 text-left transition-all border hover:scale-[1.02] ${
                  selectedTone === tone.id
                    ? "bg-brand-500/20 border-brand-500 ring-1 ring-brand-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedTone === tone.id ? "border-brand-500" : "border-white/30"
                    }`}
                  >
                    {selectedTone === tone.id && (
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white">{tone.name}</span>
                  <span className="text-xs text-white/40">{tone.description}</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{tone.sample}</p>
              </button>
            ))}
          </div>

          {/* Differentiators */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-white/60 mb-2">
              What makes your business different?
            </label>
            <Input
              type="text"
              value={differentiators}
              onChange={(e) => setDifferentiators(e.target.value)}
              placeholder={getDifferentiatorPlaceholder(industry)}
              inputSize="lg"
            />
          </div>

          {/* Advanced Section */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            <span className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>
              &#9654;
            </span>
            Advanced options
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 pl-4 border-l border-white/10">
              {/* Reference URLs */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">
                  Reference websites (optional)
                </label>
                {referenceUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => updateUrl(i, e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1"
                    />
                    {referenceUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(i)}
                        className="text-white/30 hover:text-white/60 text-sm"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                {referenceUrls.length < 3 && (
                  <button
                    type="button"
                    onClick={addUrlField}
                    className="text-xs text-brand-400 hover:text-brand-300"
                  >
                    + Add another URL
                  </button>
                )}
              </div>

              {/* Existing Copy */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">
                  Existing copy (optional)
                </label>
                <Textarea
                  value={existingCopy}
                  onChange={(e) => setExistingCopy(e.target.value.slice(0, 2000))}
                  placeholder="Paste existing marketing text..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-white/20 text-right mt-1">
                  {existingCopy.length}/2,000
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StepLayout>
  );
}
