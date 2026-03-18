# TASK-104: AI Industry Inference & Page Suggestion

**Story:** US-006, US-009
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M2 — Onboarding Journey

## Description
Implement AI API routes that analyze the user's "big idea" and audience to infer industry, suggest pages, and extract keywords. These run between Screens 3 and 4 of the wizard.

## Technical Approach
- Install OpenAI SDK (`openai` npm package)
- Create AI client wrapper in `src/lib/ai/client.ts`
- **API Route: `/api/ai/analyze`**
  - Input: `{ idea: string, audience: string }`
  - Calls OpenAI with structured output (JSON mode)
  - Prompt: "Analyze this business description. Return: industry (healthcare|legal|real_estate|restaurant|professional_services|other), keywords (5-10), compliance_flags (hipaa|ada|fair_housing|attorney_advertising|gdpr), tone (professional_warm|corporate|casual|friendly)"
  - Save inferred industry and keywords to onboarding_sessions.data
- **API Route: `/api/ai/suggest-pages`**
  - Input: `{ industry: string, idea: string, audience: string }`
  - Returns array of `{ slug, title, required }` page suggestions
  - Industry-specific defaults: healthcare gets "providers", legal gets "practice-areas", etc.
  - Save suggested pages to onboarding_sessions.data
- Both routes should handle AI errors gracefully with fallback to industry-based defaults

## Acceptance Criteria
- [ ] `/api/ai/analyze` returns valid industry, keywords, compliance_flags, tone
- [ ] `/api/ai/suggest-pages` returns 5-8 page suggestions appropriate to industry
- [ ] Healthcare description returns healthcare industry + hipaa compliance flag
- [ ] Legal description returns legal industry + attorney_advertising flag
- [ ] Fallback works when AI call fails (returns defaults based on industry)
- [ ] Results saved to onboarding_sessions.data

## Dependencies
- TASK-103 (Screens 1-3 — provides the input data)

## Files/Modules Affected
- `platform-app/src/lib/ai/client.ts`
- `platform-app/src/lib/ai/prompts.ts`
- `platform-app/src/app/api/ai/analyze/route.ts`
- `platform-app/src/app/api/ai/suggest-pages/route.ts`
