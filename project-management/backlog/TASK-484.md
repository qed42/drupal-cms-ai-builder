# TASK-484: Review Page — Read-Only Preview + Celebration Moment

**Status:** TODO
**Priority:** Medium
**Sprint:** 50
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-7)
**Depends on:** None

## Description

After generation completes, the review page immediately shows a full content editor (sidebar + preview + section editing). This is overwhelming. Add a celebration moment and default to read-only preview.

## Tasks

1. **Add celebration state** to review page:
   - On first load: 2-second celebration screen
   - Animated checkmark (scale-in with bounce, 400ms)
   - Heading: "Your site is ready!" (text-3xl, fade-in 200ms delayed)
   - Subtitle: "Let's take a look at what Archie built" (text-white/50, fade-in 400ms delayed)
   - Auto-advances to preview mode after 2s

2. **Add preview mode** (new default after celebration):
   - Full-width site preview (existing page rendering, but no sidebar)
   - Floating "Edit Content" button (fixed bottom-right, brand CTA style)
   - Inline section hover: subtle border highlight + "Edit" tooltip on hover
   - "Approve & Launch" button in top-right header area

3. **Preserve edit mode** (existing editor):
   - Activated by "Edit Content" button or inline section click
   - Full sidebar + preview + editing (current implementation)
   - "Back to Preview" button to return to read-only

4. **State machine:**
   ```typescript
   type ReviewMode = "celebration" | "preview" | "edit";
   // celebration → (auto 2s) → preview → (user click) → edit
   // edit → (user click) → preview
   ```

5. **Respect returning visits:** If user has previously seen celebration for this siteId, skip straight to preview mode (track in localStorage)

## Acceptance Criteria

- [ ] First visit shows 2-second celebration animation
- [ ] Preview mode is default (read-only, no sidebar)
- [ ] "Edit Content" transitions to full editor
- [ ] "Back to Preview" returns to read-only mode
- [ ] Returning visits skip celebration
- [ ] "Approve & Launch" accessible from both modes
