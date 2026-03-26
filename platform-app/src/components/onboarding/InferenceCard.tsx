"use client";

import { useEffect, useRef, useState } from "react";

export interface InferenceCardItem {
  label: string;
  value: string | string[];
  type?: "text" | "list";
}

interface InferenceCardProps {
  title?: string;
  items: InferenceCardItem[];
  explanation: string;
  onConfirm: () => void;
  onEdit: () => void;
  editLabel?: string;
  isLoading?: boolean;
  autoDismissMs?: number;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-hidden="true">
      <div className="h-3 w-24 bg-white/10 rounded" />
      <div className="space-y-2">
        <div className="h-3 w-48 bg-white/5 rounded" />
        <div className="h-3 w-36 bg-white/5 rounded" />
        <div className="h-3 w-40 bg-white/5 rounded" />
      </div>
      <div className="h-3 w-56 bg-white/5 rounded" />
    </div>
  );
}

export default function InferenceCard({
  title = "Archie understood",
  items,
  explanation,
  onConfirm,
  onEdit,
  editLabel = "Edit my description",
  isLoading = false,
  autoDismissMs = 30000,
}: InferenceCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading || autoDismissMs <= 0) return;

    timerRef.current = setTimeout(() => {
      setDismissed(true);
      onConfirm();
    }, autoDismissMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, autoDismissMs, onConfirm]);

  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      className="inference-card rounded-xl border border-brand-500/20 bg-white/5 p-4 text-left"
    >
      <style>{`
        .inference-card {
          animation: inference-enter 200ms ease;
        }
        @keyframes inference-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <h4 className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-2.5">
            {title}
          </h4>

          <div className="space-y-2 mb-3">
            {items.map((item, i) => (
              <div key={i} className="text-sm">
                <span className="text-white/40">{item.label}: </span>
                {item.type === "list" && Array.isArray(item.value) ? (
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {item.value.map((v, j) => (
                      <li key={j} className="text-white/70 text-xs list-disc">
                        {v}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-white/70">
                    {Array.isArray(item.value)
                      ? item.value.join(", ")
                      : item.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-white/30 mb-3">{explanation}</p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                setDismissed(true);
                onConfirm();
              }}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Looks right
            </button>
            <button
              type="button"
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                onEdit();
              }}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              {editLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
