# TASK-459: Create Production Drupal Container (Dockerfile + Nginx)

**Story:** US-088
**Effort:** M
**Milestone:** M23 — AWS Deployment

## Description
Create a production Drupal container based on `php:8.4-fpm-alpine` that replaces DDEV for AWS deployment. Includes PHP extensions, Composer dependencies, Nginx configuration, and proper file permissions.

## Implementation Details
1. Create `drupal-site/Dockerfile` per architecture spec (Section 6)
2. Install PHP extensions: GD (freetype+jpeg), intl, opcache, pdo_mysql, zip
3. Install Composer from official image
4. Create `drupal-site/docker/nginx.conf` with Drupal-specific rewrite rules
5. Run `composer install --no-dev --optimize-autoloader` during build
6. Set `www-data` ownership on sites directory
7. Combined entrypoint: `php-fpm -D && nginx -g 'daemon off;'`

## Acceptance Criteria
- [ ] `docker build drupal-site/` completes without errors
- [ ] Container serves Drupal on port 80 with clean URLs
- [ ] PHP-FPM processes PHP files; Nginx serves static assets with caching headers
- [ ] Image styles route correctly (`/sites/*/files/styles/`)
- [ ] Dotfiles return 403
- [ ] `www-data` owns `/var/www/html/web/sites`

## Files
- `drupal-site/Dockerfile` (new)
- `drupal-site/docker/nginx.conf` (new)
