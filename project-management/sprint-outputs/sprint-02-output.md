# Sprint 02 Output: Onboarding Wizard

**Completed:** 2026-03-17

## Tasks Delivered

### TASK-005: Trial Activation Service — DONE
- Created `ai_site_builder_trial` submodule under `modules/`
- `TrialManagerInterface` with `startTrial()`, `isActive()`, `getRemainingDays()`
- `TrialManager` service using DI (entity_type.manager, datetime.time)
- Integrated with `RegistrationForm` — uses TrialManager when available, fallback for when module not enabled
- Trial activates automatically on registration (14-day period)
- Active subscription check bypasses trial expiry

### TASK-006: Onboarding Wizard Framework — DONE
- `OnboardingWizardForm` extending `FormBase` with step management (1-5)
- AJAX-powered step navigation via `#ajax` callbacks (Next/Back buttons)
- Progress indicator showing "Step X of 5" with completed/current/upcoming states
- `OnboardingController` updated to render wizard form instead of placeholder
- CSS library (`ai_site_builder/onboarding_wizard`) with styles for progress bar, cards, buttons
- `OnboardingRedirectSubscriber` redirects site_owner users with incomplete onboarding
- Each step saves data to SiteProfile entity on "Next" click
- Returning users resume at their current step

### TASK-007: Wizard Step 1 — Site Basics — DONE
- Fields: site_name (required, 2-100 chars), tagline (optional, 255 chars), logo (managed_file, PNG/JPG/SVG, 5MB max), admin_email (required, pre-filled from user email)
- Validation: site_name min 2 chars, file type/size via managed_file validators
- Saves to SiteProfile on "Next", makes uploaded files permanent

### TASK-008: Wizard Step 2 — Industry Selection — DONE
- Loads industry taxonomy terms and renders as radio buttons with card-style CSS
- Single selection with visual feedback
- "Other" selection reveals textarea via Drupal `#states` (conditional visibility)
- Validation: industry required; if "Other", description text required
- Saves industry term reference + industry_other text to SiteProfile

### TASK-009: Wizard Step 3 — Brand Input — DONE
- Color picker: 3 native HTML5 color inputs (primary, secondary, accent)
- Industry-aware default palettes (6 palettes mapped to industry terms)
- Font selector: 8 curated Google Font pairings as radio buttons
- Reference URLs: 3 URL inputs with URL validation
- Brand guidelines: managed_file upload (PDF/PNG/JPG, 10MB max)
- All fields optional — defaults applied from industry palette

### TASK-010: Wizard Step 4 — Business Context — DONE
- Services: textarea (required, one per line)
- Target audience: textarea with 500-char max
- Competitors: 3 text inputs (optional)
- CTAs: 5 text inputs with placeholder examples (Book Now, Get a Quote, etc.)
- Validation: at least one service required, target_audience length check
- Saves to multi-value SiteProfile fields (competitors, ctas)

## Verification Results

| Check | Result |
|-------|--------|
| TrialManager service loads | PASS |
| `isActive()` / `getRemainingDays()` work | PASS |
| Trial submodule enables cleanly | PASS |
| Wizard form loads at `/onboarding` | PASS |
| Step 1 fields render (site_name, tagline, logo, admin_email) | PASS |
| Step 2 loads 6 industry terms | PASS |
| Step 3 has industry-aware palettes (6) and font pairings (8) | PASS |
| Step 4 fields render with placeholders | PASS |
| AJAX navigation buttons present | PASS |
| Progress indicator renders | PASS |
| CSS library attached | PASS |
| Onboarding redirect subscriber registered | PASS |
| Cache clear succeeds | PASS |

## Architecture Decisions Made During Implementation

1. **Drupal Form API AJAX over Alpine.js**: Used native Drupal `#ajax` for step navigation instead of Alpine.js. Simpler integration, no additional JS library dependency. Alpine.js can be layered on later for animations.
2. **HTML5 native color picker**: Used `#type => 'color'` instead of a third-party JS color picker library. Works in all modern browsers, zero additional dependencies.
3. **Drupal #states for conditional fields**: Used `#states` API for "Other" industry visibility instead of custom JS. Standard Drupal pattern.
4. **Trial submodule pattern**: Created `ai_site_builder_trial` as a submodule under `modules/` to keep trial logic decoupled. RegistrationForm gracefully degrades if module not enabled.
5. **Font pairing selection**: Stored as label → [heading, body] mapping. The form shows the pairing label, saves the individual font names to SiteProfile.

## Files Created/Modified

```
web/modules/custom/ai_site_builder/
├── ai_site_builder.libraries.yml (NEW)
├── ai_site_builder.services.yml (MODIFIED — added event subscriber)
├── css/
│   └── onboarding-wizard.css (NEW)
├── modules/
│   └── ai_site_builder_trial/
│       ├── ai_site_builder_trial.info.yml (NEW)
│       ├── ai_site_builder_trial.services.yml (NEW)
│       └── src/Service/
│           ├── TrialManager.php (NEW)
│           └── TrialManagerInterface.php (NEW)
└── src/
    ├── Controller/
    │   └── OnboardingController.php (MODIFIED — renders wizard form)
    ├── EventSubscriber/
    │   └── OnboardingRedirectSubscriber.php (NEW)
    └── Form/
        ├── OnboardingWizardForm.php (NEW)
        └── RegistrationForm.php (MODIFIED — TrialManager integration)
```

## Next Steps

- Invoke `/qa sprint-02` for Playwright test automation
- Sprint 03: Wizard Step 5 (AI-generated industry questions)
