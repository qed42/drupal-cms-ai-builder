interface HeroMinimalProps {
  eyebrow?: string;
  headline?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export default function HeroMinimal({
  eyebrow = "Introducing v2.0",
  headline = "Design without limits.",
  subheading = "A blank canvas for your boldest ideas. Craft pixel-perfect experiences that scale across every device and delight every user.",
  ctaLabel = "Start Creating",
  ctaUrl = "#",
}: HeroMinimalProps) {
  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      style={{ background: "var(--color-surface, #fafafa)" }}
    >
      {/* Subtle background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
        }}
      />

      {/* Faint grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--color-text, #0f172a) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-text, #0f172a) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-24 text-center">
        {/* Eyebrow */}
        {eyebrow && (
          <div className="fade-up mb-8" style={{ "--stagger-index": "0" } as React.CSSProperties}>
            <span
              className="inline-block text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}
            >
              {eyebrow}
            </span>
          </div>
        )}

        {/* Headline */}
        <h1
          className="fade-up text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] mb-8"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text, #0f172a)",
            "--stagger-index": "1",
          } as React.CSSProperties}
        >
          {headline}
        </h1>

        {/* Subheading */}
        <p
          className="fade-up text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-12 font-light"
          style={{
            fontFamily: "var(--font-body)",
            color: "color-mix(in srgb, var(--color-text, #0f172a) 55%, transparent)",
            "--stagger-index": "2",
          } as React.CSSProperties}
        >
          {subheading}
        </p>

        {/* CTA */}
        <div
          className="fade-up flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ "--stagger-index": "3" } as React.CSSProperties}
        >
          <a
            href={ctaUrl}
            className="hover-lift hover-glow inline-flex items-center gap-3 px-9 py-4 rounded-2xl font-semibold text-base text-white shadow-lg"
            style={{
              background: "var(--color-primary)",
              fontFamily: "var(--font-body)",
              boxShadow: "0 4px 24px -4px color-mix(in srgb, var(--color-primary) 50%, transparent)",
            }}
          >
            {ctaLabel}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Decorative bottom dash */}
        <div
          className="fade-up mt-16 flex items-center justify-center gap-4"
          style={{ "--stagger-index": "4" } as React.CSSProperties}
        >
          <div
            className="h-px w-16"
            style={{ background: "color-mix(in srgb, var(--color-text, #0f172a) 15%, transparent)" }}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle
              cx="10"
              cy="10"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: "color-mix(in srgb, var(--color-text, #0f172a) 20%, transparent)" }}
            />
            <circle cx="10" cy="10" r="2" fill="var(--color-primary)" />
          </svg>
          <div
            className="h-px w-16"
            style={{ background: "color-mix(in srgb, var(--color-text, #0f172a) 15%, transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
