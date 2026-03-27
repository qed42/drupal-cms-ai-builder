/**
 * Loading skeleton for the StrategyPreview panel.
 * Server-compatible (no "use client" needed) — pure presentation.
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function StrategyPreviewSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {/* Page Strategy skeleton */}
      <div>
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />
          ))}
        </div>
      </div>

      {/* Content Approach skeleton */}
      <div>
        <Skeleton className="h-3 w-32 mb-3" />
        <Skeleton className="h-4 w-48 bg-white/5 mb-2" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full bg-white/5" />
          <Skeleton className="h-3 w-3/4 bg-white/5" />
        </div>
      </div>

      {/* SEO Keywords skeleton */}
      <div>
        <Skeleton className="h-3 w-20 mb-3" />
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full bg-white/5" />
          ))}
        </div>
      </div>

      {/* Competitive Positioning skeleton */}
      <div>
        <Skeleton className="h-3 w-40 mb-3" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full bg-white/5" />
          <Skeleton className="h-3 w-5/6 bg-white/5" />
        </div>
      </div>
    </div>
  );
}
