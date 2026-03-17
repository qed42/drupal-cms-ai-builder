# TASK-032: SSL Provisioning

**Story:** US-032
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M5 — Publishing & Subscription

## Description
Configure automatic SSL for platform subdomains and establish the approach for custom domain SSL.

## Technical Approach
- Platform subdomain SSL: wildcard certificate for `*.{platform-domain}`
  - Provision via Let's Encrypt or hosting provider
  - Configure in Nginx/Apache server config (not Drupal-level)
- HTTPS enforcement: redirect HTTP → HTTPS at server level
- HSTS headers: add via `settings.php` or `.htaccess`
- Custom domain SSL (future): document the approach (Let's Encrypt per-domain via certbot)
- For MVP: platform subdomain SSL is sufficient; custom domain SSL deferred until TASK-033

## Acceptance Criteria
- [ ] Platform subdomains served over HTTPS
- [ ] HTTP requests redirected to HTTPS
- [ ] HSTS headers present
- [ ] SSL certificate valid and auto-renewing
- [ ] No mixed content warnings on generated sites

## Dependencies
- TASK-029 (Publish Service — sites must be publishable)
- Hosting infrastructure configured

## Files/Modules Affected
- Server configuration (Nginx/Apache)
- `web/sites/default/settings.php` (HSTS, trusted host patterns)
