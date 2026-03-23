"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProgressStepper from "./ProgressStepper";
import StepIcon from "./StepIcon";
import { getPrevStep } from "@/lib/onboarding-steps";

interface StepLayoutProps {
  step: string;
  title: string;
  subtitle?: string;
  buttonLabel: string;
  onSubmit: () => Promise<boolean>;
  disabled?: boolean;
  children: React.ReactNode;
  layoutMode?: "centered" | "split" | "summary";
  previewSlot?: React.ReactNode;
  insightSlot?: React.ReactNode;
}

export default function StepLayout({
  step,
  title,
  subtitle,
  buttonLabel,
  onSubmit,
  disabled,
  children,
  layoutMode,
  previewSlot,
  insightSlot,
}: StepLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");
  const prevStep = getPrevStep(step);

  // Auto-detect layout mode if not explicitly set
  const mode = layoutMode ?? (previewSlot ? "split" : "centered");

  function buildStepUrl(slug: string) {
    const base = `/onboarding/${slug}`;
    return siteId ? `${base}?siteId=${siteId}` : base;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSubmit();
    if (ok) return; // onSubmit handles navigation
  }

  const navigationButtons = (
    <div className="flex items-center gap-4">
      {prevStep && (
        <button
          type="button"
          onClick={() => router.push(buildStepUrl(prevStep))}
          className="rounded-full px-6 py-3 text-white/60 hover:text-white transition-colors"
        >
          Back
        </button>
      )}
      <button
        type="submit"
        disabled={disabled}
        className="rounded-full bg-white px-8 py-3 font-medium text-slate-900 transition-all hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {buttonLabel}
        <span className="text-lg">&rarr;</span>
      </button>
    </div>
  );

  if (mode === "summary") {
    return (
      <form onSubmit={handleSubmit} className="w-full px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <StepIcon step={step} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/60 text-lg max-w-md mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          <div className="w-full mb-8">{children}</div>

          <div className="flex justify-center">{navigationButtons}</div>

          <div className="mt-12 flex justify-center">
            <ProgressStepper currentStep={step} />
          </div>
        </div>
      </form>
    );
  }

  if (mode === "split") {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full min-h-[60vh] px-6 py-12"
      >
        {/* Desktop: 45/55 split grid */}
        <div className="hidden lg:grid grid-cols-[45fr_55fr] gap-8 max-w-6xl mx-auto">
          {/* Left column: form */}
          <div className="flex flex-col">
            <div className="mb-6">
              <StepIcon step={step} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 text-left">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/60 text-lg mb-8 text-left">
                {subtitle}
              </p>
            )}
            <div className="w-full mb-6">{children}</div>
            {insightSlot && <div className="mb-6">{insightSlot}</div>}
            <div>{navigationButtons}</div>
            <div className="mt-12">
              <ProgressStepper currentStep={step} />
            </div>
          </div>

          {/* Right column: preview */}
          <div className="flex items-start justify-center pt-8">
            {previewSlot}
          </div>
        </div>

        {/* Mobile: single column, preview hidden */}
        <div className="flex lg:hidden flex-col items-center justify-center w-full max-w-xl mx-auto text-center">
          <div className="mb-6">
            <StepIcon step={step} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/60 text-lg mb-8 max-w-md">{subtitle}</p>
          )}
          <div className="w-full mb-8">{children}</div>
          {insightSlot && <div className="mb-6">{insightSlot}</div>}
          <div>{navigationButtons}</div>
          <div className="mt-12">
            <ProgressStepper currentStep={step} />
          </div>
        </div>
      </form>
    );
  }

  // Default: centered mode
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-xl mx-auto px-6 py-12 text-center"
    >
      <div className="mb-6">
        <StepIcon step={step} />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        {title}
      </h1>

      {subtitle && (
        <p className="text-white/60 text-lg mb-8 max-w-md">{subtitle}</p>
      )}

      <div className="w-full mb-8">{children}</div>

      {insightSlot && <div className="mb-6">{insightSlot}</div>}

      {navigationButtons}

      <div className="mt-12">
        <ProgressStepper currentStep={step} />
      </div>
    </form>
  );
}
