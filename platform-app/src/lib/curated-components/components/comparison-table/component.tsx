interface ComparisonTableProps {
  section_title?: string;
  section_desc?: string;
  basic_name?: string;
  premium_name?: string;
  feature_1_name?: string;
  feature_1_basic?: string;
  feature_1_premium?: string;
  feature_2_name?: string;
  feature_2_basic?: string;
  feature_2_premium?: string;
  feature_3_name?: string;
  feature_3_basic?: string;
  feature_3_premium?: string;
  feature_4_name?: string;
  feature_4_basic?: string;
  feature_4_premium?: string;
  feature_5_name?: string;
  feature_5_basic?: string;
  feature_5_premium?: string;
  feature_6_name?: string;
  feature_6_basic?: string;
  feature_6_premium?: string;
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="var(--color-primary)" fillOpacity="0.12" />
      <path
        d="M6 10l3 3 5-5"
        stroke="var(--color-primary)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="currentColor" fillOpacity="0.06" />
      <path
        d="M7 7l6 6M13 7l-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CellValue({ value }: { value: string }) {
  const lower = value.toLowerCase().trim();
  if (lower === "true" || lower === "yes" || lower === "✓") {
    return (
      <span className="flex justify-center">
        <CheckIcon />
      </span>
    );
  }
  if (lower === "false" || lower === "no" || lower === "✗" || lower === "-") {
    return (
      <span
        className="flex justify-center"
        style={{ color: "color-mix(in srgb, var(--color-text, #0f172a) 30%, transparent)" }}
      >
        <CrossIcon />
      </span>
    );
  }
  return (
    <span
      className="text-sm font-medium"
      style={{
        fontFamily: "var(--font-body)",
        color: "color-mix(in srgb, var(--color-text, #0f172a) 75%, transparent)",
      }}
    >
      {value}
    </span>
  );
}

export default function ComparisonTable({
  section_title = "Compare plans side by side",
  section_desc = "Everything you need to make the right choice for your team.",
  basic_name = "Basic",
  premium_name = "Premium",
  feature_1_name = "Team members",
  feature_1_basic = "Up to 5",
  feature_1_premium = "Unlimited",
  feature_2_name = "Storage",
  feature_2_basic = "10 GB",
  feature_2_premium = "1 TB",
  feature_3_name = "Analytics dashboard",
  feature_3_basic = "true",
  feature_3_premium = "true",
  feature_4_name = "Custom domain",
  feature_4_basic = "false",
  feature_4_premium = "true",
  feature_5_name = "Priority support",
  feature_5_basic = "false",
  feature_5_premium = "true",
  feature_6_name = "Advanced integrations",
  feature_6_basic = "false",
  feature_6_premium = "true",
}: ComparisonTableProps) {
  const features = [
    { name: feature_1_name, basic: feature_1_basic, premium: feature_1_premium },
    { name: feature_2_name, basic: feature_2_basic, premium: feature_2_premium },
    { name: feature_3_name, basic: feature_3_basic, premium: feature_3_premium },
    { name: feature_4_name, basic: feature_4_basic, premium: feature_4_premium },
    { name: feature_5_name, basic: feature_5_basic, premium: feature_5_premium },
    { name: feature_6_name, basic: feature_6_basic, premium: feature_6_premium },
  ].filter((f) => f.name);

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "var(--color-surface, #fff)" }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2
            className="animate-on-scroll text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #0f172a)",
            }}
          >
            {section_title}
          </h2>
          {section_desc && (
            <p
              className="animate-on-scroll text-lg leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "color-mix(in srgb, var(--color-text, #0f172a) 58%, transparent)",
              }}
            >
              {section_desc}
            </p>
          )}
        </div>

        {/* Table wrapper — horizontal scroll on mobile */}
        <div className="fade-up overflow-x-auto rounded-2xl" style={{ border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 9%, transparent)" }}>
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr
                style={{
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, #fff), color-mix(in srgb, var(--color-accent, var(--color-primary)) 5%, #fff))",
                }}
              >
                <th
                  className="text-left px-6 py-5 text-sm font-semibold uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)",
                    width: "50%",
                  }}
                >
                  Feature
                </th>
                <th
                  className="px-6 py-5 text-center text-sm font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "color-mix(in srgb, var(--color-text, #0f172a) 65%, transparent)",
                    width: "25%",
                  }}
                >
                  {basic_name}
                </th>
                <th
                  className="px-6 py-5 text-center text-sm font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-primary)",
                    width: "25%",
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {premium_name}
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                      style={{ background: "var(--color-primary)" }}
                    >
                      Pro
                    </span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className="group transition-colors"
                  style={{
                    background:
                      index % 2 === 0
                        ? "var(--color-surface, #fff)"
                        : "color-mix(in srgb, var(--color-text, #0f172a) 2%, transparent)",
                    borderTop: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 6%, transparent)",
                  }}
                >
                  <td
                    className="px-6 py-4 text-sm font-medium"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text, #0f172a)",
                    }}
                  >
                    {feature.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CellValue value={feature.basic || ""} />
                  </td>
                  <td
                    className="px-6 py-4 text-center"
                    style={{
                      background: "color-mix(in srgb, var(--color-primary) 3%, transparent)",
                    }}
                  >
                    <CellValue value={feature.premium || ""} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
