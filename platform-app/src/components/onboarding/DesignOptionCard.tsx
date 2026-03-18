"use client";

interface DesignOptionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  badge?: string;
  onSelect: () => void;
}

export default function DesignOptionCard({
  title,
  subtitle,
  icon,
  selected,
  disabled,
  badge,
  onSelect,
}: DesignOptionCardProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all w-full ${
        disabled
          ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
          : selected
          ? "border-indigo-500 bg-indigo-500/10"
          : "border-white/10 bg-white/5 hover:border-white/30 cursor-pointer"
      }`}
    >
      {badge && (
        <span className="absolute top-3 right-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50 uppercase tracking-wide">
          {badge}
        </span>
      )}
      <div className="text-3xl">{icon}</div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
      <p className="text-white/50 text-sm">{subtitle}</p>
      {selected && !disabled && (
        <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
