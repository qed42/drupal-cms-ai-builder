# Sprint 44 Output: AWS Deployment — Infrastructure & Containers

**Date:** 2026-03-28
**Status:** 4/7 code tasks DONE, 2 manual infra tasks + 1 validation task remaining

## Completed Tasks

### TASK-458: Expand `docker-compose.prod.yml` to Full 5-Service Stack
- Extended existing `docker-compose.prod.yml` from 1 service (platform) to 5 services:
  - `caddy` — reverse proxy with GoDaddy DNS plugin, ports 80/443
  - `platform` — Next.js app with Prisma, Docker socket, provisioning volumes
  - `postgres` — PostgreSQL 16 for platform database with health check
  - `drupal-web` — custom PHP 8.4 FPM + Nginx container for Drupal
  - `mariadb` — MariaDB 11.8 for Drupal databases with health check
- Added 6 named volumes: `caddy_data`, `caddy_config`, `pg_data`, `mariadb_data`, `drupal_site`, `drupal_files`
- Created `.env.production.example` documenting all required environment variables
- `docker compose -f docker-compose.prod.yml config` validates successfully
- Set `DDEV_WEB_CONTAINER=ai-builder-drupal-web` so provisioning engine targets the production container

### TASK-459: Create Production Drupal Container
- Created `drupal-site/Dockerfile` — PHP 8.4 FPM Alpine with Nginx, GD/intl/opcache/pdo_mysql/zip extensions
- Created `drupal-site/docker/nginx.conf` — production Nginx config with Drupal clean URLs, image styles, static asset caching, dotfile blocking
- Modeled nginx config after existing DDEV `nginx-site.conf` for compatibility
- Composer dependencies installed with `--no-dev --optimize-autoloader`
- OPcache tuned for production (256MB, timestamps disabled)

### TASK-460: Create Caddy Reverse Proxy
- Created `caddy/Dockerfile` — custom build with `xcaddy` + `caddy-dns/godaddy` plugin
- Created `caddy/Caddyfile` — wildcard TLS via DNS-01 challenge:
  - `app.drupalcms.app` → `platform:3000`
  - `*.drupalcms.app` → `drupal-web:80`
- GoDaddy API credentials injected via environment variables

### TASK-461: Upgrade Platform Dockerfile.prod
- Rewrote `platform-app/Dockerfile.prod` as multi-stage build (builder → runner)
- Stage 1: full Node.js build with Prisma generate + Next.js standalone output
- Stage 2: minimal runtime with `docker-cli`, standalone server, Prisma client + migrations
- Created `platform-app/scripts/start-prod.sh` — startup script with:
  - Prisma migrate retry loop (max 30s, waits for postgres health check)
  - `exec node server.js` for proper PID 1 signal handling
- Added `output: "standalone"` to `platform-app/next.config.ts`

## Additional Fixes

### Pre-existing Build Fix: Onboarding Prerender Error
- Onboarding pages (brand, details, etc.) failed `next build` due to prerendering client-side pages that call `useSearchParams()`, `useOnboarding()`, etc.
- Added `export const dynamic = "force-dynamic"` to `platform-app/src/app/onboarding/layout.tsx`
- All onboarding pages now correctly marked as dynamic (server-rendered on demand)
- Build succeeds with standalone output

### Provisioning Engine: Hardcoded Container Reference
- Fixed hardcoded `"ddev-ai-site-builder-web"` in `provisioning/src/steps/09-apply-brand.ts`
- Now reads from `process.env.DDEV_WEB_CONTAINER` (matching `drush.ts` pattern)
- Production compose sets `DDEV_WEB_CONTAINER=ai-builder-drupal-web`

## Remaining Tasks

| Task | Status | Action Required |
|------|--------|----------------|
| TASK-462 | Manual | EC2 instance setup, Elastic IP, security groups, Docker install |
| TASK-463 | Manual | GoDaddy DNS wildcard A records + API key generation |
| TASK-464 | Post-deploy | E2E validation after infrastructure is provisioned |

## Files Changed/Created

| File | Action |
|------|--------|
| `docker-compose.prod.yml` | Rewritten — 5-service production stack |
| `.env.production.example` | Created — env var documentation |
| `caddy/Dockerfile` | Created — custom Caddy with GoDaddy DNS plugin |
| `caddy/Caddyfile` | Created — wildcard routing rules |
| `drupal-site/Dockerfile` | Created — PHP 8.4 FPM + Nginx |
| `drupal-site/docker/nginx.conf` | Created — Drupal-specific Nginx config |
| `platform-app/Dockerfile.prod` | Rewritten — multi-stage standalone build |
| `platform-app/scripts/start-prod.sh` | Created — startup with Prisma migrate |
| `platform-app/next.config.ts` | Modified — added `output: "standalone"` |
| `platform-app/src/app/onboarding/layout.tsx` | Modified — `force-dynamic` for prerender fix |
| `provisioning/src/steps/09-apply-brand.ts` | Fixed — env-based container name |

## Verification

- `docker compose -f docker-compose.prod.yml config` — validates without errors
- `npm run build` — succeeds with standalone output
- `.next/standalone/platform-app/server.js` — exists and ready for production
