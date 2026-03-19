"use client";

import { useState } from "react";

interface PhaseStatus {
  status: "pending" | "in_progress" | "complete" | "failed";
  durationMs?: number;
  summary?: string;
  error?: string;
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

function PhaseCard({ phase, status }: { phase: typeof PHASES[number]; status: PhaseStatus }) {
  const [expanded, setExpanded] = useState(false);
  const hasSummary = status.summary || status.error;

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
          <p className="text-xs text-white/40 truncate">
            {status.status === "in_progress" && status.summary
              ? status.summary
              : phase.description}
          </p>
        </div>
        {hasSummary && status.status !== "in_progress" && (
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

      {expanded && hasSummary && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {status.error && (
            <p className="text-xs text-red-400">{status.error}</p>
          )}
          {status.summary && !status.error && (
            <p className="text-xs text-white/50">{status.summary}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PipelineProgress({ pipeline, progress, error }: PipelineProgressProps) {
  return (
    <div className="w-full space-y-3" role="status" aria-live="polite" aria-label="Content generation progress">
      {/* Overall progress bar */}
      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
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
