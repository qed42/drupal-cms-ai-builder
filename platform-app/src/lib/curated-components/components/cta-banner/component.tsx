interface CtaBannerProps {
  headline?: string;
  supportingText?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
}

export default function CtaBanner({
  headline = "Ready to transform the way your team works?",
  supportingText = "Join over 10,000 teams already using our platform. Start free, upgrade when you're ready.",
  primaryCtaLabel = "Get Started Free",
  primaryCtaUrl = "#",
  secondaryCtaLabel = "Talk to Sales",
  secondaryCtaUrl = "#",
}: CtaBannerProps) {
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent, var(--color-primary)) 100%)",
      }}
    >
      {/* Decorative circle — top-left */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "rgba(255,255,255,0.06)",
        }}
        aria-hidden="true"
      />
      {/* Decorative circle — bottom-right */}
      <div
        className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.05)" }}
        aria-hidden="true"
      />
      {/* Decorative circle — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48rem] h-[48rem] rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.03)" }}
        aria-hidden="true"
      />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2
            className="animate-on-scroll text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {headline}
          </h2>

          <p
            className="animate-on-scroll text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {supportingText}
          </p>

          <div className="animate-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={primaryCtaUrl}
              className="hover-lift hover-scale inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all"
              style={{
                background: "#fff",
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              }}
            >
              {primaryCtaLabel}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href={secondaryCtaUrl}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white transition-all hover:bg-white/10"
              style={{
                border: "2px solid rgba(255,255,255,0.5)",
                fontFamily: "var(--font-body)",
              }}
            >
              {secondaryCtaLabel}
            </a>
          </div>

          {/* Trust badges */}
          <div
            className="animate-on-scroll mt-12 flex flex-wrap items-center justify-center gap-6 text-white/60"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {["No credit card required", "Free 14-day trial", "Cancel anytime"].map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
