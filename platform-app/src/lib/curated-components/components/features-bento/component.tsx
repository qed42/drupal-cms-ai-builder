interface FeaturesBentoProps {
  featured_title?: string;
  featured_desc?: string;
  card_1_title?: string;
  card_1_desc?: string;
  card_2_title?: string;
  card_2_desc?: string;
  card_3_title?: string;
  card_3_desc?: string;
  card_4_title?: string;
  card_4_desc?: string;
}

const CARD_ICONS = [
  // Zap
  <svg key="zap" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12.5L13 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Shield
  <svg key="shield" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2l8 3.5V12c0 4.5-3.5 8-8 10-4.5-2-8-5.5-8-10V5.5L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Globe
  <svg key="globe" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M2 12h20M12 2c-3 3-4.5 6.5-4.5 10S9 19 12 22c3-3 4.5-6.5 4.5-10S15 5 12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>,
  // Layers
  <svg key="layers" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

export default function FeaturesBento({
  featured_title = "Ship 10x faster with AI-assisted workflows",
  featured_desc = "Our intelligent platform learns from your team's patterns and automates the tedious parts — so you can focus on building what matters.",
  card_1_title = "Real-time sync",
  card_1_desc = "Changes propagate instantly across every connected device and teammate.",
  card_2_title = "Zero config security",
  card_2_desc = "Enterprise-grade protection enabled by default. No setup required.",
  card_3_title = "Global CDN",
  card_3_desc = "Sub-50ms response times from anywhere in the world, every time.",
  card_4_title = "Composable APIs",
  card_4_desc = "Mix and match primitives to build exactly what your product needs.",
}: FeaturesBentoProps) {
  const smallCards = [
    { title: card_1_title, desc: card_1_desc, icon: CARD_ICONS[0] },
    { title: card_2_title, desc: card_2_desc, icon: CARD_ICONS[1] },
    { title: card_3_title, desc: card_3_desc, icon: CARD_ICONS[2] },
    { title: card_4_title, desc: card_4_desc, icon: CARD_ICONS[3] },
  ].filter((c) => c.title);

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "var(--color-surface, #fff)" }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Bento grid */}
        <div
          className="grid gap-4 md:gap-5"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          {/* Featured card — spans 2 cols × 2 rows on md+ */}
          <div
            className="fade-up hover-glow relative overflow-hidden rounded-2xl p-8 md:p-10 flex flex-col justify-between"
            style={{
              gridColumn: "span 3",
              background: "linear-gradient(145deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, var(--color-accent, #7c3aed)))",
              minHeight: "280px",
              boxShadow: "0 16px 56px -12px color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)",
              }}
            />

            {/* Large decorative icon */}
            <div className="absolute right-8 top-8 opacity-10" aria-hidden="true">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12.5L13 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Featured
              </div>

              <h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4 max-w-lg"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {featured_title}
              </h2>

              <p
                className="text-base leading-relaxed max-w-md"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {featured_desc}
              </p>
            </div>

            <div className="relative z-10 mt-8">
              <a
                href="#"
                className="hover-scale inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "rgba(255,255,255,0.95)",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                Explore features
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Small cards — each spans 1 col on desktop, full width on mobile */}
          {smallCards.map((card, index) => (
            <div
              key={index}
              className="fade-up hover-lift group relative overflow-hidden rounded-2xl p-6 md:p-7 flex flex-col"
              style={{
                "--stagger-index": index + 1,
                gridColumn: "span 3",
                background: "var(--color-surface, #fff)",
                border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              } as React.CSSProperties}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  color: "var(--color-primary)",
                }}
              >
                {card.icon}
              </div>

              <h3
                className="text-base font-semibold mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text, #0f172a)",
                }}
              >
                {card.title}
              </h3>

              <p
                className="text-sm leading-relaxed flex-1"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "color-mix(in srgb, var(--color-text, #0f172a) 58%, transparent)",
                }}
              >
                {card.desc}
              </p>

              {/* Hover accent bottom line */}
              <div
                className="mt-5 h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-500"
                style={{ background: "var(--color-primary)" }}
              />

              {/* Subtle hover bg */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 3%, transparent), transparent)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Responsive grid fix via style tag */}
        <style>{`
          @media (min-width: 768px) {
            .bento-featured { grid-column: span 2 !important; grid-row: span 2 !important; }
            .bento-small { grid-column: span 1 !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
