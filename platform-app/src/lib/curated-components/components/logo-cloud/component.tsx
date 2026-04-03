import "./styles.css";

interface LogoCloudProps {
  section_title?: string;
  logo_1?: string;
  logo_2?: string;
  logo_3?: string;
  logo_4?: string;
  logo_5?: string;
  logo_6?: string;
}

const PLACEHOLDER_LOGOS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1200px-IBM_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png",
];

export default function LogoCloud({
  section_title = "Trusted by teams at world-class companies",
  logo_1 = PLACEHOLDER_LOGOS[0],
  logo_2 = PLACEHOLDER_LOGOS[1],
  logo_3 = PLACEHOLDER_LOGOS[2],
  logo_4 = PLACEHOLDER_LOGOS[3],
  logo_5 = PLACEHOLDER_LOGOS[4],
  logo_6 = PLACEHOLDER_LOGOS[5],
}: LogoCloudProps) {
  const logos = [
    { src: logo_1, alt: "Partner logo 1" },
    { src: logo_2, alt: "Partner logo 2" },
    { src: logo_3, alt: "Partner logo 3" },
    { src: logo_4, alt: "Partner logo 4" },
    { src: logo_5, alt: "Partner logo 5" },
    { src: logo_6, alt: "Partner logo 6" },
  ];

  return (
    <section
      className="py-14 md:py-20"
      style={{
        background: "color-mix(in srgb, var(--color-text, #0f172a) 3%, var(--color-surface, #fff))",
        borderTop: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 7%, transparent)",
        borderBottom: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 7%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Title */}
        <p
          className="animate-on-scroll fade-up text-center text-sm font-semibold uppercase tracking-widest mb-10"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text, #0f172a)",
            opacity: 0.45,
          }}
        >
          {section_title}
        </p>
        {/* Subtle divider accent using brand color */}
        <div
          className="w-12 h-0.5 mx-auto mb-8 rounded-full"
          style={{ background: "var(--color-primary)", opacity: 0.3 }}
          aria-hidden="true"
        />
        {/* Sub-label */}
        <p className="sr-only" style={{ fontFamily: "var(--font-body)" }}>Logo grid</p>

        {/* Logo grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="fade-in logo-cloud-item flex items-center justify-center p-4 rounded-xl"
              style={{
                "--stagger-index": index,
                transition: "background 0.3s ease",
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "color-mix(in srgb, var(--color-primary) 6%, transparent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-8 w-auto object-contain logo-cloud-img"
                style={{
                  filter: "grayscale(100%) opacity(0.45)",
                  transition: "filter 0.3s ease",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
