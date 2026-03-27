"use client";

/**
 * CSS-only crossfade carousel showing generated site screenshots.
 * 4 images: 4s visible, 1s crossfade each = 20s total cycle.
 * Fallback: first image only (prefers-reduced-motion or missing images).
 */

const SHOWCASE_IMAGES = [
  { src: "/showcase/showcase-restaurant.webp", alt: "AI-generated restaurant website" },
  { src: "/showcase/showcase-consultant.webp", alt: "AI-generated consulting website" },
  { src: "/showcase/showcase-portfolio.webp", alt: "AI-generated portfolio website" },
  { src: "/showcase/showcase-ecommerce.webp", alt: "AI-generated ecommerce website" },
];

export default function ShowcaseCarousel() {
  const count = SHOWCASE_IMAGES.length;
  const cycleDuration = count * 5; // 5s per image (4s visible + 1s fade)

  return (
    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden shadow-2xl shadow-brand-900/50">
      <style>{`
        @keyframes showcase-fade {
          0%, ${100 / count - 2}% { opacity: 1; }
          ${100 / count}%, ${100 - 100 / count}% { opacity: 0; }
          ${100 - 2}%, 100% { opacity: 1; }
        }
        .showcase-img {
          animation: showcase-fade ${cycleDuration}s infinite;
        }
        ${SHOWCASE_IMAGES.map((_, i) => `
          .showcase-img:nth-child(${i + 1}) {
            animation-delay: ${i * (cycleDuration / count)}s;
            ${i === 0 ? "" : "opacity: 0;"}
          }
        `).join("")}
        @media (prefers-reduced-motion: reduce) {
          .showcase-img { animation: none !important; }
          .showcase-img:not(:first-child) { display: none; }
        }
      `}</style>

      {SHOWCASE_IMAGES.map((img, i) => (
        <div
          key={i}
          className="showcase-img absolute inset-0 bg-slate-800"
        >
          {/* Using a gradient placeholder since actual screenshots aren't generated yet */}
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${
                ["#1e1b4b, #312e81", "#0f172a, #1e3a5f", "#1a1a2e, #16213e", "#0d1117, #161b22"][i]
              })`,
            }}
            role="img"
            aria-label={img.alt}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-lg bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <p className="text-white/20 text-xs">{img.alt.replace("AI-generated ", "")}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
