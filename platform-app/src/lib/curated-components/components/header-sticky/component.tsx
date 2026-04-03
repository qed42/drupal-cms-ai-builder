"use client";

import { useState, useEffect } from "react";

interface HeaderStickyProps {
  brand_name?: string;
  brand_logo?: string;
  cta_text?: string;
  cta_url?: string;
  nav_1_text?: string;
  nav_1_url?: string;
  nav_2_text?: string;
  nav_2_url?: string;
  nav_3_text?: string;
  nav_3_url?: string;
  nav_4_text?: string;
  nav_4_url?: string;
}

export default function HeaderSticky({
  brand_name = "Acme",
  brand_logo,
  cta_text = "Get Started",
  cta_url = "#",
  nav_1_text = "Product",
  nav_1_url = "#",
  nav_2_text = "Pricing",
  nav_2_url = "#",
  nav_3_text = "Docs",
  nav_3_url = "#",
  nav_4_text = "Blog",
  nav_4_url = "#",
}: HeaderStickyProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { text: nav_1_text, url: nav_1_url },
    { text: nav_2_text, url: nav_2_url },
    { text: nav_3_text, url: nav_3_url },
    { text: nav_4_text, url: nav_4_url },
  ].filter((n) => n.text);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        borderBottom: scrolled
          ? "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 flex-shrink-0"
            style={{ textDecoration: "none" }}
          >
            {brand_logo ? (
              <img src={brand_logo} alt={brand_name} className="h-8 w-auto" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: "var(--color-primary)" }}
              >
                {brand_name?.charAt(0) || "A"}
              </div>
            )}
            <span
              className="font-bold text-base"
              style={{
                fontFamily: "var(--font-heading)",
                color: scrolled
                  ? "var(--color-text, #0f172a)"
                  : "var(--color-text, #0f172a)",
              }}
            >
              {brand_name}
            </span>
          </a>

          {/* Desktop nav — center */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.url || "#"}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-black/5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "color-mix(in srgb, var(--color-text, #0f172a) 70%, transparent)",
                  textDecoration: "none",
                }}
              >
                {link.text}
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={cta_url || "#"}
              className="hidden md:inline-flex hover-scale items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                fontFamily: "var(--font-body)",
                background: "var(--color-primary)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              {cta_text}
            </a>

            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-black/5"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span
                className="block w-5 h-0.5 rounded-full transition-all duration-300"
                style={{
                  background: "var(--color-text, #0f172a)",
                  transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
                }}
              />
              <span
                className="block w-5 h-0.5 rounded-full transition-all duration-300"
                style={{
                  background: "var(--color-text, #0f172a)",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="block w-5 h-0.5 rounded-full transition-all duration-300"
                style={{
                  background: "var(--color-text, #0f172a)",
                  transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: menuOpen ? "400px" : "0",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: menuOpen
            ? "1px solid color-mix(in srgb, var(--color-text, #0f172a) 8%, transparent)"
            : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link, i) => (
            <a
              key={i}
              href={link.url || "#"}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-black/5"
              style={{
                fontFamily: "var(--font-body)",
                color: "color-mix(in srgb, var(--color-text, #0f172a) 75%, transparent)",
                textDecoration: "none",
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.text}
            </a>
          ))}
          <a
            href={cta_url || "#"}
            className="mt-2 text-center px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              fontFamily: "var(--font-body)",
              background: "var(--color-primary)",
              color: "#fff",
              textDecoration: "none",
            }}
            onClick={() => setMenuOpen(false)}
          >
            {cta_text}
          </a>
        </div>
      </div>
    </header>
  );
}
