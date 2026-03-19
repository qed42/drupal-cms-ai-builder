# Sprint 04 — Bug Reports

## BUG-001: Dead code — front page path slug ignored

**Task:** TASK-114
**Severity:** Major
**Status:** Fixed

### Steps to Reproduce
1. Provide a blueprint JSON where the first page has `"slug": "home"`
2. Call `importPages()`
3. Observe front page is set to `/page/{entity_id}` not `/home`

### Expected Result
Front page should use the slug-based path alias (e.g., `/home`) since the entity also has that alias set.

### Actual Result
`$frontPagePath` is computed on lines 182-185 (with slug fallback) but **never used**. Lines 187-189 always hardcode `/page/{entity_id}`. The `$frontPagePath` variable is dead code.

### Test Reference
`BlueprintImportService.php:182-189`

---

## BUG-002: Static \Drupal::service() call inside DI service — webform handler

**Task:** TASK-114
**Severity:** Major
**Status:** Fixed

### Steps to Reproduce
1. Import a blueprint with a contact form definition
2. `importForms()` creates webform and adds email handler

### Expected Result
All dependencies should be injected via constructor.

### Actual Result
Line 344 uses `\Drupal::service('plugin.manager.webform.handler')` directly inside the service class. This violates DI principles, makes the service untestable, and is inconsistent with the rest of the class.

### Test Reference
`BlueprintImportService.php:344`

---

## BUG-003: Static \Drupal::moduleHandler() call inside Drush command with DI

**Task:** TASK-112
**Severity:** Major
**Status:** Fixed

### Steps to Reproduce
1. Run `drush ai-site-builder:import-config --industry=healthcare`
2. Command uses `\Drupal::moduleHandler()` statically

### Expected Result
`ModuleHandlerInterface` should be injected via constructor (the class already uses `AutowireTrait`).

### Actual Result
`ImportConfigCommands.php:62` calls `\Drupal::moduleHandler()->moduleExists(...)` directly instead of using injected dependency. The class only injects `ConfigFactoryInterface` and `ModuleInstallerInterface`, but not `ModuleHandlerInterface`.

### Test Reference
`ImportConfigCommands.php:62`

---

## BUG-004: Pathauto batchUpdate() called outside batch context

**Task:** TASK-112
**Severity:** Major
**Status:** Fixed

### Steps to Reproduce
1. Run `drush ai-site-builder:configure-site`
2. Observe `runPathautoUpdate()` calls `batchUpdate('create', $result = [])` directly

### Expected Result
Should use Batch API (like `PathautoCommands.php` does) since `batchUpdate()` expects `$context` to persist across calls for large datasets.

### Actual Result
Line 69 calls `batchUpdate` with a local `$result = []` reference. Since `batchUpdate` uses `&$context` for sandbox/progress tracking, calling it directly outside Batch API means context doesn't persist across entity types. For large content sets, each entity type's update will start from scratch and the "finished" signal may not work correctly.

### Test Reference
`ConfigureSiteCommands.php:60-71`

---

## BUG-005: Static \Drupal::service() call for pathauto in DI class

**Task:** TASK-112
**Severity:** Major
**Status:** Fixed

### Steps to Reproduce
1. `ConfigureSiteCommands.php:62` calls `\Drupal::service('plugin.manager.alias_type')` statically

### Expected Result
Service should be injected via constructor or `#[Autowire]` attribute.

### Actual Result
Direct static service call despite class using `AutowireTrait`. Inconsistent with DI pattern used elsewhere in the class.

### Test Reference
`ConfigureSiteCommands.php:62`

---

## BUG-006: Injected CacheTagsInvalidatorInterface never used

**Task:** TASK-112
**Severity:** Minor
**Status:** Fixed

### Steps to Reproduce
1. Review `ConfigureSiteCommands.php` constructor — injects `CacheTagsInvalidatorInterface`
2. Line 52 calls `drupal_flush_all_caches()` procedurally instead

### Expected Result
Either use the injected service or don't inject it.

### Actual Result
`CacheTagsInvalidatorInterface` injected in constructor (line 28) but never referenced. Dead injection.

### Test Reference
`ConfigureSiteCommands.php:28,52`

---

## BUG-007: Dead ternary in BrandTokenService — same value both branches

**Task:** TASK-115
**Severity:** Minor
**Status:** Open

### Steps to Reproduce
1. Review `BrandTokenService.php:283`

### Expected Result
Different fallback font stacks for heading vs body (e.g., `sans-serif` vs `serif`).

### Actual Result
`$fallback = ($key === 'heading') ? 'sans-serif' : 'sans-serif';` — both branches return identical value. The ternary is meaningless.

### Test Reference
`BrandTokenService.php:283`

---

## BUG-008: Double file read in BrandTokenService::applyTokens()

**Task:** TASK-115
**Severity:** Minor
**Status:** Open

### Steps to Reproduce
1. Call `applyTokens($tokensPath)` — reads tokens file on line 108
2. Then calls `generateTokenCss($tokensPath)` on line 111, which reads the same file again

### Expected Result
File should be read once and the parsed data passed to internal methods.

### Actual Result
The tokens JSON is parsed twice — once by `readTokensFile()` in `applyTokens()` and again inside `generateTokenCss()`. Unnecessary I/O.

### Test Reference
`BrandTokenService.php:107-112`

---

## BUG-009: Provisioning engine settings.php template — potential string injection

**Task:** TASK-111
**Severity:** Minor
**Status:** Open

### Steps to Reproduce
1. Provide a domain containing a single quote (e.g., `o'malley.com`)
2. Generated settings.php will have broken PHP string syntax

### Expected Result
Template values should be escaped for PHP string context.

### Actual Result
`02-generate-settings.ts` uses JavaScript template literals to generate PHP code. Values like `${config.database.password}` are injected directly into PHP single-quoted strings. If the password contains `'` characters, the PHP will be syntactically invalid.

### Test Reference
`provisioning/src/steps/02-generate-settings.ts:18-45`

---

## BUG-010: Provisioning step 09 re-imports fs/promises unnecessarily

**Task:** TASK-111
**Severity:** Minor
**Status:** Open

### Steps to Reproduce
1. Review `09-apply-brand.ts:18`

### Expected Result
Use the `readFile` already available at top of module.

### Actual Result
Line 18 uses `await import("node:fs/promises").then(...)` for dynamic import, but `readFile` could simply be imported statically at the top of the file (like `writeFile` already is on line 1).

### Test Reference
`provisioning/src/steps/09-apply-brand.ts:18-20`
