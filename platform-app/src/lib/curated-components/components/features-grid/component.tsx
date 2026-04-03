interface Feature {
  icon?: string;
  title?: string;
  description?: string;
}

interface FeaturesGridProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  features?: Feature[];
}

const DEFAULT_FEATURES: Feature[] = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Built with performance at its core. Sub-second load times and smooth interactions that users love.",
  },
  {
    icon: "🔒",
    title: "Enterprise Security",
    description: "SOC 2 Type II certified with end-to-end encryption, SSO, and granular permission controls.",
  },
  {
    icon: "🤖",
    title: "AI-Powered",
    description: "Smart automation and intelligent suggestions that learn from your team's patterns over time.",
  },
  {
    icon: "📊",
    title: "Deep Analytics",
    description: "Real-time dashboards and custom reports that surface insights you can actually act on.",
  },
  {
    icon: "🔗",
    title: "200+ Integrations",
    description: "Connect with your existing stack in minutes. Slack, GitHub, Salesforce, and many more.",
  },
  {
    icon: "🌍",
    title: "Global Scale",
    description: "Multi-region infrastructure with 99.99% uptime SLA. Wherever your team is, we are too.",
  },
];

export default function FeaturesGrid({
  sectionTitle = "Everything you need to ship faster",
  sectionSubtitle = "A complete toolkit for modern product teams — from first idea to production, without the friction.",
  features = DEFAULT_FEATURES,
}: FeaturesGridProps) {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "var(--color-surface, #fff)" }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2
            className="animate-on-scroll text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #0f172a)",
            }}
          >
            {sectionTitle}
          </h2>
          <p
            className="animate-on-scroll text-lg md:text-xl leading-relaxed"
            style={{
              fontFamily: "var(--font-body)",
              color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
            }}
          >
            {sectionSubtitle}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="fade-up hover-lift rounded-2xl p-8 group"
              style={{
                "--stagger-index": index,
                background: "var(--color-surface, #fff)",
                border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
              } as React.CSSProperties}
            >
              {/* Icon area */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 transition-transform group-hover:scale-110"
                style={{
                  background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                }}
              >
                <span role="img" aria-label={feature.title}>{feature.icon}</span>
              </div>

              {/* Title */}
              <h3
                className="text-lg font-semibold mb-3"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text, #0f172a)",
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="text-base leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
                }}
              >
                {feature.description}
              </p>

              {/* Hover accent line */}
              <div
                className="mt-5 h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-500"
                style={{ background: "var(--color-primary)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
