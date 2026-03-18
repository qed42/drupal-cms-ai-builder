# Sprint 01 Output: Next.js Platform Foundation (v2)

**Completed:** 2026-03-18
**Architecture:** v2 (Split Platform — Next.js + Drupal Multisite)

## Tasks Delivered

### TASK-100: Next.js App Scaffold + DB Schema — DONE
- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Prisma 7 ORM with PostgreSQL 16 via `@prisma/adapter-pg`
- Docker Compose for local PostgreSQL (port 5433)
- Database schema: 7 tables (users, accounts, sessions, verification_tokens, sites, onboarding_sessions, blueprints, subscriptions)
- Initial migration applied
- Health check API route (`/api/health`) — verifies DB connectivity
- Prisma client singleton with dev-mode caching

### TASK-101: Authentication System (NextAuth v5) — DONE
- NextAuth.js v5 (beta 30) with Prisma adapter
- Credentials provider (email + bcrypt-hashed password)
- JWT session strategy
- Registration API (`/api/auth/register`):
  - Validates email uniqueness (409 on duplicate)
  - Validates password length (min 8 chars)
  - Creates user + site (status: "onboarding") + subscription (plan: "trial", +14 days) + onboarding session
- Login page (`/login`) with dark gradient UI
- Register page (`/register`) with auto-login after registration
- Route protection middleware: `/onboarding/*` and `/dashboard/*` require auth
- Auth pages redirect logged-in users to onboarding

### TASK-102: Onboarding Wizard Framework — DONE
- Onboarding layout with dark gradient background (matches Figma Screen 0)
- Animated equalizer icon at top of each screen
- URL-based step routing (`/onboarding/start`, `/onboarding/name`, etc.)
- ProgressDots component — highlights current step, pill shape for active
- StepLayout component — shared step UI (title, subtitle, button, back nav)
- Step data persistence via API routes:
  - `POST /api/onboarding/save` — merges step data into JSONB
  - `GET /api/onboarding/resume` — returns current step + data
- Resume support: each screen loads saved data on mount
- Back navigation preserves data
- Step definitions in `src/lib/onboarding-steps.ts`

### TASK-103: Wizard Screens 1–3 (Name, Idea, Audience) — DONE
- Screen 1 (`/onboarding/name`): "What are we calling this?" — text input, min 2 chars
- Screen 2 (`/onboarding/idea`): "What's the big idea?" — textarea, required
- Screen 3 (`/onboarding/audience`): "Who is this for?" — text input, optional
- Button labels match Figma: "Continue →", "Your Audience →", "Plan the Structure →"
- All screens use StepLayout for consistent styling
- Data saves to `onboarding_sessions.data` (JSONB) on each step transition

## Verification Results

| Check | Result |
|-------|--------|
| Next.js app boots at localhost:3000 | PASS |
| Prisma client connects to PostgreSQL | PASS |
| All 7 tables created via migration | PASS |
| TypeScript compiles without errors | PASS |
| Health check API returns `{"status":"ok","db":"connected"}` | PASS |
| User registration creates user + site + subscription | PASS |
| Duplicate email returns 409 | PASS |
| Password validation (min 8 chars) | PASS |
| Protected routes redirect to login | PASS |
| Onboarding API rejects unauthenticated requests (401) | PASS |
| Build compiles successfully (`next build`) | PASS |

## Tech Stack

| Component | Version |
|-----------|---------|
| Next.js | 16.1.7 |
| React | 19.2.3 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Prisma | 7.5.0 |
| NextAuth.js | 5.0.0-beta.30 |
| PostgreSQL | 16 (Alpine) |
| bcryptjs | 3.0.3 |

## Files Created

```
platform-app/
├── docker-compose.yml (PostgreSQL service)
├── prisma/
│   ├── schema.prisma
│   ├── prisma.config.ts
│   └── migrations/20260318064800_init/
├── src/
│   ├── app/
│   │   ├── layout.tsx (root layout with SessionProvider)
│   │   ├── page.tsx (redirect to register/onboarding)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (onboarding)/
│   │   │   ├── layout.tsx (dark gradient)
│   │   │   ├── start/page.tsx
│   │   │   ├── name/page.tsx
│   │   │   ├── idea/page.tsx
│   │   │   └── audience/page.tsx
│   │   └── api/
│   │       ├── health/route.ts
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       └── onboarding/
│   │           ├── save/route.ts
│   │           └── resume/route.ts
│   ├── components/
│   │   ├── SessionProvider.tsx
│   │   └── onboarding/
│   │       ├── ProgressDots.tsx
│   │       └── StepLayout.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── onboarding-steps.ts
│   └── middleware.ts
```

## Known Issues
- Next.js 16 deprecates `middleware.ts` in favor of `proxy` — current code works but shows build warning
- Production build (`next build` + `next start`) has routing issues with API routes when middleware intercepts — works correctly in dev mode

## Next Steps
- Invoke `/qa sprint-01` for Playwright test automation
- Sprint 02: AI Industry Inference, Page Suggestion, Design Source, Brand & Font screens
