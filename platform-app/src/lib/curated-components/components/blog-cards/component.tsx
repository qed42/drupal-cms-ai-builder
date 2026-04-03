interface BlogCardsProps {
  section_title?: string;
  card_1_image?: string;
  card_1_category?: string;
  card_1_title?: string;
  card_1_excerpt?: string;
  card_1_author?: string;
  card_1_date?: string;
  card_2_image?: string;
  card_2_category?: string;
  card_2_title?: string;
  card_2_excerpt?: string;
  card_2_author?: string;
  card_2_date?: string;
  card_3_image?: string;
  card_3_category?: string;
  card_3_title?: string;
  card_3_excerpt?: string;
  card_3_author?: string;
  card_3_date?: string;
}

export default function BlogCards({
  section_title = "From the Blog",
  card_1_image = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  card_1_category = "Engineering",
  card_1_title = "How we built a real-time collaboration engine from scratch",
  card_1_excerpt = "A deep dive into the architecture decisions, trade-offs, and lessons learned while scaling our sync engine to millions of concurrent users.",
  card_1_author = "James Okafor",
  card_1_date = "Mar 28, 2025",
  card_2_image = "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
  card_2_category = "Product",
  card_2_title = "Designing for the developer: what 3 years of user research taught us",
  card_2_excerpt = "Developers are a unique audience. Here's what we've learned about building tools they actually love to use, from onboarding to power-user workflows.",
  card_2_author = "Priya Sharma",
  card_2_date = "Mar 15, 2025",
  card_3_image = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  card_3_category = "Growth",
  card_3_title = "From 0 to $1M ARR: the exact growth playbook we used",
  card_3_excerpt = "No vanity metrics, no fluff. This is the honest, tactical breakdown of every channel, campaign, and decision that drove our first million in revenue.",
  card_3_author = "Marcus Webb",
  card_3_date = "Feb 20, 2025",
}: BlogCardsProps) {
  const cards = [
    {
      image: card_1_image,
      category: card_1_category,
      title: card_1_title,
      excerpt: card_1_excerpt,
      author: card_1_author,
      date: card_1_date,
    },
    {
      image: card_2_image,
      category: card_2_category,
      title: card_2_title,
      excerpt: card_2_excerpt,
      author: card_2_author,
      date: card_2_date,
    },
    {
      image: card_3_image,
      category: card_3_category,
      title: card_3_title,
      excerpt: card_3_excerpt,
      author: card_3_author,
      date: card_3_date,
    },
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--color-surface, #fff)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <h2
            className="animate-on-scroll fade-up text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
          >
            {section_title}
          </h2>
          <a
            href="#"
            className="animate-on-scroll fade-up inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}
          >
            View All Posts
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <article
              key={index}
              className="fade-up hover-lift group rounded-2xl overflow-hidden"
              style={{
                "--stagger-index": index,
                background: "var(--color-surface, #fff)",
                border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              } as React.CSSProperties}
            >
              {/* Image */}
              <a href="#" className="block overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </a>

              {/* Content */}
              <div className="p-6">
                {/* Category tag */}
                <span
                  className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4"
                  style={{
                    background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {card.category}
                </span>

                {/* Title */}
                <h3
                  className="font-bold text-lg leading-snug mb-3 group-hover:text-[var(--color-primary)] transition-colors"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
                >
                  <a href="#">{card.title}</a>
                </h3>

                {/* Excerpt */}
                <p
                  className="text-sm leading-relaxed mb-5 line-clamp-3"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
                  }}
                >
                  {card.excerpt}
                </p>

                {/* Author + Date */}
                <div
                  className="flex items-center gap-2 pt-4 text-xs font-medium"
                  style={{
                    borderTop: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
                    color: "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <span>{card.author}</span>
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: "color-mix(in srgb, var(--color-text, #0f172a) 30%, transparent)" }}
                  />
                  <span>{card.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
