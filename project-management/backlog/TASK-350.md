# TASK-350: SiteSkeletonPreview Component

**Story:** US-063
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M18 — UX Revamp

## Description
Build a lightweight wireframe preview component that renders a visual skeleton of the website being built. The skeleton updates reactively as users make onboarding choices (page additions, color changes, font selections).

## Technical Approach
1. Create `SiteSkeletonPreview.tsx` that renders a **contextual branded wireframe** — not generic rectangles, but a preview that feels like the user's site taking shape:

   **Visual structure:**
   ```
   ┌──────────────────────────┐
   │ ┌──[Coffee.co]────────┐  │  ← browser chrome frame
   │ │ ☰  Logo  Nav items  │  │  ← siteName + page names as nav
   │ ├─────────────────────┤  │
   │ │ ░░░░░░░░░░░░░░░░░░░ │  │  ← gradient hero using
   │ │ ░░░ HEADING ░░░░░░░ │  │    user's brand colors
   │ │ ░░░░░░░░░░░░░░░░░░░ │  │
   │ ├─────────────────────┤  │
   │ │ About  Services     │  │  ← page names from pages step
   │ │ Contact  Blog       │  │    as labeled content sections
   │ ├──[brand-500]────────┤  │  ← footer with brand color
   │ │  © 2026             │  │
   │ └─────────────────────┘  │
   └──────────────────────────┘
   ```

2. Key visual details (from designer review):
   - **Browser chrome frame**: address bar mockup showing `{siteName.toLowerCase()}.site.com`
   - **Header**: hamburger icon + site name + page names as nav items (first 3-4)
   - **Hero section**: gradient overlay using `primaryColor` (not solid fill — subtle)
   - **Heading text**: displayed in the selected `headingFont` (if loaded)
   - **Content sections**: labeled with actual page names, using `bodyFont` for labels
   - **Footer**: accent bar using `primaryColor`, copyright year
   - CSS-only rendering (no images) — rounded rectangles, gradients, text

3. State consumption:
   ```ts
   interface SiteSkeletonProps {
     siteName?: string;
     pages?: string[];
     primaryColor?: string;
     accentColor?: string;
     headingFont?: string;
     bodyFont?: string;
   }
   ```
4. Debounce updates (300ms) to prevent layout thrashing during typing
5. Smooth CSS transitions when sections are added/removed (transform + opacity)
6. Render at ~60% scale inside the preview pane
7. Handle empty state gracefully: generic placeholder when minimal data is available

## Acceptance Criteria
- [ ] Browser chrome frame shows site subdomain derived from `siteName`
- [ ] Header shows site name and page names as nav items
- [ ] Hero section uses brand `primaryColor` as gradient overlay
- [ ] Heading text renders in selected `headingFont`
- [ ] Content sections labeled with actual page names
- [ ] Page sections update dynamically when pages are added/removed
- [ ] Colors update when brand colors are selected
- [ ] Smooth CSS transitions on state changes
- [ ] Debounced to prevent thrashing (300ms)
- [ ] Graceful empty state when data is minimal

## Dependencies
- TASK-346 (split-pane provides the `previewSlot` container)

## Files/Modules Affected
- `platform-app/src/components/onboarding/SiteSkeletonPreview.tsx` (new)
