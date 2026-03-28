# Sprint 44 (Replanned): AWS Deployment — Infrastructure & Containers

**Milestone:** M23 — AWS Deployment
**Duration:** 4 days
**Predecessor:** Sprint 52 (M20 AI Transparency Polish)
**Replanned:** 2026-03-28 — Original sprint was skipped after Sprint 43; replanned with current codebase state.

## Sprint Goal

Stand up the AWS production environment: EC2 instance, Docker containers for all services, Caddy wildcard SSL, and end-to-end validation of the full user journey on `drupalcms.app`.

## Current State Assessment

Before replanning, the following was audited:

| Artifact | Status | Notes |
|----------|--------|-------|
| `docker-compose.prod.yml` | **Exists — incomplete** | Only defines `platform` service. Missing postgres, caddy, drupal-web, mariadb. |
| `platform-app/Dockerfile.prod` | **Exists — needs update** | Single-stage build, no standalone mode, no Prisma migrate on startup. |
| `caddy/` directory | **Does not exist** | Caddyfile and custom Dockerfile needed from scratch. |
| `drupal-site/Dockerfile` | **Does not exist** | Production Drupal container needed from scratch. |
| `.env.production.example` | **Does not exist** | Environment variable documentation missing. |
| `SITE_DOMAIN_SUFFIX` | **Already defaults to `drupalcms.app`** | Code in `provisioning.ts`, `create-login-token/route.ts`, `callback/route.ts` uses `process.env.SITE_DOMAIN_SUFFIX || "drupalcms.app"`. No code changes needed. |
| Prisma schema | **Has new fields** | `pipelineMessages` and `pipelineArtifacts` added in Sprint 51 migration. Prisma migrate must run on deploy. |
| Onboarding flow | **Significantly changed** | 8-step flow (Sprints 48–52) with AI transparency, activity log, pipeline progress — all must work in production. |

## Tasks

| ID | Task | Story | Effort | Depends On | Status | Delta from Original |
|----|------|-------|--------|------------|--------|---------------------|
| TASK-462 | EC2 infrastructure setup & security configuration | US-086 | M | None | TODO (manual) | Unchanged |
| TASK-463 | GoDaddy DNS configuration for wildcard domain | US-087 | XS | TASK-462 | TODO (manual) | Unchanged |
| TASK-458 | Expand `docker-compose.prod.yml` to full 5-service stack | US-086 | M | None | DONE | **Changed**: extend existing file, not create new `docker-compose.aws.yml` |
| TASK-459 | Create production Drupal container (Dockerfile + Nginx) | US-088 | M | None | DONE | Unchanged |
| TASK-460 | Create Caddy reverse proxy with GoDaddy DNS-01 wildcard SSL | US-087 | M | None | DONE | Unchanged |
| TASK-461 | Upgrade platform Dockerfile.prod to multi-stage + startup script | US-086 | S→M | None | DONE | **Changed**: existing Dockerfile needs multi-stage rewrite, standalone output, startup script with Prisma migrate |
| TASK-464 | End-to-end production validation | US-089 | M | TASK-458–463 | TODO (post-deploy) | **Changed**: must validate new onboarding flow (8 steps), pipeline progress, activity log |

## Task-Level Changes from Original Plan

### TASK-458 — Docker Compose (Changed)
**Original:** Create new `docker-compose.aws.yml` from scratch.
**Now:** Extend existing `docker-compose.prod.yml` which already has a `platform` service definition. Add `postgres`, `caddy`, `drupal-web`, `mariadb` services. Add 7 named volumes, health checks, and `.env.production.example`.

### TASK-461 — Platform Dockerfile (Effort S→M)
**Original:** Create production Dockerfile.
**Now:** Existing `Dockerfile.prod` needs significant rework:
- Convert to multi-stage build (builder → runner) to reduce image size
- Enable Next.js standalone output mode in `next.config.js`
- Add `start-prod.sh` startup script that runs `prisma migrate deploy` then starts Next.js
- Ensure `docker-cli` is available at runtime (provisioning engine needs it)
- The new Prisma schema with `pipelineMessages`/`pipelineArtifacts` must migrate cleanly

### TASK-464 — E2E Validation (Expanded scope)
**Original:** Basic onboarding flow validation.
**Now:** Must validate the full 8-step onboarding journey including:
- AI transparency features (activity log, pipeline progress with artifacts)
- shadcn/ui components rendering correctly in production build
- Pipeline message streaming during generation
- Review-settings page with inference data

## Execution Order

```
Wave 1 (parallel): TASK-462, TASK-458, TASK-459, TASK-460, TASK-461
  ├─ TASK-462: EC2 setup (AWS console/CLI — infrastructure)
  ├─ TASK-458: Expand docker-compose.prod.yml (code)
  ├─ TASK-459: Drupal Dockerfile + Nginx config (code)
  ├─ TASK-460: Caddy Dockerfile + Caddyfile (code)
  └─ TASK-461: Platform Dockerfile.prod rewrite (code)
  All 5 are independent and can be developed in parallel.

Wave 2:            TASK-463
  └─ DNS configuration requires Elastic IP from TASK-462.
     Quick task (XS) — GoDaddy dashboard + API key generation.

Wave 3:            TASK-464
  └─ E2E validation requires ALL prior tasks deployed.
     Deploy → smoke test → full onboarding → provisioning cycle.
     Document issues; create follow-up bugs if needed.
```

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **GoDaddy API access** | Blocks Caddy SSL | Verify developer access before sprint starts. Fallback: Cloudflare DNS (transfer nameservers). |
| **Caddy GoDaddy plugin compatibility** | Blocks HTTPS | Custom `xcaddy` build required. If plugin fails, use Cloudflare DNS plugin or manual cert with certbot. |
| **Shared Docker volumes** | Provisioning breaks | Provisioning engine mounts `./provisioning` and `./drupal-site`. Production compose must replicate these paths exactly. Audit `provisioning.ts` volume references. |
| **Drupal base site install** | Sites don't resolve | First `drush site:install` creates baseline. Test DB connection and `sites.php` multisite routing before E2E. |
| **Next.js standalone mode** | Build failures | Currently not enabled. Adding `output: "standalone"` to `next.config.js` may surface bundling issues with provisioning engine's dynamic imports. Test build locally first. |
| **Prisma migration on startup** | Container crash loop | If DB isn't ready when platform starts, migrate fails. `depends_on: condition: service_healthy` on postgres is critical. Add retry logic in `start-prod.sh`. |
| **New UI components (shadcn/ui)** | Visual regressions | shadcn/ui Tailwind classes must compile correctly in production build. Verify `tailwind.config.ts` content paths include all component directories. |

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| XS | 1 | TASK-463 |
| M | 6 | TASK-458, TASK-459, TASK-460, TASK-461 (upgraded), TASK-462, TASK-464 |
| **Total** | **7 tasks** | |

## Definition of Done

- [ ] EC2 instance running with Elastic IP, Docker installed, security groups configured
- [ ] `docker compose -f docker-compose.prod.yml up -d` starts all 5 services (caddy, platform, postgres, drupal-web, mariadb)
- [ ] Caddy obtains wildcard TLS certificate for `*.drupalcms.app`
- [ ] `app.drupalcms.app` loads the platform app over HTTPS
- [ ] `{subdomain}.drupalcms.app` routes to Drupal with HTTPS
- [ ] Full 8-step onboarding flow completes including AI analysis calls
- [ ] Pipeline progress screen shows activity log and artifacts
- [ ] Blueprint generation → provisioning cycle completes on production
- [ ] Provisioned site is accessible and displays correct content/branding
- [ ] Provisioning callback updates platform DB with site status
- [ ] All environment variables documented in `.env.production.example`
- [ ] Setup reproducible from documentation (`docs/aws-setup.md`)
