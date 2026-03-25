# TASK-401: Integrate InferenceCard on Idea step

**Story:** US-064
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Wire the InferenceCard into the Idea onboarding step. After the validate-idea API returns "good", show an inference card with industry, detected services, and compliance flags from the existing analyze response.

## Technical Approach
1. Read `platform-app/src/app/onboarding/idea/page.tsx` — understand current validation flow
2. After the analyze API returns successfully, construct InferenceCardItem array:
   - `{ label: "Industry", value: data.industry, type: "text" }`
   - `{ label: "Key services detected", value: data.detectedServices, type: "list" }` (if non-empty)
   - `{ label: "Compliance", value: data.compliance_flags.join(", "), type: "text" }` (if non-empty)
3. Set `showInference: true` state
4. Pass InferenceCard to StepLayout's `insightSlot` prop
5. onConfirm → `setShowInference(false)`
6. onEdit → scroll to idea textarea, focus it
7. Explanation: "This shapes your page suggestions, content tone, and SEO keywords."

## Acceptance Criteria
- [ ] Inference card appears within 2s of idea validation completing as "good"
- [ ] Shows industry, detected services (if any), and compliance flags (if any)
- [ ] "Looks right" dismisses the card
- [ ] "Edit my description" scrolls to and focuses the idea textarea
- [ ] Card does NOT appear for "vague" or "nonsense" validation results
- [ ] No additional API call — uses data already returned by analyze endpoint
- [ ] Card auto-dismisses after 30s if user doesn't interact

## Dependencies
- TASK-398 (InferenceCard component)
- TASK-399 (enriched analyze API with detectedServices)

## Files Affected
- `platform-app/src/app/onboarding/idea/page.tsx`
