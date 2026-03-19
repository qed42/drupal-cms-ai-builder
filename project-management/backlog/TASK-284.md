# TASK-284: Replace auto-login with Drupal one-time login link and add "Visit Site" CTA

**Type:** Bug + Feature
**Priority:** P1 — High (security: auto-login token is a custom JWT bypass; UX: no way to visit the live site)
**Estimated Effort:** Small-Medium (2-4 hours)
**Dependencies:** None
**Affects:** Dashboard SiteCard for live sites

## Problem

### Bug: Auto-login uses custom JWT token route

The "Edit Site" button creates a custom JWT token via `/api/auth/create-login-token` and redirects to `/auto-login?token=...&redirect=/canvas` on the Drupal site. This is a custom authentication bypass that:

- Requires a custom `/auto-login` route on the Drupal side to validate the JWT and create a session
- Is less secure than Drupal's built-in one-time login mechanism (which is time-limited and single-use)
- Adds maintenance burden for a custom auth flow

**Current flow:**
```
SiteCard → POST /api/auth/create-login-token → JWT token
  → window.open({drupalUrl}/auto-login?token=...&redirect=/canvas)
```

**Expected flow:**
```
SiteCard → POST /api/auth/create-one-time-login → Drush uli output
  → window.open({one-time-login-url}?destination=/canvas)
```

### Missing Feature: No "Visit Site" CTA

Users with live sites have no way to visit their public-facing homepage from the dashboard. The only action is "Edit Site" (which opens the Canvas editor). Users need a simple link to see their live site.

## Acceptance Criteria

1. "Edit Site" button generates a Drupal one-time login link (via `drush uli` or equivalent) instead of a custom JWT auto-login URL
2. The one-time login link redirects to `/canvas` (the Canvas editor) after authentication
3. The one-time login link is single-use and time-limited (Drupal's default behavior)
4. The custom `/auto-login` route on the Drupal side can be removed (or deprecated)
5. A "Visit Site" button/link appears on SiteCard for live sites, opening the site homepage (`drupalUrl`) in a new tab
6. "Visit Site" is visually secondary to "Edit Site" (ghost/outline style)

## Implementation Notes

### One-time login generation

Replace the JWT-based approach with a Drush `user:login` (uli) command executed via `docker exec`:

**API route (`/api/auth/create-login-token/route.ts`):**
```
// Instead of creating a JWT:
// Execute: drush --uri={domain} user:login --uid=1 --redirect-path=/canvas
// Parse the one-time login URL from stdout
// Return: { url: "https://{domain}/user/reset/1/{timestamp}/{hash}/login?destination=/canvas" }
```

This uses Drupal's built-in `user.reset.login` route which is:
- Time-limited (default: 24 hours, configurable)
- Single-use (hash is invalidated after first use)
- No custom module code needed on the Drupal side

### "Visit Site" CTA

In `SiteCard.tsx`, add for `status === "live"` alongside the existing "Edit Site" button:
```
<a href={site.drupalUrl} target="_blank" rel="noopener noreferrer">
  Visit Site
</a>
```

Styled as a ghost/outline button (matching the existing "Blueprint JSON" button style).

## Files to Modify

- `platform-app/src/app/api/auth/create-login-token/route.ts` — Replace JWT creation with Drush uli execution
- `platform-app/src/components/dashboard/SiteCard.tsx` — Add "Visit Site" button for live sites
- `platform-app/src/lib/jwt.ts` — Remove `createAutoLoginToken` if no longer used elsewhere
- `drupal-site/web/modules/custom/ai_site_builder/` — Remove or deprecate custom `/auto-login` route handler (if it exists as a controller)
