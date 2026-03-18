"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GenerationProgress from "@/components/onboarding/GenerationProgress";

export default function ProgressPage() {
  const router = useRouter();
  const [step, setStep] = useState("pending");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/provision/status");
      if (!res.ok) return;
      const data = await res.json();

      setStep(data.generationStep);
      setProgress(data.progress);

      if (data.generationStep === "ready") {
        setDone(true);
      } else if (data.generationStep === "failed") {
        setError(data.error || "Blueprint generation failed. Please try again.");
      }
    } catch {
      // Silently retry on network errors
    }
  }, []);

  useEffect(() => {
    // Initial poll
    pollStatus();

    // Poll every 3 seconds until done or error
    const interval = setInterval(() => {
      if (!done && !error) {
        pollStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pollStatus, done, error]);

  async function handleRetry() {
    setError(null);
    setStep("pending");
    setProgress(0);
    setDone(false);

    const res = await fetch("/api/provision/generate-blueprint", {
      method: "POST",
    });
    if (!res.ok) {
      setError("Failed to restart generation. Please try again.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-xl mx-auto px-6 text-center">
      {/* Animated icon */}
      <div className="mb-8">
        {!done && !error && (
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto" />
        )}
        {done && (
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl mx-auto animate-bounce">
            &#x2705;
          </div>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        {done
          ? "Your blueprint is ready!"
          : error
            ? "Something went wrong"
            : "Building your site blueprint..."}
      </h1>

      <p className="text-white/60 text-lg mb-8 max-w-md">
        {done
          ? "We've designed your complete website. Head to your dashboard to see the details."
          : error
            ? "Don't worry, you can try again."
            : "Our AI is crafting your perfect website. This usually takes about 30 seconds."}
      </p>

      <div className="w-full mb-8">
        <GenerationProgress
          currentStep={step}
          progress={progress}
          error={error}
        />
      </div>

      <div className="flex items-center gap-4">
        {done && (
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full bg-white px-8 py-3 font-medium text-[#0a0a2e] transition-all hover:bg-white/90 flex items-center gap-2"
          >
            Continue to Dashboard
            <span className="text-lg">&rarr;</span>
          </button>
        )}

        {error && (
          <button
            onClick={handleRetry}
            className="rounded-full bg-white px-8 py-3 font-medium text-[#0a0a2e] transition-all hover:bg-white/90 flex items-center gap-2"
          >
            Try Again
            <span className="text-lg">&#x21bb;</span>
          </button>
        )}
      </div>
    </div>
  );
}
