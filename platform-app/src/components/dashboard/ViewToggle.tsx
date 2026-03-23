"use client";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
      <button
        onClick={() => onChange("grid")}
        className={`p-1.5 rounded-md transition-colors ${
          mode === "grid"
            ? "bg-white/10 text-white"
            : "text-white/40 hover:text-white/60"
        }`}
        aria-label="Grid view"
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        onClick={() => onChange("list")}
        className={`p-1.5 rounded-md transition-colors ${
          mode === "list"
            ? "bg-white/10 text-white"
            : "text-white/40 hover:text-white/60"
        }`}
        aria-label="List view"
        title="List view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export type { ViewMode };
