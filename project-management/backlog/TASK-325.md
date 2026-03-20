# TASK-325: Integrate Pexels image sourcing into blueprint generation pipeline

**Priority:** P1
**Estimated Effort:** L
**Milestone:** Post-M15 — Content Quality

## Description

Blueprint generation must source real images from Pexels for every component that needs images. Currently, image props may be empty or use placeholder paths. Each section that requires images (heroes, image+text splits, team photos, testimonial avatars, portfolio cards) should have a relevant Pexels image downloaded and referenced in the blueprint.

## Technical Approach

1. **Pexels API integration** — Add a service that queries the Pexels API with contextual search terms derived from the section content (e.g., hero title, service name, team member role)
2. **Image download** — Download selected images to the Drupal public files directory during provisioning
3. **Blueprint image references** — Component tree image props should reference the downloaded file paths
4. **Per-section image selection** — Each section needing images gets a unique, contextually relevant image (no reuse)

## Acceptance Criteria

- [ ] Every component with an image prop has a real Pexels image
- [ ] Images are contextually relevant to the section content
- [ ] Images are downloaded to Drupal's public files directory
- [ ] No duplicate images across sections on the same page
- [ ] Pexels API attribution requirements met

## Dependencies
- Pexels API key configuration
- TASK-324 (NULL image fix must land first)

## Files Affected
- `platform-app/src/lib/ai/image-service.ts` (new)
- `platform-app/src/lib/blueprint/generator.ts`
- `provisioning/src/steps/` (image download step)
