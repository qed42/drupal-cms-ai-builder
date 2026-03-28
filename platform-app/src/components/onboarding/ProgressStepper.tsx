"use client";

import {
  STEP_SECTIONS,
  getSectionForStep,
  ONBOARDING_STEPS,
  getStepIndex,
} from "@/lib/onboarding-steps";

function Dot({ state }: { state: "completed" | "active" | "upcoming" }) {
  if (state === "completed") {
    return <div className="w-3 h-3 rounded-full bg-brand-500 shrink-0" />;
  }
  if (state === "active") {
    return (
      <div className="relative w-3 h-3 shrink-0">
        <div className="w-3 h-3 rounded-full border-2 border-brand-400 bg-transparent" />
        <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
      </div>
    );
  }
  return <div className="w-3 h-3 rounded-full bg-white/20 shrink-0" />;
}

export default function ProgressStepper({
  currentStep,
}: {
  currentStep: string;
}) {
  const sectionInfo = getSectionForStep(currentStep);
  const currentGlobalIndex = getStepIndex(currentStep);
  const totalSteps = ONBOARDING_STEPS.length;

  if (!sectionInfo) return null;

  const { sectionIndex, stepIndexInSection, sectionStepCount } = sectionInfo;

  // Build flat array of elements: [dot, connector, dot, connector, dot, connector, dot]
  const dotElements: React.ReactNode[] = [];
  STEP_SECTIONS.forEach((_, i) => {
    if (i > 0) {
      dotElements.push(
        <div
          key={`c-${i}`}
          className={`h-0.5 flex-1 ${
            i <= sectionIndex ? "bg-brand-500" : "bg-white/10"
          }`}
        />
      );
    }
    const state = i < sectionIndex ? "completed" : i === sectionIndex ? "active" : "upcoming";
    dotElements.push(<Dot key={`d-${i}`} state={state} />);
  });

  return (
    <>
      {/* Desktop: dots + connectors, then labels underneath */}
      <div className="hidden md:block w-full max-w-md mx-auto">
        {/* Dots row */}
        <div className="flex items-center w-full px-6">
          {dotElements}
        </div>

        {/* Labels row — evenly spaced to sit under each dot */}
        <div className="grid mt-2.5" style={{ gridTemplateColumns: `repeat(${STEP_SECTIONS.length}, 1fr)` }}>
          {STEP_SECTIONS.map((section, i) => {
            const isCompleted = i < sectionIndex;
            const isActive = i === sectionIndex;

            return (
              <div key={section.name} className="flex flex-col items-center text-center">
                <span
                  className={`text-[11px] font-medium leading-none ${
                    isActive
                      ? "text-white"
                      : isCompleted
                        ? "text-white/60"
                        : "text-white/30"
                  }`}
                >
                  {section.name}
                </span>
                {isActive && (
                  <span className="text-[10px] text-white/40 mt-1">
                    {stepIndexInSection + 1} of {sectionStepCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: label + progress bar */}
      <div className="flex md:hidden flex-col items-center gap-2 w-full max-w-xs mx-auto">
        <p className="text-xs text-white/50">
          {sectionInfo.sectionName} &middot; Step {stepIndexInSection + 1} of{" "}
          {sectionStepCount}
        </p>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{
              width: `${((currentGlobalIndex + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>
    </>
  );
}
