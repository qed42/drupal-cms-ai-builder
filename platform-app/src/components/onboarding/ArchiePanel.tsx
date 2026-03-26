"use client";

interface ArchiePanelProps {
  children: React.ReactNode;
  isEmpty: boolean;
  emptyStateText?: string;
}

export default function ArchiePanel({ children, isEmpty, emptyStateText }: ArchiePanelProps) {
  return (
    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 sticky top-12">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <div className="text-2xl mb-3" aria-hidden="true">
            &#10024;
          </div>
          <p className="text-sm text-white/30">
            {emptyStateText || "I\u2019ll share my thoughts as you type\u2026"}
          </p>
        </div>
      ) : (
        <div className="archie-content">
          <style>{`
            .archie-content {
              animation: archie-fade 200ms ease;
            }
            @keyframes archie-fade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @media (prefers-reduced-motion: reduce) {
              .archie-content { animation: none; }
            }
          `}</style>
          {children}
        </div>
      )}
    </div>
  );
}
