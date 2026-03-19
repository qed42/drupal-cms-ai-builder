"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PipelineProgress from "@/components/onboarding/PipelineProgress";
import { downloadBlueprint } from "@/lib/download";

interface PhaseStatus {
  status: "pending" | "in_progress" | "complete" | "failed";
  durationMs?: number;
  summary?: string;
  error?: string;
}

interface PipelineData {
  research: PhaseStatus;
  plan: PhaseStatus;
  generate: PhaseStatus;
  enhance?: PhaseStatus;
}

const DEFAULT_PIPELINE: PipelineData = {
  research: { status: "pending" },
  plan: { status: "pending" },
  generate: { status: "pending" },
  enhance: { status: "pending" },
};

export default function ProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");

  const [siteStatus, setSiteStatus] = useState("generating");
  const [siteName, setSiteName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [pipeline, setPipeline] = useState<PipelineData>(DEFAULT_PIPELINE);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const blueprintReady = siteStatus === "review" || siteStatus === "provisioning" || siteStatus === "live" || siteStatus === "provisioning_failed";

  async function handleDownload() {
    if (!siteId) return;
    setDownloadLoading(true);
    try {
      await downloadBlueprint(siteId, siteName || "site");
    } catch (err) {
      console.error("Error downloading blueprint:", err);
    } finally {
      setDownloadLoading(false);
    }
  }

  const pollStatus = useCallback(async () => {
    try {
      const url = siteId
        ? `/api/provision/status?siteId=${siteId}`
        : "/api/provision/status";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      setSiteStatus(data.siteStatus);
      setProgress(data.progress);
      if (data.siteName) setSiteName(data.siteName);

      // Update pipeline phases if available
      if (data.pipeline) {
        setPipeline(data.pipeline);
      }

      if (data.siteStatus === "review" || data.siteStatus === "blueprint_ready" || data.siteStatus === "live") {
        setDone(true);
      } else if (
        data.pipelinePhase?.includes("failed") ||
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
    pollStatus();

    // Poll every 2 seconds until done or error
    const interval = setInterval(() => {
      if (!done && !error) {
        pollStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pollStatus, done, error]);

  async function handleRetry() {
    setError(null);
    setProgress(0);
    setDone(false);
    setPipeline(DEFAULT_PIPELINE);
    setSiteStatus("generating");

    const res = await fetch("/api/provision/generate-blueprint", {
      method: "POST",
    });
    if (!res.ok) {
      setError("Failed to restart generation. Please try again.");
    }
  }

  // Extract page names from the generate phase summary if available
  const pageNames: string[] = [];
  if (done && pipeline.generate?.summary) {
    const match = pipeline.generate.summary.match(/pages?:\s*(.+)/i);
    if (match) {
      pageNames.push(...match[1].split(",").map((s) => s.trim()).filter(Boolean));
    }
  }

  function getHeading(): string {
    if (done) return `${siteName || "Your website"} is ready!`;
    if (error) return "Something went wrong";
    return `Building ${siteName || "your site"}...`;
  }

  function getSubheading(): string {
    if (done) return "Review your generated content, make any edits, then approve to launch your site.";
    if (error) return "Your data is safe. You can try again.";
    return "This usually takes 2-3 minutes. You can stay on this page or come back later.";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-xl mx-auto px-6 text-center">
      {/* Animated icon */}
      <div className="mb-8">
        {!done && !error && (
          <div className="w-16 h-16 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin mx-auto" />
        )}
        {done && (
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {error && (
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
          </div>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        {getHeading()}
      </h1>

      <p className="text-white/60 text-lg mb-8 max-w-md">
        {getSubheading()}
      </p>

      {/* Pipeline progress */}
      <div className="w-full mb-8">
        <PipelineProgress
          pipeline={pipeline}
          progress={progress}
          error={error}
        />
      </div>

      {/* Completion summary — what was generated */}
      {done && pageNames.length > 0 && (
        <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-6">
          <p className="text-sm text-emerald-400 font-medium mb-2">
            {pageNames.length} page{pageNames.length !== 1 ? "s" : ""} generated
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pageNames.map((name, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-white/60">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {done && siteStatus === "review" && siteId && (
          <button
            onClick={() => router.push(`/onboarding/review?siteId=${siteId}`)}
            className="rounded-full bg-brand-500 px-8 py-3 font-medium text-white transition-all hover:bg-brand-400 flex items-center gap-2 shadow-lg shadow-brand-500/25"
          >
            Review Your Website
            <span className="text-lg">&rarr;</span>
          </button>
        )}

        {done && siteStatus !== "review" && (
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full bg-brand-500 px-8 py-3 font-medium text-white transition-all hover:bg-brand-400 flex items-center gap-2"
          >
            Continue to Dashboard
            <span className="text-lg">&rarr;</span>
          </button>
        )}

        {error && (
          <button
            onClick={handleRetry}
            className="rounded-full bg-white px-8 py-3 font-medium text-slate-900 transition-all hover:bg-white/90 flex items-center gap-2"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
