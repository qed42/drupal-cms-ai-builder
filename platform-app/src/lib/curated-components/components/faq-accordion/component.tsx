"use client";
import { useState } from "react";
import "./styles.css";

interface FaqAccordionProps {
  section_title?: string;
  section_desc?: string;
  q_1?: string;
  a_1?: string;
  q_2?: string;
  a_2?: string;
  q_3?: string;
  a_3?: string;
  q_4?: string;
  a_4?: string;
  q_5?: string;
  a_5?: string;
}

export default function FaqAccordion({
  section_title = "Frequently Asked Questions",
  section_desc = "Everything you need to know about the product and billing. Can't find the answer you're looking for? Reach out to our support team.",
  q_1 = "How does the free trial work?",
  a_1 = "You get full access to all features for 14 days, no credit card required. At the end of the trial you can choose a plan that fits your needs or cancel without any charge.",
  q_2 = "Can I change my plan later?",
  a_2 = "Absolutely. You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately and we'll prorate any billing differences.",
  q_3 = "What payment methods do you accept?",
  a_3 = "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and for annual enterprise plans we also support bank transfers and purchase orders.",
  q_4 = "Is my data secure?",
  a_4 = "Security is our top priority. All data is encrypted in transit and at rest using AES-256 encryption. We are SOC 2 Type II certified and undergo regular third-party security audits.",
  q_5 = "Do you offer refunds?",
  a_5 = "Yes. If you're not satisfied within the first 30 days of a paid plan, contact us for a full refund. After 30 days, refunds are handled on a case-by-case basis.",
}: FaqAccordionProps) {
  const items = [
    { q: q_1, a: a_1 },
    { q: q_2, a: a_2 },
    { q: q_3, a: a_3 },
    { q: q_4, a: a_4 },
    { q: q_5, a: a_5 },
  ];

  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--color-surface, #fff)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
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

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-0">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="fade-up"
                style={{ "--stagger-index": index } as React.CSSProperties}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left transition-colors group"
                  style={{
                    borderBottom: isOpen
                      ? "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)"
                      : "1px solid color-mix(in srgb, var(--color-text, #0f172a) 10%, transparent)",
                    borderLeft: isOpen ? "3px solid var(--color-primary)" : "3px solid transparent",
                    paddingLeft: isOpen ? "16px" : "0px",
                    transition: "border-color 0.25s ease, padding 0.25s ease",
                  }}
                  aria-expanded={isOpen}
                >
                  <span
                    className="text-base md:text-lg font-semibold"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: isOpen ? "var(--color-primary)" : "var(--color-text, #0f172a)",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {item.q}
                  </span>
                  {/* Chevron */}
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      background: isOpen
                        ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
                        : "color-mix(in srgb, var(--color-text, #0f172a) 6%, transparent)",
                    }}
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 5L7 9.5L11.5 5"
                        stroke={isOpen ? "var(--color-primary)" : "currentColor"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                {/* Answer with smooth max-height transition */}
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? "400px" : "0px",
                    transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <p
                    className="py-4 text-base leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "color-mix(in srgb, var(--color-text, #0f172a) 65%, transparent)",
                      paddingLeft: "4px",
                    }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
