# Sprint 44: AWS Deployment — Infrastructure & Containers

**Milestone:** M23 — AWS Deployment
**Duration:** 4 days
**Predecessor:** Sprint 43 (M20/M22 Bug Fixes)

## Sprint Goal

Stand up the AWS production environment: EC2 instance, Docker containers for all services, Caddy wildcard SSL, and end-to-end validation of the full user journey on `drupalcms.app`.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-462 | EC2 infrastructure setup & security configuration | US-086 | M | None | TODO |
| TASK-463 | GoDaddy DNS configuration for wildcard domain | US-087 | XS | TASK-462 | TODO |
| TASK-458 | Create production Docker Compose (`docker-compose.aws.yml`) | US-086 | M | None | TODO |
| TASK-459 | Create production Drupal container (Dockerfile + Nginx) | US-088 | M | None | TODO |
| TASK-460 | Create Caddy reverse proxy with GoDaddy DNS-01 wildcard SSL | US-087 | M | None | TODO |
| TASK-461 | Platform app production Dockerfile | US-086 | S | None | TODO |
| TASK-464 | End-to-end production validation | US-089 | M | TASK-458–463 | TODO |

## Execution Order

```
Wave 1 (parallel): TASK-462, TASK-458, TASK-459, TASK-460, TASK-461
  - EC2 setup is infrastructure work (AWS console/CLI)
  - Docker Compose, Drupal container, Caddy, and platform Dockerfile are independent code tasks
  - All 5 can be developed in parallel

Wave 2:            TASK-463
  - DNS configuration requires the Elastic IP from TASK-462
  - Quick task (XS) — just GoDaddy dashboard + API key generation

Wave 3:            TASK-464
  - E2E validation requires ALL prior tasks complete
  - Deploy, smoke test, run full onboarding → provisioning cycle
  - Document issues and create follow-up bugs if needed
```

## Dependencies & Risks

- **GoDaddy API access** — Need API key+secret for DNS-01 challenge. Verify developer access before sprint starts.
- **EC2 provisioning time** — Instance launch + EBS + Elastic IP typically takes < 10 min, but account limits may cause delays.
- **Caddy GoDaddy plugin** — Requires custom `xcaddy` build. If the GoDaddy DNS plugin has compatibility issues, fallback to Cloudflare DNS (transfer nameservers) or manual cert provisioning.
- **Shared Docker volumes** — Provisioning engine writes files to shared volume that Drupal reads. Path assumptions (`/srv/drupal-site/`) must match between `docker-compose.aws.yml` and provisioning code.
- **Drupal base site install** — First `drush site:install` on production creates the baseline multisite. Ensure DB connection and file permissions are correct.
- **Platform env vars** — `SITE_DOMAIN_SUFFIX` must change from `ai-site-builder.ddev.site` to `drupalcms.app`. Verify all env-dependent code handles this.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| XS | 1 | TASK-463 |
| S | 1 | TASK-461 |
| M | 5 | TASK-458, TASK-459, TASK-460, TASK-462, TASK-464 |
| **Total** | **7 tasks** | |

## Definition of Done

- [ ] EC2 instance running with Elastic IP, Docker installed, security groups configured
- [ ] `docker compose -f docker-compose.aws.yml up -d` starts all 5 services
- [ ] Caddy obtains wildcard TLS certificate for `*.drupalcms.app`
- [ ] `app.drupalcms.app` loads the platform app over HTTPS
- [ ] `{subdomain}.drupalcms.app` routes to Drupal with HTTPS
- [ ] Full onboarding → generation → provisioning cycle completes on production
- [ ] Provisioned site is accessible and displays correct content
- [ ] All environment variables documented in `.env.production.example`
- [ ] Setup reproducible from documentation
