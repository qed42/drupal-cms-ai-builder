interface HeroGradientProps {
  headline?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  backgroundAlt?: string;
}

export default function HeroGradient({
  headline = "Build Something Remarkable",
  subheading = "A powerful platform designed to help your team move faster, ship confidently, and scale effortlessly.",
  ctaLabel = "Get Started Free",
  ctaUrl = "#",
  backgroundImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80",
  backgroundAlt = "Hero background",
}: HeroGradientProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <img
        src={backgroundImage}
        alt={backgroundAlt}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Gradient overlay: brand primary → transparent */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 60%, transparent) 50%, transparent 100%)",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="fade-up" style={{ "--stagger-index": "0" } as React.CSSProperties}>
            <span
              className="inline-block text-sm font-semibold uppercase tracking-widest mb-6 px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Now in public beta
            </span>
          </div>

          <h1
            className="fade-up text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6"
            style={{
              fontFamily: "var(--font-heading)",
              "--stagger-index": "1",
            } as React.CSSProperties}
          >
            {headline}
          </h1>

          <p
            className="fade-up text-xl md:text-2xl text-white/80 leading-relaxed mb-10 max-w-2xl"
            style={{
              fontFamily: "var(--font-body)",
              "--stagger-index": "2",
            } as React.CSSProperties}
          >
            {subheading}
          </p>

          <div
            className="fade-up flex flex-wrap gap-4 items-center"
            style={{ "--stagger-index": "3" } as React.CSSProperties}
          >
            <a
              href={ctaUrl}
              className="hover-lift inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-colors"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                fontFamily: "var(--font-body)",
              }}
            >
              {ctaLabel}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#learn-more"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-base font-medium transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7l5 3-5 3V7z" fill="currentColor" />
              </svg>
              Watch demo
            </a>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, var(--color-surface, #fff), transparent)",
        }}
      />
    </section>
  );
}
