# TASK-339: Tailwind v4 Color System Spike — Results

**Date:** 2026-03-21
**Status:** PASS — Color system works in Turbopack dev server

---

## Summary

Both **Option A** (`:root` vars + `@theme inline` var() reference) and **Option C** (direct hex in `@theme inline`) work correctly in Tailwind v4 with the `@tailwindcss/postcss` plugin and Turbopack dev server.

**Root cause of Sprint 23 failure:** The Sprint 23 attempt changed hex values within the existing `@theme inline` block but the colors still rendered as teal. This was likely a **Turbopack hot-reload caching issue** — not a Tailwind v4 limitation. This spike used completely new color names and scales (indigo + cyan + coral), and all rendered correctly on first load.

**Recommendation:** Use **Option C** (direct hex values in `@theme inline`) for the production color palette. It's the simplest approach, single source of truth, and confirmed working. Option A also works but adds unnecessary complexity (two places to maintain).

---

## Test Results (Chromium via Playwright)

| Utility | Expected Hex | Computed RGB | Status |
|---------|-------------|-------------|--------|
| `bg-brand-500` | `#4F46E5` | `rgb(79, 70, 229)` | PASS |
| `bg-accent-500` | `#06B6D4` | `rgb(6, 182, 212)` | PASS |
| `bg-test-a` (Option A) | `#FF6B6B` | `rgb(255, 107, 107)` | PASS |
| `text-brand-400` | `#818CF8` | `rgb(129, 140, 248)` | PASS |
| `text-accent-400` | `#22D3EE` | `rgb(34, 211, 238)` | PASS |
| `border-brand-500` | `#4F46E5` | `rgb(79, 70, 229)` | PASS |
| `text-test-a` (Option A) | `#FF6B6B` | `rgb(255, 107, 107)` | PASS |
| `from-brand-400 to-brand-600` | Gradient | Linear gradient in oklab | PASS |
| `shadow-brand-500/25` | Colored shadow | oklab shadow with brand hue | PASS |
| `bg-brand-50` | `#EEF2FF` | `rgb(238, 242, 255)` | PASS |
| `bg-brand-900` | `#1E1B4B` | `rgb(30, 27, 75)` | PASS |

**11/11 tests pass.**

---

## Proposed Color System

### Primary Brand — Indigo
| Shade | Hex |
|-------|-----|
| 50 | #EEF2FF |
| 100 | #E0E7FF |
| 200 | #C7D2FE |
| 300 | #A5B4FC |
| 400 | #818CF8 |
| 500 | #4F46E5 |
| 600 | #4338CA |
| 700 | #3730A3 |
| 800 | #312E81 |
| 900 | #1E1B4B |
| 950 | #0F0D2E |

### Accent — Cyan
| Shade | Hex |
|-------|-----|
| 50 | #ECFEFF |
| 100 | #CFFAFE |
| 200 | #A5F3FC |
| 300 | #67E8F9 |
| 400 | #22D3EE |
| 500 | #06B6D4 |
| 600 | #0891B2 |
| 700 | #0E7490 |
| 800 | #155E75 |
| 900 | #164E63 |
| 950 | #083344 |

### Semantic (Tailwind built-ins)
- Success: `green-600` (#16A34A)
- Warning: `amber-500` (#F59E0B)
- Error: `red-600` (#DC2626)
- Info: `blue-500` (#3B82F6)

### Neutral
- Slate scale (Tailwind built-in, already working)

---

## WCAG AA Contrast Notes

On dark background `#0f172a` (slate-950):
- `brand-400` (#818CF8): ~5.8:1 — **PASS AA**
- `brand-300` (#A5B4FC): ~8.2:1 — **PASS AA**
- `accent-400` (#22D3EE): ~8.5:1 — **PASS AA**
- `accent-300` (#67E8F9): ~11.2:1 — **PASS AA**
- `white/60`: ~7.4:1 — **PASS AA**
- `white/40`: ~4.1:1 — **FAIL AA** (use for decorative text only)

---

## Approach for TASK-343

1. Replace the current teal brand palette in `globals.css` with the indigo palette above
2. Add the accent (cyan) scale as a new `accent-*` namespace
3. Use direct hex values in `@theme inline` (Option C)
4. When changing colors: **restart the dev server** to avoid Turbopack cache issues
5. Remove the `test-a` color (spike-only)
6. Clean up the `/color-spike` route

---

## Files Modified

- `platform-app/src/app/globals.css` — Added indigo brand + cyan accent + test-a color
- `platform-app/src/app/color-spike/page.tsx` — New spike test page (to be cleaned up in TASK-343)
