# TASK-464: End-to-End Production Validation

**Story:** US-089
**Effort:** M
**Milestone:** M23 — AWS Deployment

## Description
Validate the complete user journey on AWS — from account creation through onboarding to a live provisioned Drupal site. Confirm all services work together in the production environment.

## Implementation Details
1. Deploy all containers: `docker compose -f docker-compose.prod.yml up -d`
2. Verify Prisma migrations run automatically via platform startup script (check logs)
3. Install Drupal base site: `docker compose exec drupal-web drush site:install`
4. Verify HTTPS on `app.drupalcms.app` (platform loads, shadcn/ui components render)
5. Create account, complete full 8-step onboarding flow:
   - Describe → Pages → Images → Review Settings → Progress (with activity log + pipeline artifacts)
6. Verify pipeline progress screen shows live activity log messages and phase artifacts
7. Trigger blueprint generation → provisioning → verify site at `{subdomain}.drupalcms.app`
8. Verify provisioning callback updates platform database (including pipelineMessages/pipelineArtifacts)
9. Document any environment-specific issues found

## Acceptance Criteria
- [ ] Platform loads at `https://app.drupalcms.app` within 2 seconds
- [ ] Full 8-step onboarding flow completes including AI analysis calls
- [ ] Pipeline progress screen shows activity log and phase artifacts
- [ ] Blueprint generation pipeline succeeds
- [ ] Provisioned site accessible at `{subdomain}.drupalcms.app` with HTTPS
- [ ] Site has correct content, branding, and images
- [ ] Provisioning callback updates platform DB with site status
- [ ] shadcn/ui components and Tailwind styles render correctly in production
- [ ] All issues documented and resolved or tracked as follow-up bugs

## Dependencies
- TASK-458, TASK-459, TASK-460, TASK-461, TASK-462, TASK-463

## Files
- `docs/e2e-validation-checklist.md` (new — test checklist and results)
