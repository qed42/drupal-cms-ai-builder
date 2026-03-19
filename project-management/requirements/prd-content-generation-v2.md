# Product Requirements Document: Content Generation v2

## AI-Powered Content Pipeline, Review Workflow & Provisioning Enhancements

**Version:** 2.0
**Date:** 2026-03-19
**Status:** Draft
**Author:** Product Owner
**Supersedes:** Sections of PRD v1.0 related to content generation (FR-2xx, FR-3xx)

---

## 1. Executive Summary

The current AI content generation pipeline produces shallow, placeholder-quality output (~200-400 words per site) using a single-pass, single-model approach that fails to meet production website standards. This PRD defines a multi-sprint initiative to overhaul the content pipeline into a transparent, multi-phase system (Research, Plan, Generate, Review) with model-agnostic AI provider support, full content review and inline editing capabilities, granular provisioning progress visibility, per-site database isolation, and a structured quality assurance framework with synthetic test cases and automated Playwright tests. The goal is to produce sites with 2,000-5,000+ words of contextual, industry-specific content that users can review, edit, and approve before provisioning.

---

## 2. Problem Statement

**Who:** Small to mid-sized business owners who use the AI website builder to create professional Drupal CMS websites without technical expertise.

**Problem:** The current system has five critical gaps:

1. **Content is too shallow.** The generator produces ~200-400 words across an entire site. Service descriptions are 2-3 generic sentences. About pages have a title and one sentence. No FAQ, blog, or long-form content is generated. Real production websites need 2,000-5,000+ words of meaningful, industry-specific content.

2. **No content review before provisioning.** Users go directly from wizard submission to a provisioned Drupal site with no opportunity to review, edit, or approve the generated content. If the AI produces inaccurate or off-tone content, the user discovers it only after provisioning completes (~3 minutes later).

3. **Black-box generation.** Users see a spinner for 30-60 seconds with no insight into what the AI is doing. They cannot see the research, content plan, or generation rationale, which reduces trust and makes failures opaque.

4. **Single AI provider lock-in.** The system is hardcoded to OpenAI's `gpt-4o-mini` model. There is no mechanism to switch providers, test different models, or leverage stronger models for quality-critical phases.

5. **No structured quality evaluation.** There are no synthetic test cases, evaluation rubrics, or automated tests to measure content quality across industries, making it impossible to systematically improve generation.

**Impact:** Users receive websites that look like wireframes with lorem ipsum, undermining trust in the platform and requiring significant manual editing in Drupal Canvas to reach production quality.

---

## 3. User Personas

### 3.1 Sarah — Small Business Founder (Primary)

| Attribute | Detail |
|-----------|--------|
| **Role** | Owner of a family dental practice |
| **Tech Skill** | Low — comfortable with email and social media |
| **Goal** | Launch a professional website with accurate service descriptions, provider bios, and patient-facing content |
| **Pain Points** | Cannot write compelling web copy herself; previous AI tools produced generic content that didn't reflect her practice |
| **Success Criteria** | Generated content mentions her actual services (cosmetic dentistry, implants, pediatric care); content reads as if written by someone who understands dentistry; she can tweak wording before the site goes live |

### 3.2 Marcus — Marketing Manager (Primary)

| Attribute | Detail |
|-----------|--------|
| **Role** | Marketing manager at a real estate firm |
| **Tech Skill** | Medium — can edit CMS content, understands SEO basics |
| **Goal** | Launch an SEO-optimized site with neighborhood guides, agent profiles, and lead capture |
| **Pain Points** | Needs to review content for brand voice compliance before publishing; wants to regenerate specific sections without redoing the entire site |
| **Success Criteria** | Can preview all pages in a readable format before provisioning; can edit specific sections inline; regenerated sections maintain consistency with the rest of the site |

### 3.3 Priya — Agency Developer (Secondary)

| Attribute | Detail |
|-----------|--------|
| **Role** | Web developer at a digital agency building client prototypes |
| **Tech Skill** | High — Drupal expertise, understands component architecture |
| **Goal** | Rapidly generate client site prototypes with enough content depth to demo convincingly |
| **Pain Points** | Current output requires heavy manual content writing; wants to switch AI models to find the best quality/cost tradeoff |
| **Success Criteria** | Can configure AI provider via environment variable; generated content is good enough to present to clients as a starting point |

### 3.4 DevOps Engineer (Internal)

| Attribute | Detail |
|-----------|--------|
| **Role** | Platform engineer managing the multi-tenant infrastructure |
| **Tech Skill** | High — infrastructure and security focus |
| **Goal** | Ensure tenant isolation, database security, and observable provisioning |
| **Pain Points** | All sites currently share database credentials; provisioning failures are hard to diagnose without step-level visibility |
| **Success Criteria** | Each site has isolated database credentials; provisioning progress is visible at the step level; no cross-tenant data access is possible |

---

## 4. Functional Requirements

### FR-1xx: Onboarding Enhancements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-101 | **Industry-specific follow-up questions** | Must | After industry detection, the wizard presents 2-4 targeted follow-up questions. Examples: Healthcare → "What are your top 3 specialties?", "Do you accept insurance?"; Legal → "What are your practice areas?", "Do you offer free consultations?"; Restaurant → "What cuisine type?", "Do you offer delivery/catering?". Questions are configurable per industry in a JSON/config file, not hardcoded in components. |
| FR-102 | **Key differentiators prompt** | Must | A dedicated text input asking "What makes your business different from competitors?" (suggested 1-3 sentences). This input is passed to the Research phase as a primary signal. Placeholder text provides an example answer per detected industry. |
| FR-103 | **Reference URL input** | Should | An optional field where users can provide 1-3 URLs of websites they admire (competitors or aspirational). The Research phase can analyze these for tone, structure, and content patterns. URLs are stored but never scraped without user consent. |
| FR-104 | **Content tone selection** | Must | Present 3-4 writing samples (2-3 sentences each) representing different tones: Professional/Formal, Warm/Friendly, Bold/Confident, Casual/Conversational. The user selects their preferred tone. The selected tone replaces the current auto-detected `tone` field. |
| FR-105 | **Existing copy paste** | Should | An optional textarea where users can paste existing marketing copy, taglines, or About text. This content is passed verbatim to the generation phase as reference material the AI should incorporate or build upon. Maximum 2,000 characters. |
| FR-106 | **Enhanced page suggestions** | Must | The AI page suggestion endpoint receives the full user idea text (not just detected industry) and generates page titles with 1-sentence descriptions explaining what each page will contain. Users see both the title and description when selecting pages. |
| FR-107 | **Custom page addition** | Should | Users can add custom pages beyond the AI suggestions by typing a page title and a brief description of what should appear on that page. Maximum 3 custom pages. |

### FR-2xx: Multi-Step Content Pipeline

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-201 | **Research phase** | Must | After onboarding submission, the system performs a Research phase that: (a) analyzes the user's business idea, industry, audience, differentiators, and any reference URLs; (b) identifies industry-specific terminology, common page structures, and content patterns; (c) flags compliance considerations (HIPAA, ADA, legal disclaimers); (d) produces a structured research brief (JSON) stored in the database. The research brief is visible to the user as "What we learned about your business" with key findings displayed as bullet points. |
| FR-202 | **Plan phase** | Must | Using the research brief, the system generates a content plan that includes: (a) a site map with page purposes; (b) per-page content outline listing sections, estimated word counts, and key messages; (c) SEO keyword targets per page (2-3 primary keywords); (d) recommended CTAs per page tied to business goals; (e) tone/voice guidelines derived from user selection + industry norms. The plan is displayed to the user as "Your content plan" with a collapsible outline per page. Users can approve or request modifications before generation proceeds. |
| FR-203 | **Generate phase** | Must | Using the research brief and approved content plan, the system generates full-length content. Each page is generated in a separate AI call (not all pages in one call). Content depth targets: service descriptions 150-300 words, about page 300-500 words, team bios 100-150 words, testimonials 3-5 sentences with specific outcomes, FAQ answers 100-200 words each (5-10 Q&As), page intro text 50-100 words, contextual CTAs (not generic "Get started"). Total site content: 2,000-5,000+ words depending on page count. |
| FR-204 | **Phase visibility UI** | Must | All three phases (Research, Plan, Generate) are displayed to the user in a step-by-step progress view. Each phase shows: (a) a status indicator (pending, in progress, complete, failed); (b) estimated and elapsed time; (c) a summary of what the phase produced (expandable). The UI replaces the current single-spinner progress page. |
| FR-205 | **Model-agnostic AI provider** | Must | The AI provider and model are configurable via environment variables: `AI_PROVIDER` (values: `openai`, `anthropic`) and `AI_MODEL` (e.g., `gpt-4o`, `gpt-4o-mini`, `claude-sonnet-4-20250514`, `claude-haiku-4-20250414`). A provider abstraction layer exposes a common interface: `generateJSON(prompt, schema) → object` and `generateText(prompt) → string`. Switching providers requires only changing environment variables — no code changes. Each phase can optionally use a different model via `AI_MODEL_RESEARCH`, `AI_MODEL_PLAN`, `AI_MODEL_GENERATE` overrides. |
| FR-206 | **Per-phase model configuration** | Should | Allow different AI models per generation phase via environment variables (e.g., use a cheaper model for research, a stronger model for content generation). Defaults: Research = `AI_MODEL`, Plan = `AI_MODEL`, Generate = `AI_MODEL`. |
| FR-207 | **Structured output enforcement** | Must | All AI calls use structured output (JSON schema or function calling) to guarantee valid responses. The system validates AI output against TypeScript interfaces before proceeding. Invalid outputs trigger a retry (max 2 retries) with the validation error appended to the prompt. |
| FR-208 | **Research brief persistence** | Must | The research brief, content plan, and generation output are stored as separate versioned records in the database (not just the final blueprint). This enables: (a) re-running generation without re-running research; (b) comparing outputs across model changes; (c) audit trail for debugging content quality issues. |
| FR-209 | **Phase retry/re-run** | Should | Users can re-run any individual phase (Research, Plan, or Generate) without restarting the entire pipeline. Re-running Research invalidates the Plan and Generate outputs. Re-running Plan invalidates Generate output. Re-running Generate preserves Research and Plan. |

### FR-3xx: Content Review & Editing

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-301 | **Markdown preview page** | Must | After generation completes, users see a review page that renders the generated content as formatted markdown (not raw JSON). Each page is displayed as a collapsible section with: page title, meta description, section headings with component type labels (e.g., "[Hero Banner]", "[Text Block]", "[Card Grid]"), full content text (not truncated), and form field previews. The preview is read-only by default. |
| FR-302 | **Inline content editing** | Must | Users can click an "Edit" button on any section to switch it to an inline editor. The editor supports: plain text editing for all text fields (titles, descriptions, body content); adding/removing list items (services, team members, testimonials); modifying form field labels and types. Changes are saved to the blueprint in real time (auto-save with debounce). |
| FR-303 | **Per-section regeneration** | Must | Each section has a "Regenerate" button that re-runs AI generation for that specific section only, using the original research brief and content plan as context. The user can optionally provide guidance text (e.g., "Make this more formal" or "Focus on pediatric services"). The regenerated section replaces the current one in the preview. The previous version is preserved and accessible via an "Undo" action. |
| FR-304 | **Per-page regeneration** | Should | Users can regenerate an entire page while keeping other pages unchanged. The regeneration uses the same research brief and content plan, ensuring consistency with the rest of the site. |
| FR-305 | **Page add/remove** | Must | Users can add new pages (with a title and description prompt for AI generation) or remove existing pages from the review interface. Added pages are generated using the existing research brief and content plan. Maximum total pages: 15. |
| FR-306 | **Version comparison** | Should | Users can compare the current (edited) content with the original AI-generated version. Changes are highlighted in a diff view (additions in green, removals in red). |
| FR-307 | **Approve & provision** | Must | A prominent "Approve & Build Site" button triggers provisioning using the reviewed/edited blueprint. The button is disabled until the user has viewed all pages (scroll tracking or explicit page-by-page acknowledgment). |
| FR-308 | **Download options** | Should | Users can download: (a) the blueprint as a JSON file (existing feature, preserved); (b) all page content as markdown files in a ZIP archive; (c) the research brief and content plan as a PDF summary. |
| FR-309 | **Original version preservation** | Must | The original AI-generated blueprint is preserved as a separate record when the user makes edits. The provisioned site uses the edited version. Both versions are accessible from the dashboard. |

### FR-4xx: Provisioning UX

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-401 | **Step-level progress** | Must | The provisioning progress UI displays each of the 11 provisioning steps with individual status indicators: completed (with elapsed time), in progress (with spinner), pending, or failed (with error summary). The step names are user-friendly (e.g., "Setting up your database" not "create-database"). Progress updates are delivered via the existing polling mechanism (`/api/provision/status`) with a new `currentStep` field. |
| FR-402 | **Per-site database users** | Must | Each provisioned Drupal site receives its own MariaDB user with a randomly generated 32-character password. The provisioning step executes: `CREATE USER 'site_{siteId}'@'%' IDENTIFIED BY '{password}'; GRANT ALL PRIVILEGES ON site_{siteId}.* TO 'site_{siteId}'@'%';`. The generated `settings.php` uses the site-specific credentials. This applies to ALL environments including local dev. The shared `root` user is no longer used in generated site configurations. |
| FR-403 | **Provisioning step timing** | Should | Each provisioning step records its start time, end time, and duration. These timings are included in the status API response and displayed in the progress UI (e.g., "Installing Drupal CMS... 42s"). Aggregate timing data is logged for performance monitoring. |
| FR-404 | **Provisioning failure detail** | Must | When a provisioning step fails, the status API returns the failed step name, a user-friendly error message, and an internal error detail (for debugging). The progress UI shows which step failed and offers a "Retry" button that re-runs provisioning from the failed step (not from the beginning). |

### FR-5xx: Quality Assurance

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-501 | **Synthetic test case suite** | Must | A suite of 10-15 synthetic business scenarios (as defined in section 8 of the content-generation-expectations doc) is maintained as structured JSON/YAML files. Each test case includes: persona name, business type, idea input, industry, expected pages, content quality expectations, and evaluation criteria. The test cases cover: healthcare, legal, restaurant, SaaS, wellness, real estate, food service, mental health, nonprofit, and event planning industries. |
| FR-502 | **Manual test scripts** | Must | For each synthetic test case, a step-by-step manual test script documents: (a) exact onboarding inputs (name, idea, audience, follow-up answers); (b) expected research brief outputs; (c) expected content plan structure; (d) content quality checkpoints (word count per page, industry terminology presence, CTA relevance); (e) pass/fail criteria. Scripts are maintained as markdown files in `project-management/test-cases/`. |
| FR-503 | **Automated Playwright tests** | Must | Playwright tests automate the full onboarding-to-review flow for at least 5 of the synthetic test cases. Tests verify: (a) onboarding wizard completes without errors; (b) all three generation phases complete; (c) review page renders with content; (d) total word count meets minimum threshold (2,000 words); (e) each page has at least 200 words; (f) industry-specific keywords appear in generated content; (g) no placeholder/lorem ipsum text detected. Tests run in CI with a 10-minute timeout per test case. |
| FR-504 | **Content evaluation rubric** | Must | A scoring rubric evaluates generated content across 8 dimensions: content relevance (0-5), content depth (0-5), industry accuracy (0-5), page structure (0-5), SEO quality (0-5), tone consistency (0-5), CTA relevance (0-5), component selection (0-5). Total score out of 40. Pass threshold: 28/40 (70%). The rubric is codified as a JSON schema with automated checks where possible (word count, keyword presence, uniqueness) and manual evaluation guidelines for subjective criteria. |
| FR-505 | **Before/after comparison artifacts** | Should | For each synthetic test case, generate and store: (a) current pipeline output (baseline); (b) v2 pipeline output (after implementation); (c) a structured comparison showing improvements per evaluation criterion. These artifacts are generated as part of the CI pipeline and stored as sprint output documentation. |
| FR-506 | **Content uniqueness validation** | Should | An automated check verifies that generated content across different test cases is sufficiently unique. No two sites should share more than 20% of their body content verbatim (excluding common industry terminology). Measured via Jaccard similarity on sentence-level n-grams. |

### FR-6xx: Vision & Communication

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-601 | **Vision deck** | Should | A 5-10 slide presentation deck covering: (a) problem statement (current shallow content); (b) solution overview (Research → Plan → Generate → Review); (c) before/after demo with 2-3 test cases; (d) architecture diagram; (e) phased roadmap. Format: markdown-based slides (e.g., Marp or reveal.js) or PDF. |
| FR-602 | **Before/after content comparisons** | Should | For 3 representative test cases (healthcare, legal, restaurant), produce side-by-side comparisons showing current output vs. expected v2 output. Include: word count delta, new content sections, improved specificity examples, and SEO improvements. |
| FR-603 | **Content quality dashboard** | Could | A simple dashboard page (accessible to admins) showing aggregate content quality metrics across all generated sites: average word count, average evaluation score, generation time, model usage breakdown, and failure rates. |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Priority | Target |
|----|-------------|----------|--------|
| NFR-01 | Research phase completes within target time | Must | < 15 seconds |
| NFR-02 | Plan phase completes within target time | Must | < 15 seconds |
| NFR-03 | Generate phase completes within target time (per page) | Must | < 20 seconds per page, < 120 seconds total for a 6-page site |
| NFR-04 | Total end-to-end generation time (Research + Plan + Generate) | Must | < 3 minutes for a 6-page site |
| NFR-05 | Review page loads within target time | Must | < 2 seconds for rendering the full markdown preview |
| NFR-06 | Per-section regeneration completes within target time | Must | < 15 seconds |
| NFR-07 | Provisioning total time does not regress | Must | < 5 minutes (current ~2.5 minutes + database user creation overhead) |
| NFR-08 | AI provider switch requires zero downtime | Must | Changing `AI_PROVIDER` and `AI_MODEL` environment variables and restarting the container is the only required action |

### 5.2 Security

| ID | Requirement | Priority | Target |
|----|-------------|----------|--------|
| NFR-09 | Per-site database isolation | Must | Each site has a unique database user with access only to its own database. No shared credentials beyond the provisioning admin account. |
| NFR-10 | Database credentials are never exposed to the client | Must | Site-specific database credentials exist only in the generated `settings.php` file and the provisioning engine's memory during execution. They are not stored in PostgreSQL or returned by any API. |
| NFR-11 | AI prompts contain no cross-tenant data | Must | Each generation request includes only the requesting user's onboarding data. No data from other users or sites is included in prompts. |
| NFR-12 | Reference URLs are not scraped without consent | Must | User-provided reference URLs are passed to the AI as context strings. No automated web scraping or crawling of reference URLs occurs in v2. |
| NFR-13 | API key isolation | Must | AI provider API keys are stored as environment variables, never in source code or database. Different environments (dev, staging, prod) use separate API keys. |

### 5.3 Scalability

| ID | Requirement | Priority | Target |
|----|-------------|----------|--------|
| NFR-14 | Concurrent generation support | Should | The system supports at least 10 concurrent generation pipelines without degradation (bounded by AI provider rate limits). |
| NFR-15 | AI provider rate limit handling | Must | The provider abstraction layer implements exponential backoff with jitter for rate limit responses (HTTP 429). Maximum 3 retries before failing the phase. |
| NFR-16 | Generation queue | Could | If concurrent generation demand exceeds capacity, requests are queued with estimated wait times communicated to the user. |

### 5.4 Accessibility

| ID | Requirement | Priority | Target |
|----|-------------|----------|--------|
| NFR-17 | Review page meets WCAG 2.1 AA | Must | All review/editing UI elements are keyboard-navigable, screen-reader compatible, and have sufficient color contrast. |
| NFR-18 | Progress indicators are accessible | Must | Step-level progress uses ARIA live regions for screen reader announcements. Status changes are communicated via both visual and text indicators. |
| NFR-19 | Inline editor is accessible | Should | The markdown/text editor supports keyboard shortcuts for common actions (save, undo, navigate between sections). |

---

## 6. User Journeys

### Journey A: First-Time User Creating a Dental Clinic Website

**Actor:** Dr. Sarah Chen, family dentist in Portland, OR
**Goal:** Launch a professional dental practice website with accurate service descriptions and patient-facing content

1. Sarah visits `http://localhost:3000` and registers with her email.
2. She begins the onboarding wizard.
3. **Step 1 — Name:** Enters "Sunrise Family Dental".
4. **Step 2 — Idea:** Types "Family dental practice in Portland, OR specializing in cosmetic dentistry, dental implants, and pediatric dental care. We've been serving the community for 15 years."
5. **Step 3 — Audience:** Types "Families with children, adults seeking cosmetic procedures, seniors needing implants".
6. **Step 4 — Pages:** AI suggests pages with descriptions: "Home — Welcome page with practice overview", "Services — Detailed descriptions of dental procedures", "Our Team — Dentist and hygienist profiles", "Patient Resources — Insurance info, forms, FAQs", "Contact — Location, hours, appointment request". Sarah accepts all and adds a custom page: "Smile Gallery — Before/after photos of cosmetic work".
7. **Step 5 — Design:** Selects "Let AI choose" (default).
8. **Step 6 — Brand:** Uploads her logo, picks a calming blue/green color palette.
9. **Step 7 — Fonts:** Selects "Lato" for headings, "Open Sans" for body.
10. **Step 8 — Follow-up questions** (new, industry-specific):
    - "What are your top 3 specialties?" → "Cosmetic dentistry, dental implants, pediatric care"
    - "Do you accept dental insurance?" → "Yes, most major plans"
    - "What makes your practice unique?" → "We've been family-owned for 15 years and offer sedation dentistry for anxious patients"
11. **Step 9 — Tone selection** (new): Sarah picks "Warm/Friendly" from four sample paragraphs.
12. Sarah clicks "Generate My Website".
13. **Research phase** (visible): The UI shows "Researching your industry..." then displays key findings: "Dental practice websites typically include: procedure descriptions with patient benefits, provider credentials (DDS, DMD), insurance/payment information, patient testimonial sections, HIPAA-compliant contact forms. Your key differentiators: 15-year track record, sedation dentistry, pediatric specialization."
14. **Plan phase** (visible): The UI shows "Planning your content..." then displays an outline: "Home — 4 sections, ~400 words: hero with tagline, services overview, testimonial highlight, appointment CTA. Services — 6 sections, ~800 words: one section per specialty with procedure details, benefits, and expected outcomes..."
15. Sarah reviews the plan, notices "Patient Resources" doesn't mention sedation dentistry info, and clicks "Edit plan" to add a note: "Include a section about sedation options for anxious patients."
16. **Generate phase** (visible): The UI shows per-page progress: "Generating Home page... Generating Services page..." Each page completes in 10-20 seconds. Total generation: ~90 seconds for 6 pages.
17. Sarah arrives at the **Review page**. She sees all 6 pages rendered as formatted content. The Services page has 150-250 words per service, mentions specific procedures (veneers, crowns, root canals), and uses warm, patient-friendly language.
18. She clicks "Edit" on the team section and changes Dr. Morgan's bio to reflect her actual credentials and personality.
19. She clicks "Regenerate" on one testimonial and adds guidance: "Make this about a parent bringing their anxious child." The AI generates a new testimonial about a positive pediatric experience.
20. Satisfied, she clicks "Approve & Build Site".
21. The **provisioning progress** shows each of 11 steps with live status updates: "Creating your database... Installing Drupal CMS (42s)... Importing your content... Applying your brand..."
22. After ~2.5 minutes, Sarah sees her site card on the dashboard. She clicks "Edit Site" and is auto-logged into Drupal Canvas, where her full content is rendered with Space DS components.

### Journey B: User Reviewing and Editing Generated Content Before Provisioning

**Actor:** Marcus Johnson, marketing manager at a real estate firm
**Goal:** Review AI-generated content for brand voice compliance, edit specific sections, then provision

1. Marcus has completed onboarding for "Coastal Luxury Realty — Waterfront properties in the Florida Keys." Generation is complete.
2. He arrives at the Review page, which shows 7 pages in a collapsible navigation sidebar: Home, Listings, Agents, Neighborhoods, Buyer's Guide, Seller's Guide, Contact.
3. He expands the **Home page** preview. The hero banner reads "Your Gateway to Florida Keys Waterfront Living." The services section lists "Buyer Representation, Seller Services, Property Management, Vacation Rentals." Each has a 200-word description. He finds the tone appropriately professional.
4. He expands the **Agents page**. Three agent profiles are generated with 120-word bios. He clicks "Edit" on Agent #1 and replaces the generated bio with his own written copy (150 words). The change auto-saves.
5. He notices the **Buyer's Guide** page has a section about "Understanding Market Trends" that contains generic advice. He clicks "Regenerate" on that section and types guidance: "Focus specifically on Florida Keys waterfront market — mention hurricane insurance, seawall inspections, and flood zone considerations." The AI regenerates the section with Keys-specific content in ~10 seconds.
6. He clicks "Add Page" and creates "Luxury Rentals — Showcase our premium vacation rental management program." The AI generates a full page with 4 sections in ~15 seconds, consistent in tone with the rest of the site.
7. He opens the **Version Comparison** view for the Buyer's Guide page. He sees his original AI-generated text alongside the regenerated version, with changes highlighted.
8. After reviewing all 8 pages (7 original + 1 added), the "Approve & Build Site" button activates. He clicks it.
9. Provisioning begins with step-level progress. Marcus sees that "Installing Drupal CMS" is the longest step (~50s) while database creation takes only 2 seconds.

### Journey C: User Retrying/Regenerating Specific Sections After Review

**Actor:** Maria Santos, restaurant owner
**Goal:** Fix AI-generated menu descriptions that don't match her cuisine style, regenerate specific sections

1. Maria's site for "Bella Terra — Farm-to-table Italian restaurant in Austin" has been generated.
2. On the Review page, she opens the **Menu page**. The AI generated 8 menu items with descriptions. However, the descriptions are generic ("A delicious pasta dish served with fresh ingredients") and don't reflect her farm-to-table philosophy.
3. She clicks "Regenerate" on the menu section and adds guidance: "We source all produce from local Texas farms. Emphasize seasonal ingredients, farm partnerships, and traditional Italian techniques. Mention specific ingredients like Hill Country tomatoes, Fredericksburg peaches, and Gulf Coast seafood."
4. The AI regenerates the menu section in ~12 seconds. The new descriptions mention "hand-made pappardelle with slow-braised Hill Country beef ragu" and "wood-fired Gulf red snapper with Fredericksburg peach mostarda." Maria is satisfied with the improvement.
5. She moves to the **About page**. The generated story is adequate but missing her personal journey. She clicks "Edit" and adds a paragraph about her grandmother's recipes and her culinary training in Bologna. She keeps the rest of the AI-generated content.
6. She decides the **Events page** doesn't match what she offers. She clicks "Remove Page" — the page is removed from the blueprint. She confirms the deletion.
7. She re-opens the **Research brief** (visible from the generation phase) and notices the AI correctly identified "farm-to-table, seasonal menu, private dining" as key themes. She realizes the original menu generation didn't leverage these findings well — a quality signal for future improvement.
8. She clicks "Approve & Build Site" and watches provisioning complete with step-level progress.

---

## 7. Success Metrics

| Metric | Current Baseline | Target | Measurement Method |
|--------|-----------------|--------|--------------------|
| **Total content word count per site** | 200-400 words | 2,000-5,000+ words | Automated count from blueprint JSON |
| **Words per page (average)** | 30-60 words | 300-600 words | Automated count from blueprint JSON |
| **Service description length** | 2-3 sentences (~30 words) | 150-300 words | Automated count per content item |
| **Content quality score** | Not measured | 28/40 (70%) on evaluation rubric | Rubric scoring (automated + manual) |
| **Content uniqueness across sites** | Not measured | < 20% shared content between any two sites | Jaccard similarity analysis |
| **User edit rate** | Not measured | < 40% of sections require manual edits | Edit tracking (sections edited / total sections) |
| **Section regeneration rate** | Not applicable | < 2 regenerations per page on average | Platform analytics |
| **Review-to-provision conversion** | Not applicable (no review step) | > 80% of users who reach review proceed to provision | Funnel analytics |
| **Total generation time (6 pages)** | 30-45 seconds | < 3 minutes | Platform timing logs |
| **Provisioning step visibility** | 1 aggregate status | 11 individual step statuses | API response field count |
| **Industry keyword presence** | Not measured | 90%+ of sites contain 5+ industry-specific terms | Automated keyword matching against industry lexicons |
| **Synthetic test case pass rate** | Not measured | 80%+ of test cases score >= 28/40 | Evaluation rubric applied to test suite output |

---

## 8. Assumptions & Constraints

### Assumptions

1. **Space DS components** provide sufficient layout primitives (hero, text block, card grid, CTA, form, team grid, testimonial, FAQ accordion) to render the deeper content without requiring new components.
2. **OpenAI and Anthropic APIs** remain available with current pricing and rate limits through the implementation period. Estimated cost increase: 5-10x per site due to more capable models and more API calls (from 3 calls to 8-15 calls per site).
3. **Users will engage with the review step.** The additional friction of review/edit before provisioning is acceptable because the content quality improvement justifies the time investment (estimated: 5-15 minutes for review).
4. **Drupal Canvas** can render the richer content without performance degradation. Longer text blocks, more sections per page, and more pages per site should not break Canvas's component tree rendering.
5. **The 7-step wizard can be extended** to 9-10 steps (adding follow-up questions, tone selection) without significantly impacting onboarding completion rates. Estimated additional time: 2-3 minutes.
6. **Per-site database users** are supported by MariaDB without hitting connection limits in local dev (estimated: up to 50 concurrent sites in dev, up to 1,000 in production with connection pooling).

### Constraints

1. **Component-only architecture:** All generated content must be renderable using existing Space DS SDC components. The AI cannot invent new components or generate raw HTML.
2. **No web scraping in v2:** Reference URLs provided by users are passed to the AI as text context only. Automated crawling/scraping is out of scope for this version.
3. **AI cost budget:** Per-site generation cost must stay under $0.50 (at current OpenAI/Anthropic pricing). This constrains model selection and number of API calls. Monitor actual costs and adjust model tiers if needed.
4. **PostgreSQL schema changes** are required (new tables for research briefs, content plans, content versions). These must be implemented via Prisma migrations with zero-downtime compatibility.
5. **Backward compatibility:** Existing sites generated with v1 must continue to function. The v1 blueprint format must remain importable by the provisioning engine.
6. **Local dev parity:** Per-site database users must work in DDEV local dev environments, not just production. The provisioning engine must handle both contexts.

---

## 9. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **AI generation cost exceeds budget** — more calls with stronger models could cost $1-5/site | Medium | High | Implement cost tracking per generation. Use cheaper models (gpt-4o-mini, claude-haiku) for Research/Plan phases, reserve stronger models for Generate phase. Set a hard cost cap per generation with graceful degradation. |
| R2 | **Generation time too long** — 3-minute generation feels slow to users | Medium | Medium | Show meaningful progress at each phase (not just a spinner). Allow users to navigate away and return (generation continues in background). Send email notification when generation completes. |
| R3 | **AI produces inconsistent content** — different sections written by different AI calls may have conflicting tone or information | Medium | Medium | Pass the research brief and content plan as context to every Generate call. Include a "site voice" summary in every prompt. Post-generation consistency check (automated keyword/tone analysis). |
| R4 | **Review step causes user drop-off** — users may abandon when asked to review/edit before provisioning | Low | High | Make review step skippable (with "I'll review later in Drupal" option). Pre-approve by default — the review page shows content but doesn't block provisioning. Track skip-vs-review rates. |
| R5 | **Provider API outages** — single provider failure blocks generation | Low | High | Model-agnostic layer enables failover. If primary provider fails after 2 retries, automatically fall back to the other provider. Log failover events for monitoring. |
| R6 | **Per-site DB users cause connection pool exhaustion** — MariaDB has a max_connections limit | Low | High | Set `max_connections` appropriately (default 151, increase to 500+ for production). Each Drupal site uses 1-3 connections per request. Implement connection pooling if needed. Monitor active connections. |
| R7 | **Content quality varies wildly by industry** — AI may be strong on healthcare/legal but weak on niche industries | Medium | Medium | Synthetic test suite covers 10+ industries. Track evaluation scores per industry. Create industry-specific prompt templates for underperforming industries. Accept that "Other" category may produce lower-quality content. |
| R8 | **Structured output parsing failures** — AI returns invalid JSON despite schema constraints | Low | Medium | Implement retry with validation error feedback (max 2 retries). Fallback to current v1 generation if all retries fail. Log parsing failures for prompt improvement. |
| R9 | **Inline editor complexity** — building a rich inline editor for markdown content is engineering-heavy | Medium | Medium | Phase the editor: v2.0 uses plain textarea editing (not WYSIWYG). v2.1 adds rich markdown editing. v2.2 adds component-level drag/drop in the review page. |
| R10 | **Blueprint schema bloat** — richer content significantly increases blueprint JSON size | Low | Low | Current blueprints are ~5-15KB. Expected v2 blueprints: 50-100KB. PostgreSQL JSONB handles this easily. Add compression if blueprints exceed 500KB. |

---

## 10. Out of Scope

The following are explicitly **not included** in this initiative:

1. **Web scraping of reference URLs** — User-provided URLs are passed as text context to the AI, not crawled or scraped.
2. **Image generation or sourcing** — Content generation produces text only. Stock image sourcing (Unsplash, AI-generated) is a separate initiative.
3. **Real-time collaborative editing** — Only one user edits a blueprint at a time. Multi-user collaboration is not supported.
4. **AI-driven A/B testing** — No automated content variant testing or conversion optimization.
5. **Multi-language content generation** — English only. Internationalization is a separate initiative.
6. **Custom component creation** — The AI selects from existing Space DS components only. It cannot create new component types.
7. **CRM or email marketing integration** — Form submissions stay in Drupal. No Mailchimp, HubSpot, or Salesforce integration.
8. **Content refresh/regeneration for live sites** — Once provisioned, content is managed in Drupal. No "re-generate" for already-live sites.
9. **Blog post series generation** — The system generates individual pages, not ongoing content calendars or blog series.
10. **Voice/video content** — Text and structured data only. No podcast scripts, video scripts, or multimedia generation.
11. **WYSIWYG markdown editor** — v2 uses plain text editing. Rich markdown editing (bold, italic, headings via toolbar) is deferred to a future version.

---

## 11. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| OQ-1 | Should the Plan phase require explicit user approval before proceeding to Generate, or should it auto-proceed with the plan visible for optional editing? | Affects user flow complexity and generation time. Auto-proceed is faster but reduces user control. | Product | Open |
| OQ-2 | What is the acceptable AI cost per site generation? Current: ~$0.01/site (gpt-4o-mini). Expected v2: $0.10-$0.50/site. Is there a hard cap? | Directly constrains model selection and number of API calls per phase. | Product/Business | Open |
| OQ-3 | Should the review page support mobile editing, or is it desktop-only for v2? | Affects UI/UX scope and engineering effort for inline editing. | Product/Design | Open |
| OQ-4 | How should we handle the "skip review" flow? Options: (a) skip entirely and provision immediately (v1 behavior); (b) provision but mark content as "unreviewed" in Drupal; (c) no skip — review is mandatory. | Affects conversion funnel and content quality assurance. | Product | Open |
| OQ-5 | Should research briefs include competitive analysis from reference URLs, or is that deferred to a future version with web scraping? | Affects the depth of the Research phase and whether reference URLs provide value beyond tone matching. | Product/Engineering | Open |
| OQ-6 | What is the maximum number of concurrent site generations the system should support in production? | Affects AI provider rate limit planning, queue implementation priority, and infrastructure sizing. | Engineering/DevOps | Open |
| OQ-7 | Should the evaluation rubric scoring be partially automated (via a separate AI call that grades the output) or entirely manual? | Automated scoring adds cost but enables CI-level quality gates. Manual scoring is cheaper but doesn't scale. | Engineering/QA | Open |
| OQ-8 | How should we version content plans and research briefs when a user re-runs a phase? Keep all versions or only the latest + original? | Affects database storage requirements and version comparison UX complexity. | Engineering | Open |
| OQ-9 | Should per-site database user credentials be rotatable post-provisioning? | Affects security posture and operational complexity. Rotation is a best practice but adds engineering effort. | Engineering/Security | Open |
| OQ-10 | What is the fallback behavior if both AI providers are unavailable? Queue and wait, or fall back to v1 template-based generation? | Affects reliability guarantees and user experience during outages. | Product/Engineering | Open |

---

## Appendix A: Current vs. Target Content Depth

| Content Type | Current Output | Target Output | Delta |
|--------------|---------------|---------------|-------|
| Service description | 2-3 sentences (~30 words) | 150-300 words with value props, process, outcomes | +120-270 words |
| About page body | Title + 1 sentence (~15 words) | 300-500 words covering mission, history, differentiators | +285-485 words |
| Team member bio | 1-2 sentences (~20 words) | 100-150 words with expertise, credentials, personality | +80-130 words |
| Testimonial | 1-2 sentences (~20 words) | 3-5 sentences with specific outcomes/metrics (~60-100 words) | +40-80 words |
| Blog post | Not generated | 500-800 words, topically relevant to industry | +500-800 words (new) |
| FAQ answers | Not generated | 100-200 words per answer, 5-10 Q&As | +500-2000 words (new) |
| Page intro text | Not generated | 50-100 words per page establishing context | +250-600 words (new) |
| CTA copy | Generic "Get started" | Contextual CTAs tied to page purpose (~20-40 words) | +15-35 words |
| **Total per site** | **~200-400 words** | **~2,000-5,000+ words** | **~10x increase** |

## Appendix B: AI Provider Abstraction Interface

```typescript
interface AIProvider {
  name: 'openai' | 'anthropic';

  generateJSON<T>(
    prompt: string,
    schema: JSONSchema,
    options?: GenerateOptions
  ): Promise<T>;

  generateText(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string>;
}

interface GenerateOptions {
  model?: string;          // Override default model
  temperature?: number;    // 0.0-1.0, default 0.3
  maxTokens?: number;      // Max output tokens
  retries?: number;        // Max retries on failure, default 2
}

// Environment variable configuration:
// AI_PROVIDER=openai|anthropic
// AI_MODEL=gpt-4o|gpt-4o-mini|claude-sonnet-4-20250514|claude-haiku-4-20250414
// AI_MODEL_RESEARCH=<optional override for research phase>
// AI_MODEL_PLAN=<optional override for plan phase>
// AI_MODEL_GENERATE=<optional override for generate phase>
```

## Appendix C: Generation Pipeline Data Flow

```
┌──────────────┐
│  Onboarding  │  name, idea, audience, industry, pages, brand,
│  Wizard Data │  follow-ups, tone, differentiators, reference URLs
└──────┬───────┘
       │
       ▼
┌──────────────┐    Output: ResearchBrief
│  1. RESEARCH │    • Industry analysis (terminology, patterns, compliance)
│              │    • Business positioning (differentiators, audience segments)
│  1 AI call   │    • Content themes (key topics per page)
│  ~10-15s     │    • SEO opportunity areas
│              │    Stored: research_briefs table
└──────┬───────┘    Shown to user: "What we learned" summary
       │
       ▼
┌──────────────┐    Output: ContentPlan
│  2. PLAN     │    • Site map with page purposes
│              │    • Per-page content outline (sections, word targets)
│  1 AI call   │    • SEO keywords per page
│  ~10-15s     │    • CTA strategy per page
│              │    • Tone/voice guidelines
│              │    Stored: content_plans table
└──────┬───────┘    Shown to user: collapsible outline per page
       │
       ▼
┌──────────────┐    Output: BlueprintBundle (enhanced)
│  3. GENERATE │    • Full-length page content (300-600 words/page)
│              │    • Component trees with rich props
│  N AI calls  │    • Form definitions
│  (1 per page)│    • SEO metadata
│  ~60-120s    │    Stored: blueprints table (+ original version)
└──────┬───────┘    Shown to user: full markdown preview
       │
       ▼
┌──────────────┐
│  4. REVIEW   │    User reviews, edits, regenerates sections
│  (User-      │    Edited blueprint saved as new version
│   driven)    │    Original preserved for comparison
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  5. PROVISION│    11-step pipeline with per-step progress
│              │    Per-site database user creation
│  ~2.5 min    │    Step-level status polling
└──────────────┘
```

---

*Next step: Invoke `/tpm` to break this PRD into user stories and plan sprints.*
