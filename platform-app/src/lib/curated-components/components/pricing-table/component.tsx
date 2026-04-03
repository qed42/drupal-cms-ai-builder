interface PricingTier {
  name?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  isPopular?: boolean;
}

interface PricingTableProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  tiers?: PricingTier[];
}

const DEFAULT_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for individuals and small projects getting off the ground.",
    features: "Up to 3 projects,5 GB storage,Basic analytics,Email support,API access",
    ctaLabel: "Get Started Free",
    ctaUrl: "#",
    isPopular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "Everything teams need to move fast and ship with confidence.",
    features: "Unlimited projects,100 GB storage,Advanced analytics,Priority support,API access,Custom domains,Team collaboration,Audit logs",
    ctaLabel: "Start Pro Trial",
    ctaUrl: "#",
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For large organizations requiring enterprise-grade security and scale.",
    features: "Unlimited everything,1 TB storage,Custom analytics,Dedicated support,API access,Custom domains,SSO & SAML,SLA guarantee,Security review",
    ctaLabel: "Contact Sales",
    ctaUrl: "#",
    isPopular: false,
  },
];

export default function PricingTable({
  sectionTitle = "Simple, transparent pricing",
  sectionSubtitle = "No hidden fees. No surprises. Start free and scale as you grow.",
  tiers = DEFAULT_TIERS,
}: PricingTableProps) {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "var(--color-surface, #fff)" }}
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

        {/* Tiers grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, index) => {
            const featureList = (tier.features || "").split(",").map((f) => f.trim()).filter(Boolean);
            return (
              <div
                key={index}
                className={`fade-up hover-lift relative rounded-2xl p-8 flex flex-col ${tier.isPopular ? "scale-105 origin-top" : ""}`}
                style={{
                  "--stagger-index": index,
                  background: tier.isPopular
                    ? "linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 6%, #fff), #fff)"
                    : "var(--color-surface, #fff)",
                  border: tier.isPopular
                    ? "2px solid var(--color-primary)"
                    : "1px solid color-mix(in srgb, var(--color-text, #0f172a) 10%, transparent)",
                  boxShadow: tier.isPopular
                    ? "0 8px 40px -8px color-mix(in srgb, var(--color-primary) 25%, transparent)"
                    : "0 2px 12px rgba(0,0,0,0.04)",
                } as React.CSSProperties}
              >
                {/* Popular badge */}
                {tier.isPopular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white"
                    style={{ background: "var(--color-primary)", fontFamily: "var(--font-body)" }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Tier name */}
                <p
                  className="text-sm font-semibold uppercase tracking-widest mb-3"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: tier.isPopular
                      ? "var(--color-primary)"
                      : "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)",
                  }}
                >
                  {tier.name}
                </p>

                {/* Price */}
                <div className="flex items-end gap-1 mb-3">
                  <span
                    className="text-4xl md:text-5xl font-bold leading-none"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-text, #0f172a)",
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      className="text-sm pb-1"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "color-mix(in srgb, var(--color-text, #0f172a) 45%, transparent)",
                      }}
                    >
                      {tier.period}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed mb-7"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "color-mix(in srgb, var(--color-text, #0f172a) 58%, transparent)",
                  }}
                >
                  {tier.description}
                </p>

                {/* Divider */}
                <div
                  className="mb-7 h-px"
                  style={{
                    background: tier.isPopular
                      ? "color-mix(in srgb, var(--color-primary) 20%, transparent)"
                      : "color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
                  }}
                />

                {/* Feature list */}
                <ul className="space-y-3 mb-8 flex-1">
                  {featureList.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      >
                        <circle cx="8" cy="8" r="8" fill="var(--color-primary)" fillOpacity="0.12" />
                        <path
                          d="M5 8l2 2 4-4"
                          stroke="var(--color-primary)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "color-mix(in srgb, var(--color-text, #0f172a) 70%, transparent)",
                        }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={tier.ctaUrl || "#"}
                  className="hover-scale block text-center px-6 py-3.5 rounded-xl font-semibold text-base transition-all"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: tier.isPopular ? "var(--color-primary)" : "transparent",
                    color: tier.isPopular
                      ? "#fff"
                      : "var(--color-primary)",
                    border: tier.isPopular
                      ? "2px solid var(--color-primary)"
                      : "2px solid var(--color-primary)",
                  }}
                >
                  {tier.ctaLabel}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
