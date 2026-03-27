# TASK-439: Analyze Image API Endpoint

**Story:** US-082
**Effort:** S
**Milestone:** M22 — User-Uploaded Images

## Description
Create `POST /api/ai/analyze-image` API endpoint that accepts an image path and site ID, loads business context from the onboarding session, calls the image description service, and returns the analysis result.

## Implementation Details
- Endpoint: `POST /api/ai/analyze-image`
- Request body: `{ imagePath: string, siteId: string }`
- Loads business context (idea, industry, audience) from `OnboardingSession.data` for the site
- Calls `analyzeImage()` from TASK-435's service
- Returns: `{ description, tags[], dominant_colors[], subject, orientation }`
- Validates `userId` owns the `siteId` (authorization check)
- Error handling: returns 400 for invalid input, 404 for missing session, 500 for analysis failure

## Acceptance Criteria
- [ ] Endpoint accepts image path and site ID
- [ ] Business context loaded from onboarding session
- [ ] Authorization check: user must own the site
- [ ] Returns complete `ImageAnalysisResult`
- [ ] Proper error codes for failure cases

## Dependencies
- TASK-435 (image description service)

## Files
- `platform-app/src/app/api/ai/analyze-image/route.ts` (new)
