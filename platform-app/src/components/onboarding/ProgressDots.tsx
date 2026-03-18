"use client";

import { ONBOARDING_STEPS, getStepIndex } from "@/lib/onboarding-steps";

export default function ProgressDots({ currentStep }: { currentStep: string }) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="flex items-center gap-2">
      {ONBOARDING_STEPS.map((step, i) => (
        <div
          key={step.slug}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === currentIndex
              ? "w-8 bg-indigo-500"
              : i < currentIndex
              ? "w-2 bg-indigo-400/60"
              : "w-2 bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}
