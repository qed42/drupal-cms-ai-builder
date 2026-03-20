# TASK-318: Update BlueprintImportService for slot-based Canvas component trees

**Story:** Space DS v2 Migration
**Priority:** P0
**Estimated Effort:** L
**Milestone:** Space DS v2 Migration

## Description

The Drupal `BlueprintImportService` currently handles flat component trees where organisms are direct children of containers. The new Space DS v2 component trees are deeply nested with named slots:

```
container → content slot
  section-heading → (leaf)
  flexi → column_one/two/three/four slots
    heading → (leaf)
    text → (leaf)
    image → (leaf)
```

The service must correctly create Canvas component entities with parent-child-slot relationships.

## Technical Approach

### 1. Update component tree parsing

Current parsing likely reads:
```json
{ "component_id": "...", "parent_uuid": "...", "slot": "content", "inputs": {...} }
```

Verify this already supports arbitrary depth and named slots. If it only handles one level of nesting (container → child), it needs to support N-level nesting.

### 2. Handle new Canvas image objects

Many v2 components use `$ref: json-schema-definitions://canvas.module/image` for image props. The import service must create proper Canvas image references:

```php
// Input from tree
'image' => ['src' => '/path/to/image.jpg', 'alt' => 'Description', 'width' => 420, 'height' => 322]

// Canvas expects media entity reference or inline image
```

### 3. Handle HTML content props

Props with `contentMediaType: text/html` need to be passed as HTML strings, not plain text. Verify the import service doesn't sanitize/strip HTML for these fields.

### 4. Handle slider child components

The `space-slider` uses a `slide_item` slot where each child is a separate slide. The import service must handle multiple children in the same slot.

### 5. Handle header/footer placement

Determine where Canvas expects header/footer components:
- As block content in theme regions?
- As special Canvas layout entities?
- As the first/last items in the page Canvas tree?

### 6. Update component version lookup

The `canvas-component-versions` lookup may need updating for renamed/new components.

## Acceptance Criteria

- [ ] N-level nested component trees import correctly (container → flexi → atoms)
- [ ] Named slots (column_one, column_two, slide_item, cta_content, etc.) map correctly
- [ ] Canvas image objects created for components with `$ref` image props
- [ ] HTML content preserved for `contentMediaType: text/html` props
- [ ] Multiple children in same slot (slider items) handled correctly
- [ ] Component versions resolve for all 31 new components
- [ ] Header/footer placed in correct Canvas regions

## Dependencies
- TASK-312 (manifest — component IDs)
- TASK-314 (tree builder — output format)

## Files/Modules Affected
- `drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php`
- `drupal-site/web/modules/custom/ai_site_builder/src/Drush/Commands/ImportBlueprintCommands.php`
- `provisioning/src/steps/08-import-blueprint.ts` (if tree format changes)
