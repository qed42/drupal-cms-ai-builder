"use client";

import { useEffect, useRef, useState } from "react";

interface ActivityLogPhase {
  key: string;
  label: string;
  status: "pending" | "in_progress" | "complete" | "failed";
  messages: string[];
}

interface ActivityLogProps {
  phases: ActivityLogPhase[];
  maxVisible?: number;
}

function BulletDot({ status }: { status: ActivityLogPhase["status"] }) {
  const color =
    status === "in_progress"
      ? "bg-brand-500"
      : status === "complete"
        ? "bg-emerald-400"
        : "bg-white/30";
  return <span className={`inline-block w-2 h-2 rounded-full ${color} shrink-0`} />;
}

export default function ActivityLog({ phases, maxVisible }: ActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  // Collect all messages with phase context
  const allEntries: { phase: ActivityLogPhase; message: string; index: number }[] = [];
  for (const phase of phases) {
    for (let i = 0; i < phase.messages.length; i++) {
      allEntries.push({ phase, message: phase.messages[i], index: allEntries.length });
    }
  }

  const totalCount = allEntries.length;
  const isCollapsed = maxVisible !== undefined && !showAll && totalCount > maxVisible;
  const visibleEntries = isCollapsed
    ? allEntries.slice(-maxVisible)
    : allEntries;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [totalCount]);

  if (totalCount === 0) {
    return (
      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.04] p-5">
        <p className="text-sm text-white/30 italic">Waiting for Archie to start...</p>
      </div>
    );
  }

  // Group visible entries by phase for rendering
  const groupedEntries: { phase: ActivityLogPhase; messages: string[] }[] = [];
  let currentGroup: typeof groupedEntries[number] | null = null;

  for (const entry of visibleEntries) {
    if (!currentGroup || currentGroup.phase.key !== entry.phase.key) {
      currentGroup = { phase: entry.phase, messages: [] };
      groupedEntries.push(currentGroup);
    }
    currentGroup.messages.push(entry.message);
  }

  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/[0.04] p-5" role="log" aria-live="polite" aria-label="Activity log">
      <div
        ref={scrollRef}
        className="max-h-[500px] overflow-y-auto scroll-smooth space-y-4 relative"
      >
        {groupedEntries.map((group) => (
          <div key={group.phase.key} className="space-y-1.5">
            {/* Phase header */}
            <div className="flex items-center gap-2">
              <BulletDot status={group.phase.status} />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                {group.phase.label}
              </span>
            </div>
            {/* Messages */}
            {group.messages.map((msg, i) => (
              <p
                key={`${group.phase.key}-${i}`}
                className="pl-4 text-sm text-white/50 italic animate-activity-fade-in motion-reduce:animate-none"
              >
                <span className="text-white/30 mr-1.5">&rarr;</span>
                {msg}
              </p>
            ))}
          </div>
        ))}

        {/* Bottom mask gradient for overflow indication */}
        <div className="sticky bottom-0 h-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Show all toggle for collapsed mode */}
      {maxVisible !== undefined && totalCount > maxVisible && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          {showAll ? "Show less" : `Show all ${totalCount} messages`}
        </button>
      )}
    </div>
  );
}
