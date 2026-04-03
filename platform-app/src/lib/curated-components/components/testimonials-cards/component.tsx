interface Testimonial {
  quote?: string;
  authorName?: string;
  authorRole?: string;
  authorCompany?: string;
  avatarInitials?: string;
  avatarColor?: string;
}

interface TestimonialsCardsProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote: "This platform completely transformed how our team ships product. We cut our release cycle in half and our customers noticed the difference immediately.",
    authorName: "Sarah Chen",
    authorRole: "VP of Engineering",
    authorCompany: "Meridian Labs",
    avatarInitials: "SC",
    avatarColor: "#6366f1",
  },
  {
    quote: "I've evaluated dozens of tools in this space. Nothing comes close to the depth of integrations and the quality of the analytics. It's become indispensable.",
    authorName: "Marcus Rivera",
    authorRole: "Head of Product",
    authorCompany: "Vertex Systems",
    avatarInitials: "MR",
    avatarColor: "#10b981",
  },
  {
    quote: "The AI-powered features felt like magic at first. Now they're just part of how we work. The ROI paid for itself in the first quarter.",
    authorName: "Priya Nair",
    authorRole: "CTO",
    authorCompany: "Bloom Finance",
    avatarInitials: "PN",
    avatarColor: "#f59e0b",
  },
];

export default function TestimonialsCards({
  sectionTitle = "Loved by teams worldwide",
  sectionSubtitle = "Thousands of companies trust us to power their most critical workflows.",
  testimonials = DEFAULT_TESTIMONIALS,
}: TestimonialsCardsProps) {
  return (
    <section
      className="py-16 md:py-24"
      style={{
        background: "color-mix(in srgb, var(--color-surface, #fff) 96%, var(--color-primary))",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2
            className="animate-on-scroll text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #0f172a)",
            }}
          >
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p
              className="animate-on-scroll text-lg leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "color-mix(in srgb, var(--color-text, #0f172a) 58%, transparent)",
              }}
            >
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="fade-up hover-lift relative rounded-2xl p-8 flex flex-col"
              style={{
                "--stagger-index": index,
                background: "var(--color-surface, #fff)",
                border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 7%, transparent)",
                borderLeft: "4px solid var(--color-primary)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05), 0 0 0 0 transparent",
              } as React.CSSProperties}
            >
              {/* Large quote SVG */}
              <div className="mb-5">
                <svg
                  width="40"
                  height="32"
                  viewBox="0 0 40 32"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 0C5.373 0 0 5.373 0 12c0 5.877 4.218 10.812 9.832 11.853L8 32h6l4-8.147C21.48 23.4 24 20.17 24 16V0H12zm22 0c-6.627 0-12 5.373-12 12 0 5.877 4.218 10.812 9.832 11.853L30 32h6l4-8.147C43.48 23.4 46 20.17 46 16V0H34z"
                    fill="var(--color-primary)"
                    fillOpacity="0.15"
                  />
                </svg>
              </div>

              {/* Quote */}
              <blockquote
                className="text-base md:text-lg leading-relaxed italic flex-1 mb-8"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "color-mix(in srgb, var(--color-text, #0f172a) 75%, transparent)",
                }}
              >
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: t.avatarColor || "var(--color-primary)" }}
                  aria-hidden="true"
                >
                  {t.avatarInitials}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text, #0f172a)",
                    }}
                  >
                    {t.authorName}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)",
                    }}
                  >
                    {t.authorRole}{t.authorCompany ? ` · ${t.authorCompany}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
