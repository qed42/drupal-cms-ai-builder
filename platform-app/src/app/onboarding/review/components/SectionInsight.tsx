"use client";

import { useRef, useEffect, useCallback } from "react";

interface SectionInsightProps {
  contentBrief?: string;
  targetKeywords?: string[];
  imageQuery?: string;
  toneGuidance?: string;
  audiencePainPoints?: string[];
  isEdited?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function SectionInsight({
  contentBrief,
  targetKeywords,
  imageQuery,
  toneGuidance,
  audiencePainPoints,
  isEdited,
  isOpen,
  onClose,
}: SectionInsightProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.show();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      const dialog = dialogRef.current;
      if (dialog && !dialog.contains(e.target as Node)) {
        onClose();
      }
    }

    // Delay to avoid closing on the same click that opened
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  const hasContent = contentBrief || targetKeywords?.length || imageQuery || toneGuidance;

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={onClose}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
        title="Why this content?"
      >
        ?
      </button>

      <dialog
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        className="absolute right-0 top-8 z-50 w-72 rounded-xl border border-white/10 bg-slate-800 shadow-xl p-0 m-0"
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white/70">AI Reasoning</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-white/30 hover:text-white/60 text-xs"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {isEdited && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-400">You&apos;ve customized this section</span>
            </div>
          )}

          {!hasContent && (
            <p className="text-xs text-white/30">No insight data available for this section.</p>
          )}

          {toneGuidance && (
            <div>
              <p className="text-[10px] text-white/30 mb-1">Based on</p>
              <p className="text-xs text-white/50">Tone: {toneGuidance}</p>
              {audiencePainPoints && audiencePainPoints.length > 0 && (
                <p className="text-xs text-white/50 mt-0.5">
                  Addressing: {audiencePainPoints.slice(0, 2).join(", ")}
                </p>
              )}
            </div>
          )}

          {contentBrief && (
            <div>
              <p className="text-[10px] text-white/30 mb-1">Content brief</p>
              <p className="text-xs text-white/50 leading-relaxed">{contentBrief}</p>
            </div>
          )}

          {targetKeywords && targetKeywords.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 mb-1">Target keywords</p>
              <div className="flex flex-wrap gap-1">
                {targetKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-1.5 py-0.5 rounded bg-brand-500/10 text-[10px] text-brand-400/70"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {imageQuery && (
            <div>
              <p className="text-[10px] text-white/30 mb-1">Image search</p>
              <p className="text-xs text-white/50 italic">Searched: &ldquo;{imageQuery}&rdquo;</p>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
