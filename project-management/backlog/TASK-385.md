# TASK-385: Onboarding UX bugs and enhancements (batch)

**Story:** Onboarding UX Polish
**Priority:** P1
**Estimated Effort:** L
**Milestone:** UX Polish

## Visual Bugs

### BUG-385a: Progress stepper labels stuck together
- Steps "Vision", "Design", "Content", "Launch" have no spacing between labels
- Screenshot: Desktop/Screenshot 2026-03-23 at 8.35.41 AM.jpg
- File: `platform-app/src/components/onboarding/ProgressStepper.tsx`

### BUG-385b: "Let's map your site" page sticks to top & bottom
- No breathing room / padding on the site mapping step
- File: likely `platform-app/src/components/onboarding/StepLayout.tsx` or the specific step page

### BUG-385c: "Set your brand voice" page sticks to top & bottom
- Same visual spacing issue as BUG-385b

### BUG-385d: "Ready to generate?" color palette overflows box
- Color palette content goes outside its container, needs to wrap
- File: `platform-app/src/app/onboarding/review-settings/page.tsx`

### BUG-385e: Provisioning "try again" button state doesn't reset
- Clicking try again resets top loader but doesn't remove the "something went wrong" label or try again button
- Should show provisioning loader steps and remove error UI
- File: provisioning status/progress components in dashboard

### BUG-385f: "Writing your content" progress bar doesn't turn green
- Should show yellow/amber with "needs review" badge, then turn green after review complete
- File: provisioning progress/building page component

## Functional Enhancements

### ENH-385g: Qualitative guardrail on "What's the big idea?"
- Currently only validates character count, not content quality
- Need AI-based qualitative gate (is the input meaningful? specific enough?)
- File: `platform-app/src/lib/pipeline/` guardrails logic

### ENH-385h: Audience step suggestions based on previous input
- "Describe your ideal audience" should suggest audiences based on the idea entered in previous step
- Requires passing prior step data and generating suggestions

### ENH-385i: Transparency about how content is used during generation
- Onboarding should communicate to users how their inputs feed into the generation process
- Builds trust with end-users
- UX copy / tooltip / info panel enhancement

### ENH-385j: Media library upload (instead of only Pexels API)
- Allow users to upload their own image library
- Uploaded images should be annotated/tagged on upload
- Images should be matched against sections planned in the blueprint
- Significant feature — may warrant its own task

### ENH-385k: Color extraction & theme mapping
- Colors from "Set your brand voice" step must map to chosen theme's color variable names
- Currently no mapping between extracted palette and theme-specific color tokens
- Related to existing color palette adapter work in ds-types

### ENH-385l: Remove section-level regenerate buttons from Review Content
- Regenerate buttons at section level are non-functional
- Remove them but keep inline edit capability

## Dependencies
- None (independent UX tasks)
