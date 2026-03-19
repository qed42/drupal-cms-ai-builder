"use client";

interface PageChipProps {
  title: string;
  onRemove: () => void;
  removable: boolean;
}

export default function PageChip({ title, onRemove, removable }: PageChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/80 px-4 py-2 text-sm font-medium text-white">
      {title}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full hover:bg-white/20 w-5 h-5 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label={`Remove ${title}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
