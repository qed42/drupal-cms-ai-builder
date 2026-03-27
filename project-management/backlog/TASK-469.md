# TASK-469: Add Toast Notification System (Sonner)

**Story:** US-092
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M24 — UI Component System

## Description

Add a user-facing toast notification system to replace console.log/console.error calls. Currently, API errors, upload failures, and validation issues are invisible to the user. Sonner (shadcn's recommended toast library) provides accessible, animated notifications.

## Technical Approach

1. Install: `npx shadcn@latest add sonner`
2. Add `<Toaster />` to root layout (`app/layout.tsx`) — renders toast container
3. Configure Sonner theme:
   - Dark theme matching existing glass-morphism
   - Position: `bottom-right`
   - Duration: 4s default, 6s for errors
4. Replace error patterns across the app:
   - File upload errors (images, brand logo, fonts) → `toast.error("Upload failed")`
   - API call failures in onboarding steps → `toast.error("Could not save")`
   - AI analysis failures → `toast.error("Analysis unavailable")`
   - Successful operations where useful → `toast.success("Changes saved")`
5. Add toast for clipboard/copy actions (review page)
6. Remove corresponding `console.error` calls (keep console.warn for dev debugging)

## Acceptance Criteria

- [ ] `<Toaster />` rendered in root layout
- [ ] All user-facing errors show toast notification
- [ ] Toast styling matches dark theme
- [ ] Toasts are accessible (aria-live region, dismiss on Escape)
- [ ] No more silent failures in onboarding flow
- [ ] Success toasts on save operations (non-intrusive)

## Dependencies

- TASK-465

## Files Affected

- `platform-app/src/components/ui/sonner.tsx` (new)
- `platform-app/src/app/layout.tsx` (add Toaster)
- `platform-app/src/app/onboarding/idea/page.tsx`
- `platform-app/src/app/onboarding/audience/page.tsx`
- `platform-app/src/app/onboarding/brand/page.tsx`
- `platform-app/src/app/onboarding/fonts/page.tsx`
- `platform-app/src/app/onboarding/images/page.tsx`
- `platform-app/src/app/onboarding/follow-up/page.tsx`
- `platform-app/src/app/onboarding/review/page.tsx`
- `platform-app/src/components/onboarding/FileUploadZone.tsx`
- `platform-app/src/components/dashboard/AddNewSiteButton.tsx`
