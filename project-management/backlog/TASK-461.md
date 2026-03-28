# TASK-461: Upgrade Platform Dockerfile.prod to Multi-Stage + Startup Script

**Story:** US-086
**Effort:** M (upgraded from S)
**Milestone:** M23 — AWS Deployment
**Updated:** 2026-03-28 — Existing Dockerfile.prod needs significant rework, effort upgraded S→M.

## Description
Rewrite the existing `platform-app/Dockerfile.prod` as a multi-stage production build with standalone Next.js output, automatic Prisma migration on startup, and proper runtime dependencies for the provisioning engine.

## Current State
`Dockerfile.prod` exists as a single-stage build: installs all deps, generates Prisma client, builds Next.js, runs `npm start`. Missing: standalone mode, multi-stage (large image), no startup script, no Prisma migrate, no signal handling.

## Implementation Details
1. **Stage 1 (builder):** `node:22-alpine` — install deps, generate Prisma client, build Next.js with `output: "standalone"` in `next.config.js`
2. **Stage 2 (runner):** `node:22-alpine` — copy standalone output, Prisma client + migrations, `docker-cli` (for provisioning)
3. Create `platform-app/scripts/start-prod.sh`:
   - Wait for postgres readiness (retry loop, max 30s)
   - Run `npx prisma migrate deploy`
   - Start Next.js standalone server with `exec node server.js` (proper PID 1 signal handling)
4. Ensure `@space-ai/shared` workspace package is available at runtime (standalone should bundle it)
5. Copy provisioning engine source + deps to runtime stage (it spawns child processes)
6. Keep `docker-cli` in runtime for provisioning engine's container management

## Acceptance Criteria
- [ ] `docker build -f platform-app/Dockerfile.prod .` succeeds
- [ ] Container starts Next.js on port 3000 in production mode
- [ ] Prisma migrations run automatically on startup (verified by logs)
- [ ] Provisioning engine can spawn child processes from within the container
- [ ] Image size is under 500MB (multi-stage should achieve ~200-300MB)
- [ ] Graceful shutdown on SIGTERM (no zombie processes)

## Files
- `platform-app/Dockerfile.prod` (rewrite)
- `platform-app/scripts/start-prod.sh` (new)
- `platform-app/next.config.js` or `next.config.mjs` (edit — add `output: "standalone"`)
