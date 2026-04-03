interface TeamGridProps {
  section_title?: string;
  member_1_name?: string;
  member_1_role?: string;
  member_1_bio?: string;
  member_1_photo?: string;
  member_2_name?: string;
  member_2_role?: string;
  member_2_bio?: string;
  member_2_photo?: string;
  member_3_name?: string;
  member_3_role?: string;
  member_3_bio?: string;
  member_3_photo?: string;
  member_4_name?: string;
  member_4_role?: string;
  member_4_bio?: string;
  member_4_photo?: string;
}

const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
];

export default function TeamGrid({
  section_title = "Meet the Team",
  member_1_name = "Sarah Chen",
  member_1_role = "CEO & Co-Founder",
  member_1_bio = "Former VP at Stripe with 12 years building developer tools. Passionate about making software accessible to everyone.",
  member_1_photo = PLACEHOLDER_PHOTOS[0],
  member_2_name = "James Okafor",
  member_2_role = "CTO & Co-Founder",
  member_2_bio = "Previously Staff Engineer at Vercel. Open-source contributor and distributed systems enthusiast.",
  member_2_photo = PLACEHOLDER_PHOTOS[1],
  member_3_name = "Priya Sharma",
  member_3_role = "Head of Design",
  member_3_bio = "Design lead from Figma and Linear. Believes that great design is invisible — it just feels right.",
  member_3_photo = PLACEHOLDER_PHOTOS[2],
  member_4_name = "Marcus Webb",
  member_4_role = "Head of Growth",
  member_4_bio = "Scaled two B2B SaaS companies from 0 to $10M ARR. Data-driven storyteller and community builder.",
  member_4_photo = PLACEHOLDER_PHOTOS[3],
}: TeamGridProps) {
  const members = [
    { name: member_1_name, role: member_1_role, bio: member_1_bio, photo: member_1_photo },
    { name: member_2_name, role: member_2_role, bio: member_2_bio, photo: member_2_photo },
    { name: member_3_name, role: member_3_role, bio: member_3_bio, photo: member_3_photo },
    { name: member_4_name, role: member_4_role, bio: member_4_bio, photo: member_4_photo },
  ];

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--color-surface, #fff)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2
            className="animate-on-scroll fade-up text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
          >
            {section_title}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 stagger-children">
          {members.map((member, index) => (
            <div
              key={index}
              className="fade-up hover-lift group rounded-2xl overflow-hidden"
              style={{
                "--stagger-index": index,
                background: "var(--color-surface, #fff)",
                border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              } as React.CSSProperties}
            >
              {/* Photo */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
                <img
                  src={member.photo}
                  alt={`${member.name}, ${member.role}`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay on hover with social placeholder */}
                <div
                  className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "color-mix(in srgb, var(--color-primary) 75%, transparent)" }}
                >
                  {/* LinkedIn icon placeholder */}
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                  {/* Twitter icon placeholder */}
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    aria-label={`${member.name} Twitter`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3
                  className="font-semibold text-base mb-0.5"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}
                >
                  {member.role}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
                  }}
                >
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
