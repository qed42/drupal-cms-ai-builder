"use client";
import { useState } from "react";
import "./styles.css";

interface VideoEmbedProps {
  section_title?: string;
  section_desc?: string;
  video_thumbnail?: string;
  video_url?: string;
}

export default function VideoEmbed({
  section_title = "See It in Action",
  section_desc = "Watch how teams go from idea to production in minutes — not days. Real product, real workflows, zero fluff.",
  video_thumbnail = "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=1600&q=80",
  video_url = "https://www.youtube.com/embed/dQw4w9WgXcQ",
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      className="py-16 md:py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 8%, var(--color-surface, #fff)) 0%, var(--color-surface, #fff) 60%)",
      }}
    >
      {/* Decorative bg orbs */}
      <div
        className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--color-accent, var(--color-primary)) 8%, transparent)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2
            className="animate-on-scroll fade-up text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
          >
            {section_title}
          </h2>
          <p
            className="animate-on-scroll fade-up text-lg leading-relaxed"
            style={{
              fontFamily: "var(--font-body)",
              color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
              "--stagger-index": "1",
            } as React.CSSProperties}
          >
            {section_desc}
          </p>
        </div>

        {/* Video container */}
        <div
          className="fade-up relative mx-auto rounded-2xl overflow-hidden"
          style={{
            maxWidth: "900px",
            aspectRatio: "16 / 9",
            boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-text, #0f172a) 10%, transparent), 0 24px 64px rgba(0,0,0,0.18)",
          }}
        >
          {/* Glow behind the frame */}
          <div
            className="absolute -inset-4 rounded-3xl blur-2xl pointer-events-none z-0"
            style={{ background: "color-mix(in srgb, var(--color-primary) 18%, transparent)" }}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full h-full">
            {!playing ? (
              <>
                {/* Thumbnail */}
                <img
                  src={video_thumbnail}
                  alt="Video thumbnail"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* Dark overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.45))" }}
                />
                {/* Play button */}
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play video"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "var(--color-primary)",
                      boxShadow: "0 0 0 16px color-mix(in srgb, var(--color-primary) 20%, transparent)",
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 28 28"
                      fill="none"
                      aria-hidden="true"
                      style={{ marginLeft: "4px" }}
                    >
                      <path d="M7 4.5L23 14L7 23.5V4.5Z" fill="white" />
                    </svg>
                  </div>
                </button>
              </>
            ) : (
              <iframe
                src={`${video_url}?autoplay=1`}
                title={section_title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
