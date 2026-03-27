# TASK-458: Create Production Docker Compose (`docker-compose.aws.yml`)

**Story:** US-086
**Effort:** M
**Milestone:** M23 — AWS Deployment

## Description
Create the production Docker Compose file that defines all 5 services (caddy, platform, postgres, drupal-web, mariadb) with named volumes, health checks, and environment variable injection from `.env.production`.

## Implementation Details
1. Create `docker-compose.aws.yml` based on architecture spec (Section 4)
2. Define 7 named volumes: `caddy_data`, `caddy_config`, `pg_data`, `mariadb_data`, `drupal_site`, `drupal_files`, `blueprint_tmp`
3. Add health checks for postgres and mariadb
4. Configure service dependencies with `condition: service_healthy`
5. Create `.env.production.example` with placeholder values for all required env vars
6. Ensure platform service mounts shared volumes for provisioning

## Acceptance Criteria
- [ ] `docker-compose.aws.yml` defines 5 services with correct images/builds
- [ ] All 7 named volumes are declared
- [ ] PostgreSQL has health check; platform depends on it
- [ ] `.env.production.example` documents all required environment variables
- [ ] `docker compose -f docker-compose.aws.yml config` validates without errors

## Files
- `docker-compose.aws.yml` (new)
- `.env.production.example` (new)
