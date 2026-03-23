"use client";

import {
  STEP_SECTIONS,
  getSectionForStep,
  ONBOARDING_STEPS,
  getStepIndex,
} from "@/lib/onboarding-steps";

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

  return (
    <>
      {/* Desktop: dots + labels + connectors */}
      <div className="hidden md:flex items-start justify-center w-full max-w-lg mx-auto">
        {STEP_SECTIONS.map((section, i) => {
          const isCompleted = i < sectionIndex;
          const isActive = i === sectionIndex;
          const isUpcoming = i > sectionIndex;

          return (
            <div key={section.name} className="flex items-start flex-1">
              {/* Section column */}
              <div className="flex flex-col items-center flex-1">
                {/* Label above dot */}
                <span
                  className={`text-xs font-medium mb-2 ${
                    isActive
                      ? "text-white"
                      : isCompleted
                        ? "text-white/60"
                        : "text-white/30"
                  }`}
                >
                  {section.name}
                </span>

                {/* Dot + connector row */}
                <div className="flex items-center w-full">
                  {/* Left connector (except first) */}
                  {i > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        i <= sectionIndex ? "bg-brand-500" : "bg-white/10"
                      }`}
                    />
                  )}

                  {/* Dot */}
                  <div className="relative flex items-center justify-center">
                    {isCompleted && (
                      <div className="w-3 h-3 rounded-full bg-brand-500" />
                    )}
                    {isActive && (
                      <>
                        <div className="w-3 h-3 rounded-full border-2 border-brand-400 bg-transparent" />
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                      </>
                    )}
                    {isUpcoming && (
                      <div className="w-3 h-3 rounded-full bg-white/20" />
                    )}
                  </div>

                  {/* Right connector (except last) */}
                  {i < STEP_SECTIONS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        i < sectionIndex ? "bg-brand-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>

                {/* Step fraction below active dot */}
                <span
                  className={`text-[10px] mt-1.5 ${
                    isActive ? "text-white/50" : "text-transparent"
                  }`}
                >
                  {isActive
                    ? `${stepIndexInSection + 1} of ${sectionStepCount}`
                    : "\u00A0"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: single-line label + progress bar */}
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
