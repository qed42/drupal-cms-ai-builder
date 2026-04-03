interface GalleryMasonryProps {
  section_title?: string;
  image_1?: string;
  image_2?: string;
  image_3?: string;
  image_4?: string;
  image_5?: string;
  image_6?: string;
  caption_1?: string;
  caption_2?: string;
  caption_3?: string;
  caption_4?: string;
  caption_5?: string;
  caption_6?: string;
}

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80",
];

const PLACEHOLDER_CAPTIONS = [
  "Mountain sunrise",
  "Abstract light",
  "Field in bloom",
  "Forest path",
  "Ocean cliff",
  "Golden hour",
];

export default function GalleryMasonry({
  section_title = "A world worth exploring",
  image_1,
  image_2,
  image_3,
  image_4,
  image_5,
  image_6,
  caption_1,
  caption_2,
  caption_3,
  caption_4,
  caption_5,
  caption_6,
}: GalleryMasonryProps) {
  const items = [
    { src: image_1 || PLACEHOLDER_IMAGES[0], caption: caption_1 || PLACEHOLDER_CAPTIONS[0] },
    { src: image_2 || PLACEHOLDER_IMAGES[1], caption: caption_2 || PLACEHOLDER_CAPTIONS[1] },
    { src: image_3 || PLACEHOLDER_IMAGES[2], caption: caption_3 || PLACEHOLDER_CAPTIONS[2] },
    { src: image_4 || PLACEHOLDER_IMAGES[3], caption: caption_4 || PLACEHOLDER_CAPTIONS[3] },
    { src: image_5 || PLACEHOLDER_IMAGES[4], caption: caption_5 || PLACEHOLDER_CAPTIONS[4] },
    { src: image_6 || PLACEHOLDER_IMAGES[5], caption: caption_6 || PLACEHOLDER_CAPTIONS[5] },
  ];

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "var(--color-surface, #fff)" }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
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

        {/* Masonry grid via CSS columns */}
        <div
          className="fade-in"
          style={{
            columnCount: 1,
            columnGap: "1.25rem",
          }}
        >
          <style>{`
            @media (min-width: 640px) {
              .masonry-grid { column-count: 2 !important; }
            }
            @media (min-width: 1024px) {
              .masonry-grid { column-count: 3 !important; }
            }
          `}</style>
          <div className="masonry-grid" style={{ columnCount: 1, columnGap: "1.25rem" }}>
            {items.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl mb-5 cursor-pointer"
                style={{
                  breakInside: "avoid",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                }}
              >
                <img
                  src={item.src}
                  alt={item.caption}
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-110"
                  style={{ display: "block" }}
                />
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)",
                  }}
                >
                  <p
                    className="text-white text-sm font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.caption}
                  </p>
                </div>
                {/* Subtle color accent on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{ background: "var(--color-primary)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
