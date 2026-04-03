interface CtaSplitImageProps {
  heading?: string;
  description?: string;
  cta_text?: string;
  cta_url?: string;
  secondary_text?: string;
  secondary_url?: string;
  image?: string;
}

export default function CtaSplitImage({
  heading = "Ready to transform the way your team works?",
  description = "Join thousands of teams already using our platform to ship faster, collaborate better, and build products users love.",
  cta_text = "Start for free",
  cta_url = "#",
  secondary_text = "Book a demo",
  secondary_url = "#",
  image = "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
}: CtaSplitImageProps) {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "color-mix(in srgb, var(--color-surface, #fff) 95%, var(--color-primary) 5%)" }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text content */}
          <div className="w-full lg:w-1/2 slide-left">
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-primary)" }}
              />
              Get started today
            </div>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-text, #0f172a)",
              }}
            >
              {heading}
            </h2>

            <p
              className="text-lg leading-relaxed mb-10"
              style={{
                fontFamily: "var(--font-body)",
                color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
              }}
            >
              {description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={cta_url || "#"}
                className="hover-scale inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-base transition-all"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "var(--color-primary)",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 4px 24px -4px color-mix(in srgb, var(--color-primary) 50%, transparent)",
                }}
              >
                {cta_text}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {secondary_text && (
                <a
                  href={secondary_url || "#"}
                  className="hover-scale inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-base transition-all"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: "transparent",
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    border: "2px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  }}
                >
                  {secondary_text}
                </a>
              )}
            </div>

            {/* Trust indicators */}
            <div
              className="mt-10 flex items-center gap-6 text-xs"
              style={{
                fontFamily: "var(--font-body)",
                color: "color-mix(in srgb, var(--color-text, #0f172a) 40%, transparent)",
              }}
            >
              {["No credit card required", "14-day free trial", "Cancel anytime"].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <circle cx="6" cy="6" r="6" fill="var(--color-primary)" fillOpacity="0.15" />
                    <path d="M3.5 6l1.5 1.5 3-3" stroke="var(--color-primary)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="w-full lg:w-1/2 slide-right">
            <div
              className="relative rounded-2xl overflow-hidden group"
              style={{
                boxShadow: "0 32px 80px -16px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
              }}
            >
              <img
                src={image}
                alt={heading}
                className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 60%)",
                }}
              />
            </div>
            {/* Floating decoration */}
            <div
              className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none -z-10"
              style={{ background: "var(--color-accent, var(--color-primary))" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
