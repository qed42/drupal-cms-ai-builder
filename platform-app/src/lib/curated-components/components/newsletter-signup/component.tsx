"use client";
import { useState } from "react";

interface NewsletterSignupProps {
  heading?: string;
  description?: string;
  button_text?: string;
  trust_text?: string;
}

export default function NewsletterSignup({
  heading = "Stay in the loop",
  description = "Get product updates, engineering deep-dives, and early access to new features. One email every two weeks. Unsubscribe anytime.",
  button_text = "Subscribe",
  trust_text = "No spam, ever. We respect your inbox.",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section
      className="py-16 md:py-24"
      style={{
        background: "color-mix(in srgb, var(--color-primary) 5%, var(--color-surface, #fff))",
        borderTop: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
        borderBottom: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          {/* Icon */}
          <div
            className="animate-on-scroll scale-in w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--color-primary)" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 8l8 5 8-5M3 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2
            className="animate-on-scroll fade-up text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
          >
            {heading}
          </h2>
          <p
            className="animate-on-scroll fade-up text-base md:text-lg leading-relaxed mb-8"
            style={{
              fontFamily: "var(--font-body)",
              color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
              "--stagger-index": "1",
            } as React.CSSProperties}
          >
            {description}
          </p>

          {submitted ? (
            <div
              className="fade-in rounded-xl px-6 py-5 flex items-center gap-3 justify-center"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10l4.5 4.5L16 6" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                You're subscribed! Talk soon.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="animate-on-scroll fade-up"
              style={{ "--stagger-index": "2" } as React.CSSProperties}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="flex-1 px-4 py-3 rounded-xl text-base outline-none transition-all"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: "var(--color-surface, #fff)",
                    border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 15%, transparent)",
                    color: "var(--color-text, #0f172a)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--color-primary) 30%, transparent)";
                    (e.target as HTMLInputElement).style.borderColor = "var(--color-primary)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                    (e.target as HTMLInputElement).style.borderColor = "color-mix(in srgb, var(--color-text, #0f172a) 15%, transparent)";
                  }}
                />
                <button
                  type="submit"
                  className="hover-scale px-6 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-opacity hover:opacity-90"
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {button_text}
                </button>
              </div>
            </form>
          )}

          {trust_text && (
            <p
              className="mt-4 text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "color-mix(in srgb, var(--color-text, #0f172a) 40%, transparent)",
              }}
            >
              {trust_text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
