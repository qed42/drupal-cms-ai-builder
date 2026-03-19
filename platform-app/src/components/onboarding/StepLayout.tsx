"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProgressDots from "./ProgressDots";
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
}

export default function StepLayout({
  step,
  title,
  subtitle,
  buttonLabel,
  onSubmit,
  disabled,
  children,
}: StepLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");
  const prevStep = getPrevStep(step);

  function buildStepUrl(slug: string) {
    const base = `/onboarding/${slug}`;
    return siteId ? `${base}?siteId=${siteId}` : base;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSubmit();
    if (ok) return; // onSubmit handles navigation
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-xl mx-auto px-6 text-center"
    >
      {/* Step-specific icon */}
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

      <div className="mt-12">
        <ProgressDots currentStep={step} />
      </div>
    </form>
  );
}
