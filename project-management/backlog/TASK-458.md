# TASK-458: Expand `docker-compose.prod.yml` to Full 5-Service Stack

**Story:** US-086
**Effort:** M
**Milestone:** M23 — AWS Deployment
**Updated:** 2026-03-28 — Reuses existing `docker-compose.prod.yml` instead of creating new file.

## Description
Expand the existing `docker-compose.prod.yml` (currently only defines `platform` service) to include all 5 services: caddy, platform, postgres, drupal-web, mariadb. Add named volumes, health checks, environment variable injection, and create `.env.production.example`.

## Current State
`docker-compose.prod.yml` exists with only a `platform` service definition (build context, provisioning/drupal-site volumes, Docker socket mount). Must be extended, not replaced.

## Implementation Details
1. **Extend** `docker-compose.prod.yml` — add `postgres`, `caddy`, `drupal-web`, `mariadb` services alongside existing `platform`
2. Define 7 named volumes: `caddy_data`, `caddy_config`, `pg_data`, `mariadb_data`, `drupal_site`, `drupal_files`, `blueprint_tmp`
3. Add health checks for `postgres` (pg_isready) and `mariadb` (mysqladmin ping)
4. Configure `platform` → `postgres` dependency with `condition: service_healthy`
5. Configure `drupal-web` → `mariadb` dependency with `condition: service_healthy`
6. Mount Docker socket on `platform` for provisioning engine child processes
7. Create `.env.production.example` with placeholder values for all required env vars:
   - `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `JWT_SHARED_SECRET`
   - `PROVISION_CALLBACK_KEY`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
   - `SITE_DOMAIN_SUFFIX`, `GODADDY_API_KEY`, `GODADDY_API_SECRET`
   - `ANTHROPIC_API_KEY` (for AI pipeline)

## Acceptance Criteria
- [ ] `docker-compose.prod.yml` defines 5 services with correct images/builds
- [ ] All 7 named volumes are declared
- [ ] PostgreSQL and MariaDB have health checks; dependent services wait
- [ ] `.env.production.example` documents all required environment variables
- [ ] `docker compose -f docker-compose.prod.yml config` validates without errors

## Files
- `docker-compose.prod.yml` (edit — extend existing)
- `.env.production.example` (new)
