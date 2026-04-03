interface TimelineProps {
  section_title?: string;
  item_1_date?: string;
  item_1_title?: string;
  item_1_desc?: string;
  item_2_date?: string;
  item_2_title?: string;
  item_2_desc?: string;
  item_3_date?: string;
  item_3_title?: string;
  item_3_desc?: string;
  item_4_date?: string;
  item_4_title?: string;
  item_4_desc?: string;
}

export default function Timeline({
  section_title = "Our Journey",
  item_1_date = "2021",
  item_1_title = "Founded with a Vision",
  item_1_desc = "Two engineers frustrated with existing tools decided to build something better. The company was incorporated with $500K in pre-seed funding from angels who believed in the mission.",
  item_2_date = "2022",
  item_2_title = "Product Launch & First 100 Customers",
  item_2_desc = "After 8 months of heads-down building, we launched publicly and reached 100 paying customers within the first 60 days. Product-market fit confirmed.",
  item_3_date = "2023",
  item_3_title = "Series A & International Expansion",
  item_3_desc = "Raised $12M Series A led by Accel. Expanded the team from 8 to 40 people and opened offices in London and Singapore to serve a growing global customer base.",
  item_4_date = "2024",
  item_4_title = "10,000 Teams & $1M ARR",
  item_4_desc = "Hit the milestone of 10,000 active teams and crossed $1M in annual recurring revenue. Named to the Forbes Cloud 100 Rising Stars list.",
}: TimelineProps) {
  const items = [
    { date: item_1_date, title: item_1_title, desc: item_1_desc },
    { date: item_2_date, title: item_2_title, desc: item_2_desc },
    { date: item_3_date, title: item_3_title, desc: item_3_desc },
    { date: item_4_date, title: item_4_title, desc: item_4_desc },
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--color-surface, #fff)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="animate-on-scroll fade-up text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
          >
            {section_title}
          </h2>
        </div>

        {/* Timeline container */}
        <div className="relative">
          {/* Center line — desktop only */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block"
            style={{ background: "color-mix(in srgb, var(--color-text, #0f172a) 12%, transparent)" }}
            aria-hidden="true"
          />
          {/* Left line — mobile only */}
          <div
            className="absolute left-4 top-0 bottom-0 w-px block md:hidden"
            style={{ background: "color-mix(in srgb, var(--color-text, #0f172a) 12%, transparent)" }}
            aria-hidden="true"
          />

          <div className="space-y-12 md:space-y-0">
            {items.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className="fade-up relative flex md:items-center pl-12 md:pl-0"
                  style={{ "--stagger-index": index } as React.CSSProperties}
                >
                  {/* Mobile: timeline dot */}
                  <div
                    className="absolute left-4 top-1 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md md:hidden flex-shrink-0 z-10"
                    style={{ background: "var(--color-primary)" }}
                    aria-hidden="true"
                  />

                  {/* Desktop: alternating layout */}
                  <div className="hidden md:flex w-full items-start gap-0">
                    {/* Left content block */}
                    <div className={`w-1/2 pr-12 ${isEven ? "text-right" : "opacity-0 pointer-events-none"}`}>
                      {isEven && (
                        <div
                          className="inline-block rounded-2xl p-6"
                          style={{
                            background: "color-mix(in srgb, var(--color-text, #0f172a) 3%, var(--color-surface, #fff))",
                            border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
                          }}
                        >
                          <span
                            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                            style={{
                              background: "var(--color-primary)",
                              color: "#fff",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {item.date}
                          </span>
                          <h3
                            className="font-bold text-lg mb-2"
                            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-sm leading-relaxed"
                            style={{
                              fontFamily: "var(--font-body)",
                              color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
                            }}
                          >
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center dot */}
                    <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: "0px" }}>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-lg z-10 absolute"
                        style={{ background: "var(--color-primary)" }}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Right content block */}
                    <div className={`w-1/2 pl-12 ${!isEven ? "" : "opacity-0 pointer-events-none"}`}>
                      {!isEven && (
                        <div
                          className="inline-block rounded-2xl p-6"
                          style={{
                            background: "color-mix(in srgb, var(--color-text, #0f172a) 3%, var(--color-surface, #fff))",
                            border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
                          }}
                        >
                          <span
                            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                            style={{
                              background: "var(--color-primary)",
                              color: "#fff",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {item.date}
                          </span>
                          <h3
                            className="font-bold text-lg mb-2"
                            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-sm leading-relaxed"
                            style={{
                              fontFamily: "var(--font-body)",
                              color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
                            }}
                          >
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden">
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                      style={{
                        background: "var(--color-primary)",
                        color: "#fff",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {item.date}
                    </span>
                    <h3
                      className="font-bold text-lg mb-2"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
