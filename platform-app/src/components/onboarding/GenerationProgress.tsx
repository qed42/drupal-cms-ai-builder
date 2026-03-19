"use client";

const GENERATION_STEPS = [
  { key: "site_metadata", label: "Analyzing your vision...", icon: "sparkles" },
  { key: "page_layouts", label: "Designing page layouts...", icon: "layout" },
  { key: "content", label: "Writing content...", icon: "pen" },
  { key: "forms", label: "Setting up forms...", icon: "form" },
  { key: "provisioning", label: "Setting up your Drupal site...", icon: "rocket" },
  { key: "live", label: "Your website is live!", icon: "check" },
];

function StepIcon({ icon, active, done }: { icon: string; active: boolean; done: boolean }) {
  const iconMap: Record<string, string> = {
    sparkles: "\u2728",
    layout: "\ud83c\udfdb\ufe0f",
    pen: "\u270f\ufe0f",
    form: "\ud83d\udccb",
    rocket: "\ud83d\ude80",
    check: "\u2705",
  };

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
        done
          ? "bg-emerald-500/20 text-emerald-400"
          : active
            ? "bg-brand-500/30 text-white animate-pulse"
            : "bg-white/5 text-white/30"
      }`}
    >
      {done ? "\u2713" : iconMap[icon] || "\u25cb"}
    </div>
  );
}

interface GenerationProgressProps {
  currentStep: string;
  progress: number;
  error: string | null;
}

export default function GenerationProgress({
  currentStep,
  progress,
  error,
}: GenerationProgressProps) {
  const currentIndex = GENERATION_STEPS.findIndex((s) => s.key === currentStep);

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-3xl mx-auto">
          !
        </div>
        <h2 className="text-xl font-semibold text-white">Generation Failed</h2>
        <p className="text-white/60 text-sm max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Progress bar */}
      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-brand-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.max(progress, 5)}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {GENERATION_STEPS.map((step, i) => {
          const isDone = i < currentIndex || currentStep === "live";
          const isActive = i === currentIndex && currentStep !== "live";

          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-500 ${
                isActive
                  ? "bg-white/10 shadow-lg shadow-brand-500/10"
                  : isDone
                    ? "bg-white/5"
                    : "opacity-40"
              }`}
            >
              <StepIcon icon={step.icon} active={isActive} done={isDone} />
              <span
                className={`text-sm font-medium transition-colors duration-500 ${
                  isDone
                    ? "text-emerald-400"
                    : isActive
                      ? "text-white"
                      : "text-white/40"
                }`}
              >
                {step.label}
              </span>
              {isActive && (
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-brand-400"
                      style={{
                        animation: `pulse 1.4s ease-in-out ${d * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Percentage */}
      <p className="text-center text-white/40 text-sm">{progress}% complete</p>
    </div>
  );
}
