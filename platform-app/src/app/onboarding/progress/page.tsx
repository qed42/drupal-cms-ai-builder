"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GenerationProgress from "@/components/onboarding/GenerationProgress";

export default function ProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");

  const [step, setStep] = useState("pending");
  const [siteStatus, setSiteStatus] = useState("generating");
  const [siteName, setSiteName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pollStatus = useCallback(async () => {
    try {
      const url = siteId
        ? `/api/provision/status?siteId=${siteId}`
        : "/api/provision/status";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      setStep(data.generationStep);
      setSiteStatus(data.siteStatus);
      setProgress(data.progress);
      if (data.siteName) setSiteName(data.siteName);

      if (data.siteStatus === "live") {
        setDone(true);
      } else if (
        data.generationStep === "failed" ||
        data.siteStatus === "provisioning_failed"
      ) {
        setError(
          data.error || "Something went wrong. Please try again."
        );
      }
    } catch {
      // Silently retry on network errors
    }
  }, [siteId]);

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
    const wasProvisioningFailure = siteStatus === "provisioning_failed";
    setError(null);
    setProgress(wasProvisioningFailure ? 55 : 0);
    setDone(false);

    if (wasProvisioningFailure) {
      // Retry provisioning only — blueprint is already ready.
      setSiteStatus("provisioning");
      setStep("provisioning");
      const res = await fetch("/api/provision/start", { method: "POST" });
      if (!res.ok) {
        setError("Failed to restart provisioning. Please try again.");
      }
    } else {
      // Retry full blueprint generation.
      setStep("pending");
      setSiteStatus("generating");
      const res = await fetch("/api/provision/generate-blueprint", {
        method: "POST",
      });
      if (!res.ok) {
        setError("Failed to restart generation. Please try again.");
      }
    }
  }

  function getHeading(): string {
    const name = siteName || "your site";
    if (done) return `${siteName || "Your website"} is live!`;
    if (error) return "Something went wrong";
    if (siteStatus === "provisioning") return `Setting up ${name}...`;
    return `Building ${name} blueprint...`;
  }

  function getSubheading(): string {
    if (done) return "Your Drupal CMS website is ready. Head to your dashboard to manage and edit it.";
    if (error) return "Don't worry, you can try again.";
    if (siteStatus === "provisioning") return "Installing Drupal CMS, applying your design, and importing content. Almost there!";
    return "Our AI is crafting your perfect website. This usually takes about 30 seconds.";
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
        {getHeading()}
      </h1>

      <p className="text-white/60 text-lg mb-8 max-w-md">
        {getSubheading()}
      </p>

      <div className="w-full mb-8">
        <GenerationProgress
          currentStep={siteStatus === "provisioning" ? "provisioning" : step}
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
