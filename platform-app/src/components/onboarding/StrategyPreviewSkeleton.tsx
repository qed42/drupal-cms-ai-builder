/**
 * Loading skeleton for the StrategyPreview panel.
 * Server-compatible (no "use client" needed) — pure presentation.
 */
export default function StrategyPreviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      {/* Page Strategy skeleton */}
      <div>
        <div className="h-3 w-24 bg-white/10 rounded mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Content Approach skeleton */}
      <div>
        <div className="h-3 w-32 bg-white/10 rounded mb-3" />
        <div className="h-4 w-48 bg-white/5 rounded mb-2" />
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-3/4 bg-white/5 rounded" />
        </div>
      </div>

      {/* SEO Keywords skeleton */}
      <div>
        <div className="h-3 w-20 bg-white/10 rounded mb-3" />
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 w-20 bg-white/5 rounded-full" />
          ))}
        </div>
      </div>

      {/* Competitive Positioning skeleton */}
      <div>
        <div className="h-3 w-40 bg-white/10 rounded mb-3" />
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-5/6 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}
