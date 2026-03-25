"use client";

import { useRef, useEffect } from "react";
import { useResearchPreview } from "@/hooks/useResearchPreview";
import StrategyPreviewSkeleton from "./StrategyPreviewSkeleton";
import type { ResearchPreview } from "@/lib/transparency/types";

interface StrategyPreviewProps {
  siteId: string;
}

function PageStrategyGrid({ pages }: { pages: ResearchPreview["pageStrategy"] }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
        Page Strategy
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pages.map((page) => (
          <div
            key={page.slug}
            className="rounded-lg bg-white/5 px-3 py-2.5 border border-white/5"
          >
            <div className="text-sm font-medium text-white/80">{page.title}</div>
            <div className="text-xs text-white/40 mt-0.5 line-clamp-2">
              {page.purpose}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentApproach({
  tone,
}: {
  tone: ResearchPreview["toneGuidance"];
}) {
  return (
    <div>
      <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
        Content Approach
      </h4>
      <div className="text-sm text-white/70 mb-1.5">
        Tone: <span className="text-white/90 font-medium">{tone.primary}</span>
      </div>
      {tone.examples.length > 0 && (
        <div className="space-y-1">
          {tone.examples.slice(0, 2).map((example, i) => (
            <p key={i} className="text-xs text-white/40 italic pl-3 border-l border-white/10">
              &ldquo;{example}&rdquo;
            </p>
          ))}
        </div>
      )}
      {tone.avoid.length > 0 && (
        <div className="mt-2 text-xs text-white/30">
          Avoid: {tone.avoid.join(", ")}
        </div>
      )}
    </div>
  );
}

function SeoKeywords({ keywords }: { keywords: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
        SEO Focus
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((kw, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/60"
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

function CompetitivePositioning({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
        Competitive Positioning
      </h4>
      <ul className="space-y-1.5">
        {points.slice(0, 3).map((point, i) => (
          <li key={i} className="text-xs text-white/50 flex gap-2">
            <span className="text-white/20 shrink-0">&bull;</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StrategyPreview({ siteId }: StrategyPreviewProps) {
  const { preview, status } = useResearchPreview(siteId);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Set initial open state based on viewport width
  useEffect(() => {
    if (detailsRef.current) {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      detailsRef.current.open = isDesktop;
    }
  }, []);

  if (status === "error") {
    return (
      <div className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 mb-6">
        <p className="text-xs text-white/30">
          Preview unavailable — your site will still generate correctly.
        </p>
      </div>
    );
  }

  return (
    <details
      ref={detailsRef}
      className="w-full rounded-xl border border-white/10 bg-white/5 mb-6 group"
      aria-busy={status === "loading"}
    >
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
        <span className="text-sm font-medium text-white/70">
          AI Strategy Preview
          {status === "loading" && (
            <span className="ml-2 text-white/30 text-xs font-normal">
              analyzing...
            </span>
          )}
        </span>
        <svg
          className="w-4 h-4 text-white/30 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="px-5 pb-5 space-y-5">
        {status === "loading" && <StrategyPreviewSkeleton />}

        {status === "loaded" && preview && (
          <>
            <PageStrategyGrid pages={preview.pageStrategy} />
            <ContentApproach tone={preview.toneGuidance} />
            <SeoKeywords keywords={preview.seoKeywords} />
            <CompetitivePositioning points={preview.competitivePositioning} />
          </>
        )}
      </div>
    </details>
  );
}
