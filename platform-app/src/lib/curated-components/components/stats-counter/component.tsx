interface Stat {
  value?: string;
  label?: string;
}

interface StatsCounterProps {
  sectionTitle?: string;
  stats?: Stat[];
}

const DEFAULT_STATS: Stat[] = [
  { value: "10,000+", label: "Teams worldwide" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "3x", label: "Faster releases" },
  { value: "$2.4M", label: "Saved per year avg." },
];

export default function StatsCounter({
  sectionTitle,
  stats = DEFAULT_STATS,
}: StatsCounterProps) {
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background: "color-mix(in srgb, var(--color-surface, #fff) 97%, var(--color-primary))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Optional title */}
        {sectionTitle && (
          <div className="text-center mb-14">
            <h2
              className="animate-on-scroll text-3xl md:text-4xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-text, #0f172a)",
              }}
            >
              {sectionTitle}
            </h2>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="fade-up relative flex flex-col items-center text-center px-6 py-10"
              style={{ "--stagger-index": index } as React.CSSProperties}
            >
              {/* Vertical divider — not on first in each row */}
              {index > 0 && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-px"
                  style={{
                    background: "color-mix(in srgb, var(--color-text, #0f172a) 10%, transparent)",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Value */}
              <span
                className="text-4xl md:text-5xl font-bold mb-3 leading-none tabular-nums"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-primary)",
                }}
              >
                {stat.value}
              </span>

              {/* Label */}
              <span
                className="text-sm md:text-base font-medium max-w-[12ch] leading-snug"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "color-mix(in srgb, var(--color-text, #0f172a) 58%, transparent)",
                }}
              >
                {stat.label}
              </span>

              {/* Bottom accent dot */}
              <div
                className="mt-5 w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-primary)", opacity: 0.4 }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
