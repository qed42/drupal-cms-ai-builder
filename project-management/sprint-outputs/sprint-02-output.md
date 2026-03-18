# Sprint 02 Output: Onboarding Journey — AI & Brand (v2)

**Completed:** 2026-03-18
**Architecture:** v2 (Split Platform — Next.js)

## Tasks Delivered

### TASK-104: AI Industry Inference & Page Suggestion — DONE
- OpenAI SDK installed and configured via `src/lib/ai/client.ts`
- AI prompts for analysis and page suggestion in `src/lib/ai/prompts.ts`
- **`POST /api/ai/analyze`**: Analyzes business idea + audience, returns industry, keywords, compliance_flags, tone
  - Structured JSON output via OpenAI gpt-4o-mini
  - Keyword-based fallback when AI call fails (regex matching for healthcare, legal, real_estate, etc.)
  - Results auto-saved to onboarding_sessions.data
- **`POST /api/ai/suggest-pages`**: Returns 5-8 industry-appropriate page suggestions
  - Industry-specific default page sets (healthcare: providers, legal: practice-areas, etc.)
  - Fallback to defaults on AI failure
  - Results saved as suggested_pages to onboarding_sessions.data

### TASK-105: Wizard Screen 4 — Page Map — DONE
- Screen at `/onboarding/pages` with title "Let's map your site."
- Auto-triggers AI analysis on first visit (analyze → suggest-pages chain)
- Shows loading spinner during AI processing
- AI-suggested pages render as removable blue pill/chip components
- "Add page +" button with inline text input for custom pages
- Minimum 3 pages / maximum 12 pages enforced
- Button: "Shape the Experience →"
- Saves final page list to onboarding_sessions.data.pages

### TASK-106: Wizard Screen 5 — Design Source Selection — DONE
- Screen at `/onboarding/design` with title "How should it feel?"
- Two side-by-side selectable cards:
  - "Provide Figma details" — disabled with "Coming soon" badge
  - "Let Space AI choose" — default selected, selectable
- Checkmark indicator on selected card
- Saves design_source to onboarding_sessions.data
- Button: "Shape the Experience →"

### TASK-107: Wizard Screen 6 — Brand Assets + Color Extraction — DONE
- Screen at `/onboarding/brand` with title "Give it a face."
- Two dashed-border upload zones (logo + palette reference)
- **File upload API** (`POST /api/upload`):
  - Supports logo (PNG/JPG/SVG, 5MB), palette (PNG/JPG/PDF, 10MB), font (WOFF/WOFF2/TTF/OTF) types
  - Files saved to `public/uploads/{userId}/` with timestamp prefix
  - Type and extension validation
- **Color extraction API** (`POST /api/ai/extract-colors`):
  - node-vibrant for PNG/JPG logo extraction (6 palette roles: vibrant, dark/light vibrant, muted, dark/light muted)
  - OpenAI Vision API for palette PDFs/complex images
  - Fallback defaults on failure
- Extracted colors display as editable circle swatches with hex codes and role labels
- Click swatch to open native color picker
- "+" button to add manual colors
- Remove button (hover) on swatches
- "Remove" link on uploaded files
- All data saved: logo_url, palette_url, colors map

### TASK-108: Wizard Screen 7 — Font Selection — DONE
- Screen at `/onboarding/fonts` with title "Select a font"
- 4 preview tiles (2×2 grid) showing "Aa" with user's brand colors and selected fonts
- Dynamic Google Fonts loading for real-time preview
- Heading + body font dropdowns (8 Google Fonts: Nunito Sans, Montserrat, Playfair Display, Inter, Roboto, Lato, Poppins, Raleway)
- Font preview tiles update in real-time when selection changes
- Custom font upload zone (WOFF/WOFF2/TTF/OTF)
- Button: "Visualize my site →" (marks onboarding complete)
- Saves fonts.heading, fonts.body, custom_fonts to onboarding_sessions.data

## Updated Files

- `src/lib/onboarding-steps.ts` — Added pages, design, brand, fonts steps
- `src/app/onboarding/audience/page.tsx` — Updated redirect to /onboarding/pages

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compiles without errors | PASS |
| Build completes (`next build`) | PASS |
| All 7 wizard routes registered | PASS |
| AI analyze API route available | PASS |
| AI suggest-pages API route available | PASS |
| AI extract-colors API route available | PASS |
| Upload API route available | PASS |
| Step navigation flows correctly | PASS |
| ProgressDots shows 8 steps | PASS |

## New Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| openai | latest | OpenAI API client for AI inference |
| node-vibrant | latest | Color extraction from images |

## Files Created

```
platform-app/src/
├── lib/
│   ├── ai/
│   │   ├── client.ts           (OpenAI client singleton)
│   │   ├── prompts.ts          (AI prompts + industry defaults)
│   │   └── color-extraction.ts (node-vibrant + Vision API extraction)
│   └── fonts.ts                (Google Fonts config)
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── analyze/route.ts
│   │   │   ├── suggest-pages/route.ts
│   │   │   └── extract-colors/route.ts
│   │   └── upload/route.ts
│   └── onboarding/
│       ├── pages/page.tsx
│       ├── design/page.tsx
│       ├── brand/page.tsx
│       └── fonts/page.tsx
└── components/onboarding/
    ├── PageChip.tsx
    ├── DesignOptionCard.tsx
    ├── FileUploadZone.tsx
    ├── ColorSwatch.tsx
    ├── FontPreviewTile.tsx
    └── FontSelector.tsx
```

## Next Steps
- Invoke `/qa sprint-02` for Playwright test automation
- Sprint 03: Blueprint generation triggered by "Visualize my site"
- Set `OPENAI_API_KEY` in `.env.local` for AI features to work
