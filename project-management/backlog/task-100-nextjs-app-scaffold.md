# TASK-100: Next.js Platform App Scaffold

**Story:** US-001 (Registration), Foundation
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation

## Description
Scaffold the Next.js 15 application with App Router, TypeScript, Tailwind CSS, and database setup (Prisma + PostgreSQL). This is the foundation for all platform features.

## Technical Approach
- Initialize Next.js 15 project with `create-next-app` (App Router, TypeScript, Tailwind, ESLint)
- Install and configure Prisma ORM with PostgreSQL
- Define initial database schema: `users`, `sites`, `onboarding_sessions`, `blueprints`, `subscriptions` tables
- Run initial migration
- Set up project structure: `src/app/`, `src/lib/`, `src/components/`
- Configure environment variables (.env.local for dev)
- Set up Docker Compose for local PostgreSQL (or use existing DDEV MySQL)

## Acceptance Criteria
- [ ] Next.js app boots and serves at localhost:3000
- [ ] Prisma client connects to PostgreSQL
- [ ] All 5 tables created via migration
- [ ] TypeScript compiles without errors
- [ ] Basic health check API route works (`/api/health`)

## Dependencies
- None (foundation task)

## Files/Modules Affected
- `platform-app/` (new directory at project root)
- `platform-app/prisma/schema.prisma`
- `platform-app/src/app/`
- `docker-compose.yml` (add PostgreSQL service)
