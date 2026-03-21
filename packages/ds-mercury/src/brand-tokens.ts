import type { BrandTokens, BrandPayload } from "@ai-builder/ds-types";

/**
 * Convert a hex color to OKLCH CSS string.
 * Simplified conversion — uses approximation for OKLCH values.
 */
function hexToOklch(hex: string): string {
  // Remove # prefix
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  // Convert to linear RGB
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // Convert to CIE XYZ
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;

  // XYZ to Lab (approximate)
  const cbrt = (v: number) => Math.cbrt(v);
  const l_ = cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Lab to LCH
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(4)} ${H.toFixed(1)})`;
}

/**
 * Map abstract BrandTokens to a Mercury theme.css file using OKLCH CSS custom properties.
 */
export function prepareBrandPayload(tokens: BrandTokens): BrandPayload {
  const primary = tokens.colors.primary;
  const secondary = tokens.colors.secondary;
  const accent = tokens.colors.accent ?? tokens.colors.primary;
  const neutral = tokens.colors.neutral ?? "#6b7280";
  const background = tokens.colors.background ?? "#ffffff";

  const css = `/* Mercury Theme — Generated Brand Tokens */
/* Uses OKLCH color space for perceptual uniformity */

:root {
  /* Brand Colors (OKLCH) */
  --color-primary: ${hexToOklch(primary)};
  --color-secondary: ${hexToOklch(secondary)};
  --color-accent: ${hexToOklch(accent)};
  --color-neutral: ${hexToOklch(neutral)};
  --color-background: ${hexToOklch(background)};

  /* Brand Colors (Hex fallbacks) */
  --color-primary-hex: ${primary};
  --color-secondary-hex: ${secondary};
  --color-accent-hex: ${accent};
  --color-neutral-hex: ${neutral};
  --color-background-hex: ${background};

  /* Semantic Surface Colors */
  --color-surface: ${hexToOklch(background)};
  --color-surface-muted: oklch(from var(--color-neutral) 95% 0.01 h);
  --color-surface-primary: oklch(from var(--color-primary) 95% 0.02 h);
  --color-surface-secondary: oklch(from var(--color-secondary) 95% 0.02 h);

  /* Text Colors */
  --color-text: oklch(20% 0 0);
  --color-text-muted: oklch(from var(--color-neutral) 40% 0.01 h);
  --color-text-on-primary: oklch(98% 0 0);
  --color-text-on-secondary: oklch(98% 0 0);

  /* Typography */
  --font-heading: ${tokens.fonts.heading ?? "system-ui, sans-serif"};
  --font-body: ${tokens.fonts.body ?? "system-ui, sans-serif"};

  /* Border */
  --color-border: oklch(from var(--color-neutral) 85% 0.005 h);
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-radius-full: 9999px;

  /* Spacing Scale */
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4rem;
}
`;

  return {
    type: "css-file",
    path: "themes/contrib/mercury/css/theme.css",
    content: css,
  };
}
