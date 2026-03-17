# TASK-033: Custom Domain Support

**Story:** US-031
**Priority:** P2
**Estimated Effort:** L
**Milestone:** M5 — Publishing & Subscription

## Description
Allow site owners to connect a custom domain to their published site.

## Technical Approach
- Add `custom_domain` base field to SiteProfile entity
- Domain settings page: `/site/settings/domain`
- Display DNS instructions (CNAME pointing to platform domain)
- DNS verification: check CNAME/A record via `dns_get_record()` PHP function
- On verification: update server config to route the domain to the site
- SSL provisioning for custom domains via Let's Encrypt certbot
- Redirect platform subdomain to custom domain after connection
- Create `DomainService` in `ai_site_builder_publish`:
  - `verifyDomain(string $domain)`: DNS lookup verification
  - `connectDomain(SiteProfile, string $domain)`: configure routing
  - `provisionSsl(string $domain)`: trigger certbot

## Acceptance Criteria
- [ ] Site owner can enter custom domain in settings
- [ ] DNS instructions displayed clearly
- [ ] Domain verification checks DNS records
- [ ] Verified domain routes to the site correctly
- [ ] SSL provisioned for custom domain
- [ ] Platform subdomain redirects to custom domain

## Dependencies
- TASK-029 (Publish Service)
- TASK-032 (SSL — base SSL infrastructure)

## Files/Modules Affected
- `ai_site_builder_publish/src/Service/DomainService.php`
- `ai_site_builder_publish/src/Service/DomainServiceInterface.php`
- `ai_site_builder_publish/src/Form/DomainSettingsForm.php`
- `ai_site_builder/src/Entity/SiteProfile.php` (add custom_domain field)
