"use client";

import { memo, useState } from "react";

interface PhaseStatus {
  status: "pending" | "in_progress" | "complete" | "failed";
  durationMs?: number;
  summary?: string;
  error?: string;
  messages?: string[];
  artifacts?: Record<string, unknown>;
}

interface PipelineProgressProps {
  pipeline: {
    research: PhaseStatus;
    plan: PhaseStatus;
    generate: PhaseStatus;
    enhance?: PhaseStatus;
  };
  progress: number;
  error: string | null;
}

const PHASES = [
  { key: "research" as const, label: "Analyzing your business", description: "Learning about your industry, audience, and competitors" },
  { key: "plan" as const, label: "Designing your pages", description: "Creating layouts and content strategy for each page" },
  { key: "generate" as const, label: "Writing your content", description: "Generating text, headings, and calls to action" },
  { key: "enhance" as const, label: "Adding images", description: "Finding and placing relevant photos for your site" },
];

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

function StatusIcon({ status }: { status: PhaseStatus["status"] }) {
  switch (status) {
    case "complete":
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case "in_progress":
      return (
        <div className="w-8 h-8 rounded-full border-2 border-brand-500/40 border-t-brand-500 animate-spin shrink-0" />
      );
    case "failed":
      return (
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0" />
      );
  }
}

/** Pill component for artifact data display */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 text-xs text-white/60">
      {children}
    </span>
  );
}

/** Render artifact data specific to each phase */
function PhaseArtifacts({ phaseKey, status }: { phaseKey: string; status: PhaseStatus }) {
  const artifacts = status.artifacts;
  if (!artifacts) return null;

  if (phaseKey === "research" && status.status === "complete") {
    const industry = artifacts.industry as string | undefined;
    const services = artifacts.services as string[] | undefined;
    const flags = artifacts.complianceFlags as string[] | undefined;
    if (!industry && !services?.length) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-1.5 animate-activity-fade-in motion-reduce:animate-none">
        {industry && <Pill>{industry}</Pill>}
        {services?.map((s) => <Pill key={s}>{s}</Pill>)}
        {flags?.map((f) => <Pill key={f}>{f}</Pill>)}
      </div>
    );
  }

  if (phaseKey === "plan" && status.status === "complete") {
    const pages = artifacts.pages as string[] | undefined;
    if (!pages?.length) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-1.5 animate-activity-fade-in motion-reduce:animate-none">
        {pages.map((p) => <Pill key={p}>{p}</Pill>)}
      </div>
    );
  }

  if (phaseKey === "generate" && status.status === "in_progress") {
    const currentPage = artifacts.currentPage as string | undefined;
    const currentPageIndex = artifacts.currentPageIndex as number | undefined;
    const totalPages = artifacts.totalPages as number | undefined;
    const contentPreview = artifacts.contentPreview as string | undefined;
    if (!currentPage) return null;
    return (
      <div className="mt-2 space-y-1.5 animate-activity-fade-in motion-reduce:animate-none">
        {totalPages !== undefined && currentPageIndex !== undefined && (
          <p className="text-xs text-white/50">
            Page {currentPageIndex + 1} of {totalPages}: {currentPage}
          </p>
        )}
        {contentPreview && (
          <div className="border-l-2 border-brand-500/30 pl-3">
            <p className="text-sm text-white/50 italic font-serif line-clamp-3">
              {contentPreview}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (phaseKey === "generate" && status.status === "complete") {
    const pages = artifacts.pages as string[] | undefined;
    // Fall through to plan-style pills if pages artifact available from plan
    if (pages?.length) {
      return (
        <div className="mt-2 flex flex-wrap gap-1.5 animate-activity-fade-in motion-reduce:animate-none">
          {pages.map((p) => <Pill key={p}>{p}</Pill>)}
        </div>
      );
    }
    return null;
  }

  if (phaseKey === "enhance") {
    const imagesPlaced = artifacts.imagesPlaced as number | undefined;
    const imagesTotal = artifacts.imagesTotal as number | undefined;
    const userImagesMatched = artifacts.userImagesMatched as number | undefined;
    if (imagesPlaced === undefined) return null;
    return (
      <div className="mt-2 animate-activity-fade-in motion-reduce:animate-none">
        <p className="text-xs text-white/50">
          {imagesPlaced} of {imagesTotal ?? "?"} images placed
          {userImagesMatched !== undefined && userImagesMatched > 0 && ` · ${userImagesMatched} user photos matched`}
        </p>
      </div>
    );
  }

  return null;
}

/**
 * PhaseCard with React.memo to avoid re-renders when only durationMs ticks during polling.
 * Compares status, summary, error, and artifacts — skips re-render for durationMs-only changes.
 */
const PhaseCard = memo(function PhaseCard({ phase, status }: { phase: typeof PHASES[number]; status: PhaseStatus }) {
  const [expanded, setExpanded] = useState(false);

  // For completed phases with summaries, show the summary as the description line
  const descriptionText = (() => {
    if (status.status === "in_progress" && status.summary) return status.summary;
    if (status.status === "complete" && status.summary) return status.summary;
    return phase.description;
  })();

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        status.status === "in_progress"
          ? "border-brand-500/50 bg-brand-500/5"
          : status.status === "complete"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : status.status === "failed"
              ? "border-red-500/30 bg-red-500/5"
              : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <StatusIcon status={status.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{phase.label}</span>
            {status.durationMs !== undefined && status.status === "complete" && (
              <span className="text-xs text-white/30">{formatDuration(status.durationMs)}</span>
            )}
          </div>
          <p className="text-xs text-white/40">
            {descriptionText}
          </p>
        </div>
        {status.status === "failed" && status.error && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-white/30 hover:text-white/60 text-xs shrink-0"
            aria-expanded={expanded}
          >
            {expanded ? "Hide" : "Details"}
          </button>
        )}
      </div>

      {/* Artifact display */}
      <PhaseArtifacts phaseKey={phase.key} status={status} />

      {expanded && status.error && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-red-400">{status.error}</p>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // Custom comparator: re-render when status, summary, error, or artifacts change
  return (
    prev.status.status === next.status.status &&
    prev.status.summary === next.status.summary &&
    prev.status.error === next.status.error &&
    JSON.stringify(prev.status.artifacts) === JSON.stringify(next.status.artifacts)
  );
});

export default function PipelineProgress({ pipeline, progress, error }: PipelineProgressProps) {
  const allComplete = pipeline.research.status === "complete" &&
    pipeline.plan.status === "complete" &&
    pipeline.generate.status === "complete" &&
    (!pipeline.enhance || pipeline.enhance.status === "complete");
  const hasFailure = error !== null;
  const barColor = hasFailure ? "bg-red-500" : allComplete ? "bg-emerald-500" : "bg-brand-500";

  return (
    <div className="w-full space-y-3" role="status" aria-live="polite" aria-label="Content generation progress">
      {/* Overall progress bar */}
      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>

      {/* Phase cards */}
      <div className="space-y-2">
        {PHASES.map((phase) => {
          const status = pipeline[phase.key];
          if (!status) return null;
          return <PhaseCard key={phase.key} phase={phase} status={status} />;
        })}
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="assertive">
        {error
          ? `Error: ${error}`
          : pipeline.generate.status === "complete"
            ? "All content generated successfully"
            : pipeline.generate.status === "in_progress" && pipeline.generate.summary
              ? pipeline.generate.summary
              : pipeline.plan.status === "in_progress"
                ? "Creating content plan"
                : pipeline.research.status === "in_progress"
                  ? "Researching your business"
                  : `Progress: ${progress}%`}
      </div>
    </div>
  );
}
