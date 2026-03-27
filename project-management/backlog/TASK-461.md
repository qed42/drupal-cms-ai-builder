# TASK-461: Platform App Production Dockerfile

**Story:** US-086
**Effort:** S
**Milestone:** M23 — AWS Deployment

## Description
Create or update the platform app's production Dockerfile for AWS deployment. Ensure it builds the Next.js app in standalone mode, runs Prisma migrations on startup, and connects to the correct production services.

## Implementation Details
1. Create/update `platform-app/Dockerfile.prod` for multi-stage production build
2. Stage 1: Install dependencies + build Next.js in standalone output mode
3. Stage 2: Minimal runtime image with Node.js, built artifacts, and Prisma client
4. Add startup script that runs `prisma migrate deploy` before starting Next.js
5. Ensure provisioning engine's Node.js dependencies are available at runtime
6. Configure proper signal handling for graceful shutdown

## Acceptance Criteria
- [ ] `docker build -f platform-app/Dockerfile.prod .` succeeds
- [ ] Container starts Next.js on port 3000 in production mode
- [ ] Prisma migrations run automatically on startup
- [ ] Provisioning engine can spawn child processes from within the container
- [ ] Image size is under 500MB

## Files
- `platform-app/Dockerfile.prod` (new or edit)
- `platform-app/scripts/start-prod.sh` (new — startup script)
