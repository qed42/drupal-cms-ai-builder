# TASK-107: Wizard Screen 6 — Brand Assets (Logo + Color Extraction)

**Story:** US-007 (Brand Input)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M2 — Onboarding Journey

## Description
Implement Screens 7-8 from Figma: "Give it a face." — logo upload, color palette reference upload, and automatic color extraction. The extracted colors display as editable swatches above the upload area.

## Technical Approach
- **Screen (`/onboarding/brand`):**
  - Title: "Give it a face."
  - Subtitle: "Drop your logo, brand kit, or inspiration. We'll extract the colors and typography to shape your preview."
  - Two dashed-border upload zones side-by-side:
    1. "Add logo" — accepts PNG/JPG/SVG, max 5MB
    2. "Add color palette reference" — accepts PNG/JPG/PDF, max 10MB
  - Uploads go to platform storage (local dev: `public/uploads/`, prod: S3)
  - After upload, show filename + "Remove" link (per Figma filled state)
  - "+" button to add additional reference files
  - **Color extraction:** After logo or palette upload, call `/api/ai/extract-colors`
  - Extracted colors render as editable circle swatches with hex codes
  - "+" button to add manual color
  - Colors are editable (click to open color picker)
  - Button: "Plan the Structure →"
  - Save to onboarding_sessions.data: `logo_url`, `palette_url`, `colors: { primary, secondary, accent, ... }`

- **API Route: `/api/ai/extract-colors`**
  - For logos (PNG/JPG): Use `node-vibrant` library for fast extraction (no AI cost)
  - For palette PDFs/complex images: Use OpenAI Vision API to identify colors
  - Returns array of `{ hex, role }` (e.g., `{ hex: "#00F1C6", role: "primary" }`)

## Acceptance Criteria
- [ ] Logo upload works (PNG/JPG/SVG, max 5MB)
- [ ] Palette reference upload works (PNG/JPG/PDF, max 10MB)
- [ ] Uploading a logo triggers color extraction
- [ ] Extracted colors display as circle swatches with hex codes
- [ ] User can adjust extracted colors via color picker
- [ ] User can add additional colors manually
- [ ] "Remove" removes uploaded file
- [ ] All data saved to onboarding_sessions.data
- [ ] Visual matches Figma Screens 7-8

## Dependencies
- TASK-102 (Wizard framework)

## Files/Modules Affected
- `platform-app/src/app/(onboarding)/brand/page.tsx`
- `platform-app/src/app/api/ai/extract-colors/route.ts`
- `platform-app/src/app/api/upload/route.ts`
- `platform-app/src/components/onboarding/FileUploadZone.tsx`
- `platform-app/src/components/onboarding/ColorSwatch.tsx`
- `platform-app/src/lib/ai/color-extraction.ts`
