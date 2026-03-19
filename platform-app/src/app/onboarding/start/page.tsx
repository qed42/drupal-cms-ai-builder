"use client";

import { useRouter } from "next/navigation";
import ProgressDots from "@/components/onboarding/ProgressDots";
import { useOnboarding } from "@/hooks/useOnboarding";
import { BRAND } from "@/lib/brand";

export default function StartPage() {
  const router = useRouter();
  const { buildStepUrl } = useOnboarding();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-6 text-center">
      {/* Product logo */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15 L8 7 L12 13 L16 5 L20 15" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </div>
        <span className="text-xl font-bold text-white">{BRAND.name}</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
        Your website, designed <br className="hidden md:block" />
        <span className="text-brand-400">and built by AI.</span>
      </h1>

      <p className="text-white/50 text-lg mb-4 max-w-lg">
        Answer a few questions about your business.
        We&apos;ll generate a complete, professional Drupal website
        with real content, brand colors, and stock images.
      </p>

      <p className="text-white/30 text-sm mb-10">
        Takes about 2 minutes &middot; No credit card required
      </p>

      <button
        onClick={() => router.push(buildStepUrl("name"))}
        className="rounded-full bg-brand-500 px-10 py-4 text-lg font-medium text-white transition-all hover:bg-brand-400 flex items-center gap-2 shadow-lg shadow-brand-500/25"
      >
        Start Building
        <span className="text-xl">&rarr;</span>
      </button>

      <div className="mt-14">
        <ProgressDots currentStep="start" />
      </div>
    </div>
  );
}
