# TASK-460: Create Caddy Reverse Proxy with GoDaddy DNS-01 Wildcard SSL

**Story:** US-087
**Effort:** M
**Milestone:** M23 — AWS Deployment

## Description
Create a custom Caddy container with the GoDaddy DNS plugin for automatic wildcard TLS certificate provisioning. Routes `app.drupalcms.app` to the platform and `*.drupalcms.app` to Drupal.

## Implementation Details
1. Create `caddy/Dockerfile` with `xcaddy build --with github.com/caddy-dns/godaddy`
2. Create `caddy/Caddyfile` with routing rules per architecture spec
3. Configure DNS-01 challenge with GoDaddy API credentials from environment
4. Platform routing: `app.drupalcms.app → platform:3000`
5. Drupal routing: `*.drupalcms.app → drupal-web:80`
6. Set admin email for Let's Encrypt account

## Acceptance Criteria
- [ ] `docker build caddy/` completes with GoDaddy DNS module included
- [ ] Caddy obtains wildcard certificate via DNS-01 challenge (test with staging LE)
- [ ] `app.drupalcms.app` proxies to platform app
- [ ] `*.drupalcms.app` proxies to Drupal web
- [ ] Certificate auto-renewal works
- [ ] GoDaddy API credentials injected via environment variables (not hardcoded)

## Files
- `caddy/Dockerfile` (new)
- `caddy/Caddyfile` (new)
