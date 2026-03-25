# TASK-421: Display impact summary on dashboard SiteCard

**Story:** US-071
**Priority:** P3
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Add an ImpactSummary section to the dashboard SiteCard component that displays the "Your inputs shaped" bullets stored in the blueprint payload.

## Technical Approach
1. Create `platform-app/src/components/dashboard/ImpactSummary.tsx` (no "use client" — server-compatible pure presentation)
2. Props: `{ bullets: string[] }`
3. Render: "Your inputs shaped:" label + `<ul>` with `<li>` items
4. In `platform-app/src/app/dashboard/page.tsx` (server component):
   - Add `blueprint: { select: { payload: true } }` to the prisma site query include
   - Extract `payload._impact` as `string[]`
   - Pass to SiteCard as `impactBullets` prop
5. SiteCard renders `<ImpactSummary>` below the status section
6. Only render if `impactBullets` is non-empty

## Component Specification
```typescript
// ImpactSummary — no "use client", pure presentation
interface ImpactSummaryProps {
  bullets: string[];
}
```

## Acceptance Criteria
- [ ] Site cards show "Your inputs shaped" section with 3-5 bullets
- [ ] Section is visible without clicking/expanding
- [ ] Hidden when no impact bullets are available (no empty section shown)
- [ ] Text styling: `text-xs text-zinc-400` label, `text-sm text-zinc-300` bullets
- [ ] `aria-label="How AI used your inputs"` on the list
- [ ] No client-side JavaScript for this component (server-rendered)

## Dependencies
- TASK-420 (impact bullets generated during pipeline)

## Files Affected
- `platform-app/src/components/dashboard/ImpactSummary.tsx` (NEW)
- `platform-app/src/components/dashboard/SiteCard.tsx` (add ImpactSummary)
- `platform-app/src/app/dashboard/page.tsx` (include blueprint in query)
