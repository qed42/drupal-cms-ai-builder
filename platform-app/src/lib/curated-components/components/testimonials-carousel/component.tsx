"use client";

import { useState } from "react";

interface TestimonialsCarouselProps {
  quote_1?: string;
  author_1?: string;
  role_1?: string;
  quote_2?: string;
  author_2?: string;
  role_2?: string;
  quote_3?: string;
  author_3?: string;
  role_3?: string;
}

export default function TestimonialsCarousel({
  quote_1 = "This platform completely changed how our team ships products. What used to take weeks now takes hours. I genuinely can't imagine going back.",
  author_1 = "Sarah Chen",
  role_1 = "VP of Engineering, Stripe",
  quote_2 = "The design quality is exceptional. Our conversion rates jumped 40% within the first month. The team was blown away by how polished everything looked.",
  author_2 = "Marcus Williams",
  role_2 = "Head of Growth, Linear",
  quote_3 = "We evaluated a dozen tools before landing here. Nothing else comes close to the depth of integrations and the quality of the developer experience.",
  author_3 = "Priya Patel",
  role_3 = "CTO, Vercel",
}: TestimonialsCarouselProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const testimonials = [
    { quote: quote_1, author: author_1, role: role_1 },
    { quote: quote_2, author: author_2, role: role_2 },
    { quote: quote_3, author: author_3, role: role_3 },
  ].filter((t) => t.quote && t.author);

  const count = testimonials.length;

  const go = (idx: number, dir: "next" | "prev") => {
    setDirection(dir);
    setActive((idx + count) % count);
  };

  const current = testimonials[active];

  return (
    <section
      className="py-16 md:py-24 overflow-hidden"
      style={{ background: "var(--color-surface, #fff)" }}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Decorative large quote mark */}
        <div
          className="text-center mb-8 select-none"
          aria-hidden="true"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "8rem",
            lineHeight: "1",
            color: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
          }}
        >
          &ldquo;
        </div>

        {/* Testimonial card */}
        <div className="relative text-center">
          <blockquote
            key={active}
            className="fade-in"
            style={{ animation: "testimonialFadeIn 0.45s ease both" }}
          >
            <p
              className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed mb-10"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-text, #0f172a)",
              }}
            >
              {current?.quote}
            </p>

            {/* Author */}
            <footer className="flex flex-col items-center gap-2">
              {/* Avatar placeholder */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary), var(--color-accent, var(--color-primary)))",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {current?.author?.charAt(0) || "?"}
              </div>
              <cite
                className="not-italic font-semibold text-base"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text, #0f172a)",
                }}
              >
                {current?.author}
              </cite>
              <p
                className="text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)",
                }}
              >
                {current?.role}
              </p>
            </footer>
          </blockquote>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-center gap-6">
          {/* Prev */}
          <button
            onClick={() => go(active - 1, "prev")}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              border: "1.5px solid color-mix(in srgb, var(--color-text, #0f172a) 15%, transparent)",
              color: "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-primary)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "color-mix(in srgb, var(--color-text, #0f172a) 15%, transparent)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > active ? "next" : "prev")}
                aria-label={`Go to testimonial ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === active ? "24px" : "8px",
                  height: "8px",
                  background: i === active
                    ? "var(--color-primary)"
                    : "color-mix(in srgb, var(--color-text, #0f172a) 18%, transparent)",
                }}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => go(active + 1, "next")}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              border: "1.5px solid color-mix(in srgb, var(--color-text, #0f172a) 15%, transparent)",
              color: "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-primary)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "color-mix(in srgb, var(--color-text, #0f172a) 50%, transparent)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "color-mix(in srgb, var(--color-text, #0f172a) 15%, transparent)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
