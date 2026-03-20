# TASK-306: ADR — Header/footer architecture (theme regions vs Canvas components)

**Story:** REQ-space-ds-component-gap-analysis §3.1 (Header/Footer gaps)
**Priority:** P0
**Estimated Effort:** S
**Milestone:** Component Coverage Expansion

## Description

The gap analysis flags missing header/navbar and footer components as P0 blockers. However, in the Drupal Canvas + Space theme architecture, headers and footers are **theme region concerns**, not page-level Canvas components. They are configured via:
- Drupal block system (branding block, menu block, footer blocks)
- Space theme regions (header, footer)
- Site configuration (site name, logo, slogan)

This task produces an Architecture Decision Record (ADR) that documents:
1. Whether header/footer should be Canvas organisms or theme-region blocks
2. What the provisioning engine needs to configure (menus, branding, footer content)
3. Whether any new Drupal blocks or config entities are needed

## Technical Approach

1. **Audit Space theme regions** — Check what regions Space DS theme defines (header, footer, sidebar, etc.)
2. **Audit provisioning steps** — `08-import-blueprint.ts` and `drush ai-site-builder:configure-site` already handle menu creation. Verify footer/header block placement.
3. **Document decision** in `project-management/requirements/architecture/ADR-header-footer.md`
4. **Create follow-up implementation tasks** if provisioning gaps are found (e.g., footer block not configured, logo not placed)

## Expected Recommendation

Headers and footers should remain at the **theme-region level** (not Canvas component tree) because:
- Space theme already defines header/footer regions
- Canvas component trees represent page body content only
- Menus are already built by `configure-site` drush command
- Footer content (links, copyright, social) is site-wide, not per-page

The provisioning engine may need enhancement to:
- Place branding block (logo + site name) in header region
- Configure footer blocks (copyright text, social links, footer menu)
- Ensure Space theme footer renders the `space-footer-logo-content` molecule

## Acceptance Criteria

- [ ] ADR document created with decision, context, and consequences
- [ ] Space theme regions audited and documented
- [ ] Provisioning engine gaps identified (if any)
- [ ] Follow-up implementation tasks created for any gaps found

## Dependencies
- None

## Files/Modules Affected
- `project-management/requirements/architecture/ADR-header-footer.md` (new)
- `drupal-site/web/themes/` (audit only)
- `provisioning/src/steps/` (audit only)
