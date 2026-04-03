interface HeroSplitProps {
  headline?: string;
  subheading?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  image?: string;
  imageAlt?: string;
  badge?: string;
}

export default function HeroSplit({
  headline = "The Modern Platform for Growth Teams",
  subheading = "Streamline your workflow, delight your customers, and accelerate revenue with AI-powered tools built for scale.",
  primaryCtaLabel = "Start for Free",
  primaryCtaUrl = "#",
  secondaryCtaLabel = "See How It Works",
  secondaryCtaUrl = "#",
  image = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
  imageAlt = "Product dashboard screenshot",
  badge = "Trusted by 10,000+ teams",
}: HeroSplitProps) {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{ background: "var(--color-surface, #fff)" }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Text content */}
          <div className="stagger-children">
            {badge && (
              <div
                className="fade-up inline-flex items-center gap-2 text-sm font-medium mb-6 px-4 py-1.5 rounded-full"
                style={{
                  "--stagger-index": "0",
                  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  color: "var(--color-primary)",
                  border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
                } as React.CSSProperties}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
                  <circle cx="4" cy="4" r="4" />
                </svg>
                {badge}
              </div>
            )}

            <h1
              className="fade-up text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-text, #0f172a)",
                "--stagger-index": "1",
              } as React.CSSProperties}
            >
              {headline}
            </h1>

            <p
              className="fade-up text-lg md:text-xl leading-relaxed mb-10"
              style={{
                fontFamily: "var(--font-body)",
                color: "color-mix(in srgb, var(--color-text, #0f172a) 65%, transparent)",
                "--stagger-index": "2",
              } as React.CSSProperties}
            >
              {subheading}
            </p>

            <div
              className="fade-up flex flex-wrap gap-4"
              style={{ "--stagger-index": "3" } as React.CSSProperties}
            >
              <a
                href={primaryCtaUrl}
                className="hover-lift inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-white transition-opacity hover:opacity-90"
                style={{
                  background: "var(--color-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {primaryCtaLabel}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href={secondaryCtaUrl}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base transition-colors hover:opacity-80"
                style={{
                  border: "2px solid var(--color-primary)",
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {secondaryCtaLabel}
              </a>
            </div>

            {/* Social proof row */}
            <div
              className="fade-up flex items-center gap-3 mt-10 pt-8"
              style={{
                "--stagger-index": "4",
                borderTop: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 10%, transparent)",
              } as React.CSSProperties}
            >
              <div className="flex -space-x-2">
                {["bg-blue-400", "bg-emerald-400", "bg-violet-400", "bg-amber-400"].map((c, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p
                className="text-sm"
                style={{
                  color: "color-mix(in srgb, var(--color-text, #0f172a) 55%, transparent)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Joined by <strong style={{ color: "var(--color-text, #0f172a)" }}>10,000+</strong> users this month
              </p>
            </div>
          </div>

          {/* Right: Image with decorative blob */}
          <div className="relative slide-right">
            {/* Decorative gradient blob */}
            <div
              className="absolute -inset-8 rounded-3xl blur-3xl opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, var(--color-primary), var(--color-accent, var(--color-primary)))",
              }}
            />
            {/* Image frame */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl hover-scale">
              <img
                src={image}
                alt={imageAlt}
                className="w-full h-full object-cover"
                style={{ aspectRatio: "4/3" }}
              />
              {/* Subtle inner shadow */}
              <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
