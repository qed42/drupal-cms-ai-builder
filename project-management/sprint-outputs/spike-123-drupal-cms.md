# TASK-123 Spike Output: Drupal CMS Foundation

**Date:** 2026-03-18
**Status:** Complete

## 1. Drupal CMS Local Setup — ✅ PASS

- `composer create-project drupal/cms drupal-site` — works, creates project with 57+ contrib modules
- **PHP 8.4 required** (Drupal CMS 2.0 dependencies require >= 8.4.0)
- DDEV config: `ddev config --php-version=8.4 --project-type=drupal --docroot=web`
- Drupal 11.3.5, Drush 13.7.1, Canvas 1.2.0
- Default admin theme: Gin 5.0.12
- Default front-end theme: Mercury 1.0.2
- 102 modules enabled out of the box

## 2. CLI Installation — ✅ WORKS

**Command:**
```bash
drush site:install drupal_cms_installer \
  --account-name=admin \
  --account-pass=admin \
  --site-name="Site Name" \
  -y
```

**Result:** Full success. Install completes in ~30 seconds. Applies all Drupal CMS recipes (Starter template), enables Canvas, Gin, Mercury, all SEO/media/anti-spam/privacy modules.

**Note:** The installer profile (`drupal_cms_installer`) is self-removing — after install, the profile is uninstalled. This is expected behavior.

**Provisioning implication:** CLI install works without web UI automation. This is the simplest path for the provisioning engine.

## 3. Space DS + Canvas Compatibility — ✅ CONFIRMED

- `composer require drupal/space_ds:@dev` installs RC2 (1.0.0-rc2)
- `drush theme:install space_ds` + `drush config:set system.theme default space_ds` — works
- After `drush cr`, Canvas discovers **72 Space DS SDC components** as component entities
- Components register with correct `sdc.space_ds.space-{name}` IDs
- Component version hashes (xxh64) generated automatically
- All 11 hero banner variants, 3 CTA types, 6 team section variants, 5 text-media variants confirmed

**Canvas component entity format:**
- Entity type: `component` (config entity)
- ID format: `sdc.space_ds.space-{component-name}`
- Has `source_local_id` (SDC plugin ID: `space_ds:space-{name}`)
- Has `active_version` (xxh64 hash)

**Note:** 72 of 84 Space DS components registered in Canvas. The 12 missing are likely sub-components (accordion items, etc.) that don't register as standalone Canvas components.

## 4. Canvas Component Tree Format — ✅ FULLY DOCUMENTED

### Entity Type
- **Content entity:** `canvas_page` (not `node`)
- **Field:** `components` (field type: `component_tree`, cardinality: unlimited)
- Pages accessible at `/canvas-page/{id}`

### Component Tree Item Schema

Each component is stored as a **flat list item** (not nested JSON). The tree structure is expressed through `parent_uuid`/`slot` references.

```typescript
interface ComponentTreeItem {
  uuid: string;            // UUID v4 — unique per component instance
  component_id: string;    // Canvas component entity ID: "sdc.space_ds.space-hero-banner-style-01"
  component_version: string; // xxh64 hash (16 chars): "4b0bf2512604f31e"
  parent_uuid: string | null; // Parent component UUID, null = root
  slot: string | null;     // Slot name in parent, null = root
  inputs: Record<string, any>; // Component prop values (JSON)
  label?: string;          // Optional label for content authors
}
```

### Key Rules

1. **Flat list, tree via references:** Components stored as `ComponentTreeItem[]`. Parent-child relationships via `parent_uuid` + `slot`.
2. **Root components:** `parent_uuid = null`, `slot = null`
3. **Nested components:** `parent_uuid = <parent's uuid>`, `slot = <parent's slot name>`
4. **Strict prop validation:** Canvas validates ALL inputs against the SDC YAML schema on save:
   - Unknown props → `OutOfRangeException`
   - Missing required props → `LogicException`
   - Invalid enum values → `LogicException` with valid values listed
5. **Component version required:** Must match the `active_version` from the component entity
6. **Inputs are JSON:** Stored as JSON string in DB, but passed as PHP array when creating entities

### Programmatic Page Creation — VALIDATED

```php
use Drupal\Component\Uuid\Php as UuidGenerator;

$uuid_gen = new UuidGenerator();
$comp_storage = \Drupal::entityTypeManager()->getStorage('component');

// Get version hashes from component entities
$hero_ver = $comp_storage->load('sdc.space_ds.space-hero-banner-style-01')->getActiveVersion();
$cta_ver = $comp_storage->load('sdc.space_ds.space-cta-banner-type-1')->getActiveVersion();

$hero_uuid = $uuid_gen->generate();
$cta_uuid = $uuid_gen->generate();

$component_tree = [
  [
    'uuid' => $hero_uuid,
    'component_id' => 'sdc.space_ds.space-hero-banner-style-01',
    'component_version' => $hero_ver,
    'parent_uuid' => NULL,
    'slot' => NULL,
    'inputs' => [
      'title' => 'Welcome to Our Business',
      'sub_headline' => 'Built with AI',
    ],
  ],
  [
    'uuid' => $cta_uuid,
    'component_id' => 'sdc.space_ds.space-cta-banner-type-1',
    'component_version' => $cta_ver,
    'parent_uuid' => NULL,
    'slot' => NULL,
    'inputs' => [
      'title' => 'Get Started Today',
      'description' => 'Contact us for more info.',
      'width' => 'boxed-width',         // Required, enum: [boxed-width, full-width]
      'alignment' => 'center-align',    // Required, enum: [left-align, center-align]
    ],
  ],
];

$storage = \Drupal::entityTypeManager()->getStorage('canvas_page');
$page = $storage->create([
  'title' => 'My Page',
  'components' => $component_tree,
]);
$page->save();
// Page accessible at /canvas-page/{$page->id()}
```

### Nested Components — VALIDATED

```php
$container_uuid = $uuid_gen->generate();
$heading_uuid = $uuid_gen->generate();

$tree = [
  [
    'uuid' => $container_uuid,
    'component_id' => 'sdc.space_ds.space-container',
    'component_version' => $container_ver,
    'parent_uuid' => NULL,
    'slot' => NULL,
    'inputs' => ['width' => 'boxed-width', 'padding_top' => 'large', 'padding_bottom' => 'large'],
  ],
  [
    'uuid' => $heading_uuid,
    'component_id' => 'sdc.space_ds.space-heading',
    'component_version' => $heading_ver,
    'parent_uuid' => $container_uuid,   // <-- Nested inside container
    'slot' => 'content',                // <-- In container's "content" slot
    'inputs' => ['content' => 'Our Services', 'font' => 'displayLG-bold'],
  ],
];
```

## 5. Multisite — ✅ Standard Drupal Pattern

- Standard `sites/sites.php` + `sites/{directory}/settings.php` pattern
- CLI install supports `--sites-subdir` flag for per-site installation
- Each site gets its own database via `--db-url`
- Recipe system applies per-site during `drush site:install`
- No special Drupal CMS concerns — multisite is handled at the Drupal core level

## 6. Key Modules Status

| Module | Status | Notes |
|--------|--------|-------|
| Canvas | ✅ Enabled | 1.2.0, default page builder |
| Canvas AI | Available | 1.2.0, disabled by default |
| Webform | Available | 6.3.0-beta8, needs enabling |
| Metatag | Available | 2.2.0, needs enabling |
| Pathauto | ✅ Enabled | 8.x-1.14 |
| AI Core | Available | 1.3.0, disabled by default |
| AI Agents | Available | 1.2.3, disabled by default |
| Space DS | ✅ Enabled | 1.0.0-rc2, set as default |

## 7. Important Implications for Sprint 04

### For TASK-109b (Blueprint Generator → Component Trees):
- Must produce the exact `ComponentTreeItem[]` format (flat list with parent_uuid/slot refs)
- Must include `component_version` — obtain from the catalog (see `space-ds-canvas-catalog.json`)
- Must validate all inputs against component prop schemas (enums, required fields)
- Must generate UUIDs for each component instance

### For TASK-114 (Blueprint Import):
- Creates `canvas_page` entities (NOT nodes) with pre-built component trees
- Uses `\Drupal::entityTypeManager()->getStorage('canvas_page')->create()` API
- Component versions must be fetched from Canvas component entities at import time
- Path aliases need to be set separately (canvas_page has a `path` field)

### For TASK-111 (Provisioning Engine):
- CLI install command: `drush site:install drupal_cms_installer --account-name=admin --account-pass=admin --site-name="{name}" -y`
- PHP 8.4 required in DDEV/Docker
- Space DS needs `composer require drupal/space_ds:@dev` + `drush theme:install space_ds`
- After theme install, `drush cr` to register components in Canvas
- Webform, Metatag need `drush en webform metatag` after install

### Catalog Artifact
- Full component catalog exported to `project-management/sprint-outputs/space-ds-canvas-catalog.json`
- Contains all 72 components with: label, version hash, required props, prop types/enums/defaults, slots
- This catalog is the source of truth for TASK-109b component tree generation
