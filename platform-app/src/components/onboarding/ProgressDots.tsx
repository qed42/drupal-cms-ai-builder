"use client";

import { ONBOARDING_STEPS, getStepIndex } from "@/lib/onboarding-steps";

export default function ProgressDots({ currentStep }: { currentStep: string }) {
  const currentIndex = getStepIndex(currentStep);
  const total = ONBOARDING_STEPS.length;
  const currentLabel = ONBOARDING_STEPS[currentIndex]?.label || "";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Step label */}
      <p className="text-xs text-white/40 tracking-wide">
        Step {currentIndex + 1} of {total} &mdash; {currentLabel}
      </p>

      {/* Segmented progress bar */}
      <div className="flex items-center gap-1">
        {ONBOARDING_STEPS.map((step, i) => (
          <div
            key={step.slug}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-8 bg-brand-500"
                : i < currentIndex
                ? "w-4 bg-brand-400/60"
                : "w-4 bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
