# Sprint 03 Output: Blueprint Generation & Dashboard (v2)

**Completed:** 2026-03-18
**Architecture:** v2 (Next.js Platform)

## Tasks Delivered

### TASK-110: Space SDC Component Manifest (Static JSON) — DONE (Reworked)
- Created Node.js export script at `platform-app/scripts/export-component-manifest.mjs`
  - Clones/reads Space DS theme from `https://git.drupalcode.org/project/space_ds`
  - Parses all 84 `*.component.yml` files recursively
  - Extracts: id, name, description, status, group, category, props (with types/enums/defaults), slots
  - Generates usage hints from descriptions or component name heuristics (marketing manager perspective)
  - Outputs to `platform-app/src/lib/ai/space-component-manifest.json`
- Manifest contains all 84 real Space DS components across 4 categories:
  - Base (2): space-container, space-flexi
  - Atoms (19): button, heading, paragraph, image, video, form, input, select, textarea, alert, badge, avatar, link, social-button, tooltip, features, sticky-jump-link-tag
  - Molecules (31): accordion-item, breadcrumb, cards (featured, icon, image, people, pricing, quicklink, testimony, timeline, video), section-heading, stats-kpi, logo-grid, social-links, text, code-snippet, avatar-group, notification-banner, pagination, footer-logo-content
  - Organisms (32): hero banners (11 styles), CTA banners (3 types), accordion (+ 4 image variants), team sections (6 variants), text-media (5 variants), slider, sidebar-links, sticky-jump-link
- Component IDs use real SDC format: `space_ds:space-{component-name}`
- Page layout prompt filters to organisms only for page-level section selection
- Generator fallbacks use real component IDs (e.g., `space_ds:space-hero-banner-style-01`)
- Re-run script with `node scripts/export-component-manifest.mjs /path/to/space_ds` when theme updates

### TASK-109: Blueprint Generation (AI Content Pipeline) — DONE
- **API Route:** `POST /api/provision/generate-blueprint`
  - Validates auth, loads onboarding session data
  - Creates/upserts Blueprint record with status="generating"
  - Fires async generation (non-blocking, client polls for status)
  - On failure: sets status="failed", reverts site to "onboarding"
- **Generator:** `platform-app/src/lib/blueprint/generator.ts`
  - 3 sequential GPT-4o-mini calls:
    1. Content generation (services, team, testimonials, tagline, description)
    2. Page layouts (component-based sections referencing manifest)
    3. Contact form fields (industry-specific)
  - Full fallback content for each step if AI fails
  - Compliance-aware: HIPAA, attorney advertising, fair housing, GDPR disclaimers
- **Blueprint Types:** `platform-app/src/lib/blueprint/types.ts`
  - `BlueprintBundle`, `SiteMetadata`, `BrandTokens`, `PageLayout`, `PageSection`, `ContentItems`, `FormField`, `GenerationStep`
- **AI Prompts:** 3 specialized prompt builders in `platform-app/src/lib/ai/prompts/`
  - `content-generation.ts` — business content with compliance instructions
  - `page-layout.ts` — component-based layouts with manifest context
  - `form-generation.ts` — industry-specific form fields
- **Schema Migration:** Added `generationStep` and `generationError` to Blueprint model
- **Status API:** `GET /api/provision/status` — returns generation step, progress %, error

### TASK-122: Generation Progress UI — DONE
- **Progress Page:** `/onboarding/progress`
  - Polls `/api/provision/status` every 3 seconds
  - Animated spinner during generation
  - 5-step progress indicator: analyzing → layouts → content → forms → complete
  - Progress bar with percentage
  - Success state: green checkmark + "Continue to Dashboard" CTA
  - Error state: error message + "Try Again" button (re-triggers generation)
- **GenerationProgress Component:** `platform-app/src/components/onboarding/GenerationProgress.tsx`
  - Animated step icons with active/done/pending states
  - Loading dots animation for active step
  - Progress bar with gradient
- **Fonts Page Modified:** "Visualize my site" now:
  1. Saves fonts data to onboarding session
  2. Triggers `POST /api/provision/generate-blueprint`
  3. Redirects to `/onboarding/progress`

### TASK-117: Platform Dashboard — DONE
- **Dashboard Page:** `/dashboard` (server component)
  - Protected route (redirects to login if unauthenticated)
  - Fetches site + subscription data from Prisma
  - Redirects to onboarding if no site exists
- **Layout:** Dark gradient theme with nav bar (brand, email, sign out)
- **SiteCard Component:** `platform-app/src/components/dashboard/SiteCard.tsx`
  - Site name, subdomain, status badge (7 statuses with color coding)
  - Action buttons per status:
    - onboarding → "Continue Setup"
    - generating → spinner + "Generating..."
    - blueprint_ready → "Awaiting Provisioning"
    - live → "Edit Site" (links to Drupal URL)
- **SubscriptionStatus Component:** `platform-app/src/components/dashboard/SubscriptionStatus.tsx`
  - Plan name, status indicator, trial countdown
  - Days remaining with warning color when ≤ 3 days
  - "Upgrade Plan" button (disabled, coming soon)

## Verification Checklist

| Check | Result |
|-------|--------|
| Component manifest has 20 SDC components | PASS |
| Each component has id, label, category, props, usage_hint | PASS |
| Blueprint API creates Blueprint record | PASS |
| Generator runs 3 AI calls sequentially | PASS |
| Fallback content generated when AI fails | PASS |
| Generation step tracked in DB for polling | PASS |
| Status API returns progress percentage | PASS |
| Fonts page triggers generation + redirects | PASS |
| Progress page polls status every 3 seconds | PASS |
| Progress steps animate correctly | PASS |
| Success shows "Continue to Dashboard" | PASS |
| Error shows "Try Again" button | PASS |
| Dashboard shows site card with status | PASS |
| Dashboard shows subscription info | PASS |
| Trial countdown displays correctly | PASS |
| Build compiles cleanly (26 routes) | PASS |

## Architecture Decisions

1. **Blueprint stored as JSON in DB** — Stored in `Blueprint.payload` (Prisma JSON field) rather than filesystem/S3. Simpler for development, no storage infrastructure needed yet. Will move to S3 when provisioning engine needs file access.

2. **Async generation with polling** — Generation runs in background (not awaited by the API route). Client polls status every 3 seconds. This avoids request timeouts and gives real-time progress feedback.

3. **3 sequential AI calls** — Content → Layouts → Forms rather than one massive prompt. Each call has focused context and stays under token limits. Sequential to avoid rate limiting.

4. **Full fallback chain** — Every AI call has a fallback that produces valid output. The blueprint is always complete even if all AI calls fail.

5. **Progress page outside wizard step system** — `/onboarding/progress` is not in `ONBOARDING_STEPS` array since it's a terminal state, not a navigable wizard step.

## Files Created/Modified

```
platform-app/
├── prisma/
│   └── schema.prisma (MODIFIED — added generationStep, generationError to Blueprint)
├── src/
│   ├── app/
│   │   ├── api/provision/
│   │   │   ├── generate-blueprint/route.ts (NEW)
│   │   │   └── status/route.ts (NEW)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx (NEW)
│   │   │   └── page.tsx (NEW)
│   │   └── onboarding/
│   │       ├── fonts/page.tsx (MODIFIED — trigger generation)
│   │       └── progress/page.tsx (NEW)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── SiteCard.tsx (NEW)
│   │   │   └── SubscriptionStatus.tsx (NEW)
│   │   └── onboarding/
│   │       └── GenerationProgress.tsx (NEW)
│   └── lib/
│       ├── ai/
│       │   ├── prompts/
│       │   │   ├── content-generation.ts (NEW)
│       │   │   ├── form-generation.ts (NEW)
│       │   │   └── page-layout.ts (NEW)
│       │   └── space-component-manifest.json (NEW)
│       └── blueprint/
│           ├── generator.ts (NEW)
│           └── types.ts (NEW)
```

## Next Steps

- Invoke `/qa sprint-03` for Playwright test automation
- Sprint 04: Drupal foundation (content types, blueprint parser, brand tokens, provisioning engine)
