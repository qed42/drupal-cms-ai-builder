# TASK-478: Composite Step — Describe Page (Merge name + idea + audience)

**Status:** TODO
**Priority:** High
**Sprint:** 48
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-1, §3.2)
**Depends on:** TASK-474, TASK-475

## Description

Merge the `name`, `idea`, and `audience` steps into a single `/onboarding/describe` page with three sequential sections. This is the largest composite step — it brings together the core business information inputs.

## Tasks

1. **Create `src/app/onboarding/describe/page.tsx`** with three sections:

   **Section 1: Business Name**
   - Text input (xl size), centered, autofocus
   - Same validation: min 2 chars
   - Heading: "What's your business called?"

   **Section 2: Business Description**
   - Textarea (xl size), resize-none, 4 rows
   - Character count hint with quality feedback (amber/emerald/red)
   - AI validation on blur (existing `/api/ai/validate-idea` endpoint)
   - Heading: "Tell us about your business"

   **Section 3: Target Audience**
   - Text input with AI-suggested pills below
   - Quality hints based on length
   - Heading: "Who are your customers?"
   - AI suggestions fetched when section enters viewport (IntersectionObserver)

2. **Internal navigation UX:**
   - Sections are vertically stacked with `scroll-mt-24` anchors
   - Each section has a subtle divider (`border-t border-white/5`)
   - Continue button validates all three sections
   - ArchiePanel on right shows inference card combining all three inputs

3. **Combine inference results:**
   - Single InferenceCard with merged analysis (industry + audience + services)
   - Title: "Archie analyzed your business"
   - Items: industry, key services, primary audience, pain points

4. **Update routing:**
   - Update `onboarding-steps.ts` to replace name/idea/audience with `describe`
   - Update `getNextStep`/`getPrevStep` for new flow
   - Keep old routes as redirects (`/onboarding/name` → `/onboarding/describe`) for bookmark compat

5. **Remove old pages** (after redirect routes are in place):
   - `src/app/onboarding/name/page.tsx`
   - `src/app/onboarding/idea/page.tsx`
   - `src/app/onboarding/audience/page.tsx`

6. **Update tests** — rewrite affected specs for new describe page flow

## Acceptance Criteria

- [ ] Single page collects name, idea, and audience
- [ ] AI validation fires on idea blur (same behavior)
- [ ] Audience suggestions appear when section visible
- [ ] InferenceCard shows combined analysis
- [ ] Continue disabled unless name ≥ 2 chars AND idea quality ≠ "nonsense"
- [ ] Old URLs redirect to /onboarding/describe
- [ ] Session save sends all three fields atomically
