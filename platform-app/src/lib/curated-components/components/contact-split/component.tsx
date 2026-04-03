"use client";
import { useState } from "react";

interface ContactSplitProps {
  heading?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  form_heading?: string;
}

export default function ContactSplit({
  heading = "Get in Touch",
  description = "Have a question, a partnership idea, or just want to say hello? We'd love to hear from you. Our team typically responds within one business day.",
  address = "340 Pine Street, Suite 800\nSan Francisco, CA 94104",
  phone = "+1 (415) 555-0192",
  email = "hello@company.com",
  form_heading = "Send us a message",
}: ContactSplitProps) {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.email && formState.message) {
      setSubmitted(true);
    }
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    background: "color-mix(in srgb, var(--color-text, #0f172a) 4%, var(--color-surface, #fff))",
    border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 12%, transparent)",
    color: "var(--color-text, #0f172a)",
    width: "100%",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--color-primary)";
    e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "color-mix(in srgb, var(--color-text, #0f172a) 12%, transparent)";
    e.target.style.boxShadow = "none";
  };

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--color-surface, #fff)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left: Contact info */}
          <div className="slide-left">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
            >
              {heading}
            </h2>
            <p
              className="text-lg leading-relaxed mb-10"
              style={{
                fontFamily: "var(--font-body)",
                color: "color-mix(in srgb, var(--color-text, #0f172a) 60%, transparent)",
              }}
            >
              {description}
            </p>

            {/* Contact details */}
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M9 1C6.24 1 4 3.24 4 6c0 4 5 11 5 11s5-7 5-11c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 9 4a1.5 1.5 0 0 1 0 3.5z" fill="var(--color-primary)" />
                  </svg>
                </div>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{
                      color: "color-mix(in srgb, var(--color-text, #0f172a) 40%, transparent)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Address
                  </p>
                  <p
                    className="text-base leading-relaxed whitespace-pre-line"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text, #0f172a)" }}
                  >
                    {address}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M16.5 12.86l-3.5-1.5a1 1 0 0 0-1.17.29l-1.5 1.83a13.15 13.15 0 0 1-6.3-6.3l1.83-1.5A1 1 0 0 0 6.15 4.5L4.64 1C4.38.42 3.73.13 3.14.38l-2.5 1A1 1 0 0 0 0 2.25C0 10.93 7.07 18 15.75 18a1 1 0 0 0 .94-.64l1-2.5c.24-.6-.05-1.26-.19-1z" fill="var(--color-primary)" />
                  </svg>
                </div>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{
                      color: "color-mix(in srgb, var(--color-text, #0f172a) 40%, transparent)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Phone
                  </p>
                  <a
                    href={`tel:${phone}`}
                    className="text-base hover:underline"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}
                  >
                    {phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M1 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4zm1 0l7 5 7-5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{
                      color: "color-mix(in srgb, var(--color-text, #0f172a) 40%, transparent)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="text-base hover:underline"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}
                  >
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div
            className="slide-right rounded-2xl p-8"
            style={{
              background: "color-mix(in srgb, var(--color-text, #0f172a) 3%, var(--color-surface, #fff))",
              border: "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <h3
              className="text-xl font-bold mb-6"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
            >
              {form_heading}
            </h3>

            {submitted ? (
              <div
                className="fade-in text-center py-10 rounded-xl"
                style={{
                  background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--color-primary)" }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <path d="M4 11l5 5L18 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p
                  className="font-semibold text-lg mb-1"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #0f172a)" }}
                >
                  Message sent!
                </p>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "color-mix(in srgb, var(--color-text, #0f172a) 55%, transparent)",
                  }}
                >
                  We'll get back to you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text, #0f172a)" }}
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text, #0f172a)" }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="jane@company.com"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text, #0f172a)" }}
                  >
                    Message
                  </label>
                  <textarea
                    placeholder="Tell us how we can help…"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <button
                  type="submit"
                  className="hover-lift w-full py-3.5 rounded-xl font-semibold text-base transition-opacity hover:opacity-90"
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
