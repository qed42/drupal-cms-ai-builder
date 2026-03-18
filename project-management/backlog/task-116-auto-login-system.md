# TASK-116: Auto-Login System (JWT Auth Handoff)

**Story:** US-020 (Canvas Editor Integration)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M4 — Site Editing

## Description
Implement the JWT-based auto-login system that allows users to go from the Next.js dashboard to their Drupal site's Canvas editor without re-authenticating.

## Technical Approach

### Drupal Side:
- **AutoLoginService:**
  - `validateToken(string $jwt): ?array` — Decodes JWT, verifies RS256 signature using shared secret from `$settings['ai_site_builder_jwt_secret']`, checks expiration (60s TTL)
  - `findOrCreateUser(string $email, string $name): UserInterface` — Finds existing user by email or creates new user with `site_owner` role

- **AutoLoginController:**
  - Route: `/auto-login?token={jwt}&redirect={path}`
  - Validates JWT token
  - Finds/creates Drupal user
  - Calls `user_login_finalize()` to create session
  - Redirects to `$redirect` (default: Canvas editor or front page)
  - On invalid/expired token: redirect to error page with "Please try again from your dashboard" message

- **Route definition:**
  ```yaml
  ai_site_builder.auto_login:
    path: '/auto-login'
    defaults:
      _controller: '\Drupal\ai_site_builder\Controller\AutoLoginController::login'
    requirements:
      _access: 'TRUE'  # Publicly accessible (token provides auth)
  ```

### Next.js Side:
- **API Route: `/api/auth/create-login-token`**
  - Input: `{ site_id }` (from authenticated session)
  - Looks up site domain from Platform DB
  - Signs JWT with payload: `{ sub: email, name, site: domain, iat, exp: +60s, jti: uuid }`
  - Returns: `{ token, url: "https://{domain}/auto-login?token={jwt}&redirect=/canvas" }`

- **Dashboard "Edit Site" button:**
  - Calls `/api/auth/create-login-token`
  - Opens returned URL in new tab

## Acceptance Criteria
- [ ] JWT token generated with 60s TTL
- [ ] Drupal validates JWT signature correctly
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Valid token creates Drupal user session
- [ ] User is redirected to Canvas editor after login
- [ ] New users automatically get `site_owner` role
- [ ] Existing users are recognized and logged in

## Dependencies
- TASK-111 (Provisioning engine — site must exist)
- TASK-117 (Dashboard — "Edit Site" button)

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/src/Service/AutoLoginService.php`
- `web/modules/custom/ai_site_builder/src/Controller/AutoLoginController.php`
- `web/modules/custom/ai_site_builder/ai_site_builder.routing.yml`
- `platform-app/src/app/api/auth/create-login-token/route.ts`
- `platform-app/src/lib/jwt.ts`
