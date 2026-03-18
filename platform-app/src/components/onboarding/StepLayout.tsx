"use client";

import { useRouter } from "next/navigation";
import ProgressDots from "./ProgressDots";
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
  const prevStep = getPrevStep(step);

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
      {/* Animated icon */}
      <div className="mb-8 flex gap-1 items-end">
        {[20, 32, 24, 36, 28].map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-purple-400"
            style={{
              height: h,
              animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
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
            onClick={() => router.push(`/onboarding/${prevStep}`)}
            className="rounded-full px-6 py-3 text-white/60 hover:text-white transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full bg-white px-8 py-3 font-medium text-[#0a0a2e] transition-all hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
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
