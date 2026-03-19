"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepLayout from "@/components/onboarding/StepLayout";
import { TONE_SAMPLES } from "@/lib/onboarding/tone-samples";
import { getDifferentiatorPlaceholder } from "@/lib/onboarding/tone-samples";

export default function TonePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [selectedTone, setSelectedTone] = useState("");
  const [differentiators, setDifferentiators] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([""]);
  const [existingCopy, setExistingCopy] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [industry, setIndustry] = useState("_default");

  useEffect(() => {
    fetch("/api/onboarding/resume")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.industry) setIndustry(d.data.industry);
        if (d.data?.tone) setSelectedTone(d.data.tone);
        if (d.data?.differentiators) setDifferentiators(d.data.differentiators);
        if (d.data?.referenceUrls?.length) setReferenceUrls(d.data.referenceUrls);
        if (d.data?.existingCopy) setExistingCopy(d.data.existingCopy);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

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
    // Filter out empty URLs
    const cleanUrls = referenceUrls.filter((u) => u.trim() !== "");

    const res = await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "tone",
        data: {
          tone: selectedTone,
          differentiators,
          referenceUrls: cleanUrls,
          existingCopy: existingCopy || undefined,
          onboarding_complete: true,
        },
      }),
    });
    if (!res.ok) return false;

    // Trigger blueprint generation (final step)
    const genRes = await fetch("/api/provision/generate-blueprint", {
      method: "POST",
    });
    if (genRes.ok) {
      const genData = await genRes.json();
      router.push(`/onboarding/progress?siteId=${genData.siteId}`);
      return true;
    }
    return false;
  }

  if (!loaded) return null;

  return (
    <StepLayout
      step="tone"
      title="Set your brand voice"
      subtitle="Choose a writing tone and tell us what sets you apart."
      buttonLabel="Visualize my site"
      onSubmit={handleSubmit}
      disabled={!selectedTone}
    >
      <div className="space-y-8 text-left">
        {/* Tone Selection Cards */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Choose your writing tone
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TONE_SAMPLES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => setSelectedTone(tone.id)}
                className={`rounded-xl p-4 text-left transition-all border ${
                  selectedTone === tone.id
                    ? "bg-indigo-500/20 border-indigo-500 ring-1 ring-indigo-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedTone === tone.id
                        ? "border-indigo-500"
                        : "border-white/30"
                    }`}
                  >
                    {selectedTone === tone.id && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {tone.name}
                  </span>
                  <span className="text-xs text-white/40">
                    {tone.description}
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  {tone.sample}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Differentiators */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            What makes your business different from competitors?
          </label>
          <input
            type="text"
            value={differentiators}
            onChange={(e) => setDifferentiators(e.target.value)}
            placeholder={getDifferentiatorPlaceholder(industry)}
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Advanced Section (Collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            <span
              className={`transition-transform ${
                showAdvanced ? "rotate-90" : ""
              }`}
            >
              &#9654;
            </span>
            Advanced options
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 pl-4 border-l border-white/10">
              {/* Reference URLs */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Reference websites (optional)
                </label>
                <p className="text-xs text-white/30 mb-2">
                  Add up to 3 websites whose tone or content style you admire.
                </p>
                {referenceUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateUrl(i, e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:border-indigo-500 focus:outline-none"
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
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    + Add another URL
                  </button>
                )}
              </div>

              {/* Existing Copy */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Existing copy (optional)
                </label>
                <p className="text-xs text-white/30 mb-2">
                  Paste existing marketing text so the AI can match your voice.
                </p>
                <textarea
                  value={existingCopy}
                  onChange={(e) =>
                    setExistingCopy(e.target.value.slice(0, 2000))
                  }
                  placeholder="Paste existing website copy, brochure text, or marketing material..."
                  rows={4}
                  className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none"
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
