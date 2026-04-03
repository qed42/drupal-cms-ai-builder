interface ServicesAlternatingProps {
  section_title?: string;
  service_1_title?: string;
  service_1_desc?: string;
  service_1_image?: string;
  service_1_cta_text?: string;
  service_1_cta_url?: string;
  service_2_title?: string;
  service_2_desc?: string;
  service_2_image?: string;
  service_2_cta_text?: string;
  service_2_cta_url?: string;
  service_3_title?: string;
  service_3_desc?: string;
  service_3_image?: string;
  service_3_cta_text?: string;
  service_3_cta_url?: string;
}

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
];

interface ServiceRowProps {
  title: string;
  desc: string;
  image: string;
  ctaText?: string;
  ctaUrl?: string;
  reversed: boolean;
  index: number;
}

function ServiceRow({ title, desc, image, ctaText, ctaUrl, reversed, index }: ServiceRowProps) {
  return (
    <div
      className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}
    >
      {/* Image */}
      <div
        className={`w-full lg:w-1/2 fade-${reversed ? "slide-right" : "slide-left"} flex-shrink-0`}
        style={{ "--stagger-index": index } as React.CSSProperties}
      >
        <div
          className="relative rounded-2xl overflow-hidden group"
          style={{
            boxShadow: "0 20px 60px -12px rgba(0,0,0,0.15)",
          }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
          />
          {/* Decorative accent */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity duration-500 pointer-events-none"
            style={{ background: "var(--color-primary)" }}
          />
        </div>
        {/* Decorative blur blob */}
        <div
          className="absolute -z-10 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background: "var(--color-primary)",
            top: "10%",
            left: reversed ? "auto" : "10%",
            right: reversed ? "10%" : "auto",
          }}
        />
      </div>

      {/* Text content */}
      <div
        className={`w-full lg:w-1/2 fade-${reversed ? "slide-left" : "slide-right"}`}
        style={{ "--stagger-index": index + 0.5 } as React.CSSProperties}
      >
        {/* Step label */}
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-primary)",
          }}
        >
          0{index + 1}
        </p>

        <h3
          className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-5"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text, #0f172a)",
          }}
        >
          {title}
        </h3>

        <p
          className="text-base md:text-lg leading-relaxed mb-8"
          style={{
            fontFamily: "var(--font-body)",
            color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
          }}
        >
          {desc}
        </p>

        {ctaText && (
          <a
            href={ctaUrl || "#"}
            className="hover-scale inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              fontFamily: "var(--font-body)",
              background: "var(--color-primary)",
              color: "#fff",
            }}
          >
            {ctaText}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default function ServicesAlternating({
  section_title = "How we help you succeed",
  service_1_title = "Strategic Design",
  service_1_desc = "We craft purposeful digital experiences grounded in research and strategy. Every pixel serves your users and your business goals.",
  service_1_image = DEFAULT_IMAGES[0],
  service_1_cta_text = "Learn more",
  service_1_cta_url = "#",
  service_2_title = "Scalable Engineering",
  service_2_desc = "From architecture to deployment, we build systems that grow with you. Clean code, robust infrastructure, zero technical debt.",
  service_2_image = DEFAULT_IMAGES[1],
  service_2_cta_text = "See our work",
  service_2_cta_url = "#",
  service_3_title = "Growth & Analytics",
  service_3_desc = "Data-driven decisions that compound. We instrument, measure, and optimize every touchpoint in your funnel.",
  service_3_image = DEFAULT_IMAGES[2],
  service_3_cta_text,
  service_3_cta_url,
}: ServicesAlternatingProps) {
  const services = [
    { title: service_1_title, desc: service_1_desc, image: service_1_image, ctaText: service_1_cta_text, ctaUrl: service_1_cta_url },
    { title: service_2_title, desc: service_2_desc, image: service_2_image, ctaText: service_2_cta_text, ctaUrl: service_2_cta_url },
    { title: service_3_title, desc: service_3_desc, image: service_3_image, ctaText: service_3_cta_text, ctaUrl: service_3_cta_url },
  ].filter((s) => s.title);

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "var(--color-surface, #fff)" }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2
            className="animate-on-scroll text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #0f172a)",
            }}
          >
            {section_title}
          </h2>
        </div>

        {/* Alternating rows */}
        <div className="space-y-24 md:space-y-32 relative">
          {services.map((service, index) => (
            <ServiceRow
              key={index}
              title={service.title || ""}
              desc={service.desc || ""}
              image={service.image || DEFAULT_IMAGES[index % DEFAULT_IMAGES.length]}
              ctaText={service.ctaText}
              ctaUrl={service.ctaUrl}
              reversed={index % 2 !== 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
