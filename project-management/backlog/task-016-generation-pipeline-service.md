# TASK-016: Site Generation Pipeline Service & Queue Worker

**Story:** US-012, US-019
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M2 — AI Site Generation Engine

## Description
Create `SiteGenerationService` that orchestrates the generation pipeline and the `SiteGenerationWorker` queue worker that processes each step.

## Technical Approach
- `SiteGenerationService::generate(SiteProfile)`:
  - Set profile status to "generating"
  - Create queue items for each pipeline step (industry_analysis, page_building, content_generation, form_generation, brand_application) with sequential weights
  - Dispatch `SiteGenerationEvent::STARTED`
- `SiteGenerationWorker::processItem()`:
  - Load SiteProfile, update `generation_status` to current step
  - Execute the appropriate agent or service for the step
  - On final step completion: set status to "generated", dispatch `SiteGenerationEvent::COMPLETED`
  - On error: set status to "error", log details, dispatch `SiteGenerationEvent::FAILED`
- `SiteGenerationService::getStatus()`: return current step + progress data
- `SiteGenerationService::retry()`: re-queue from a specific step
- Create `GenerationStatusController` for polling endpoint at `/api/generation/{site_profile}/status`
- Create event classes: `SiteGenerationEvent`, `SiteGenerationEvents` (constants)

## Acceptance Criteria
- [ ] `generate()` dispatches queue items for all pipeline steps
- [ ] Queue worker processes steps sequentially
- [ ] Profile status updates at each step (visible via polling endpoint)
- [ ] Polling endpoint returns correct step statuses and progress percentage
- [ ] Error in any step marks generation as failed with details
- [ ] `retry()` re-queues from the failed step

## Dependencies
- TASK-002 (SiteProfile entity)
- TASK-011 (Industry Analyzer Agent — first step in pipeline)

## Files/Modules Affected
- `ai_site_builder/src/Service/SiteGenerationService.php`
- `ai_site_builder/src/Service/SiteGenerationServiceInterface.php`
- `ai_site_builder/src/Plugin/QueueWorker/SiteGenerationWorker.php`
- `ai_site_builder/src/Controller/GenerationStatusController.php`
- `ai_site_builder/src/Event/SiteGenerationEvent.php`
- `ai_site_builder/src/Event/SiteGenerationEvents.php`
- `ai_site_builder/ai_site_builder.routing.yml`
- `ai_site_builder/ai_site_builder.services.yml`
