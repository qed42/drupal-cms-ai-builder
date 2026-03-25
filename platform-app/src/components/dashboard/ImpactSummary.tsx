interface ImpactSummaryProps {
  bullets: string[];
}

export default function ImpactSummary({ bullets }: ImpactSummaryProps) {
  if (bullets.length === 0) return null;

  return (
    <div className="pt-3 border-t border-white/5">
      <p className="text-xs text-zinc-400 mb-2">Your inputs shaped:</p>
      <ul className="space-y-1" aria-label="How AI used your inputs">
        {bullets.map((bullet, i) => (
          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
            <span className="text-brand-400/50 mt-0.5 shrink-0">&bull;</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
