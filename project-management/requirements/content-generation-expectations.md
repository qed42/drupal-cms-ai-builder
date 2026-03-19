# Content Generation Expectations

**Author:** Product Owner
**Date:** 2026-03-19
**Status:** Draft — Requires sprint planning

## Problem Statement

The current AI content generation produces **shallow, placeholder-quality content** that does not qualify as production-ready web pages. A typical generated "Services" page contains 2-3 sentences per service item and reuses the same content across component props. The output resembles a wireframe with lorem ipsum — not a real website.

This document captures the gaps, expectations, and proposed improvements across the content pipeline, onboarding inputs, review workflow, provisioning UX, and testing strategy.

---

## 1. Content Depth & Quality

### Current State

The blueprint generator makes 3 sequential OpenAI calls (all `gpt-4o-mini`, temp 0.3, max 4000 tokens):

| Call | Output | Depth |
|------|--------|-------|
| Content items | 3-6 services (2-3 sentences each), 3-4 team bios (1-2 sentences), 3 testimonials (1-2 sentences) | ~200 words total |
| Page layouts | Component trees with titles + short descriptions reused from content items | Props only — no long-form content |
| Form fields | 4-8 form fields with labels | Structural only |

**Problems:**
- Total generated content per site is ~200-400 words — a real website needs 2000-5000+ words
- Service descriptions are generic ("Professional services tailored to your audience")
- No paragraph-level content for text blocks, about pages, or blog posts
- No differentiation between industries beyond component selection
- All pages follow the same hero → content → CTA template
- Team members, testimonials, and services are fabricated with no user input

### Expected Outcome

Each page should contain **full-length, contextual content**:

| Content Type | Current | Expected |
|--------------|---------|----------|
| Service description | 2-3 sentences | 150-300 words with value props, process, outcomes |
| About page body | Title + 1 sentence | 300-500 words covering mission, history, differentiators |
| Team member bio | 1-2 sentences | 100-150 words with expertise, credentials, personality |
| Testimonial | 1-2 sentences | 3-5 sentences with specific outcomes/metrics |
| Blog post | Not generated | 500-800 words, topically relevant to industry |
| FAQ answers | Not generated | 100-200 words per answer, 5-10 Q&As |
| Page intro text | Not generated | 50-100 words per page establishing context |
| CTA copy | Generic "Get started" | Contextual CTAs tied to page purpose |

---

## 2. Onboarding Input Gaps

### Current State

The 7-step wizard captures:

| Step | Data | Typical Input Length |
|------|------|---------------------|
| Name | Site/business name | 2-50 chars |
| Idea | Business description | 10-200 chars (free textarea, no guidance) |
| Audience | Target market | 0-100 chars (optional) |
| Pages | Selected page titles | 3-12 page names |
| Design | "Let AI choose" | Single radio button |
| Brand | Logo + colors | Files + hex codes |
| Fonts | Heading + body fonts | 2 dropdown selections |

**Problems:**
- The "Idea" field is the only substantive input — users typically write 1-2 sentences
- No capture of: unique selling propositions, key services/products, geographic focus, competitive positioning, existing content/copy, calls to action preferences
- No mechanism for users to provide reference websites, existing marketing materials, or brand voice examples
- The audience field is optional and unstructured
- No follow-up questions based on industry (e.g., healthcare → specialties, legal → practice areas, restaurant → cuisine type)

### Recommendations

Consider adding:
- **Guided prompts per industry** — after industry detection, ask 2-3 targeted questions (e.g., "What are your top 3 services?", "What geographic area do you serve?")
- **Content tone examples** — show 2-3 writing samples and let the user pick their preferred voice
- **Competitor/reference URLs** — optional field for sites they admire (for style, not copying)
- **Key differentiators prompt** — "What makes you different from competitors?" (1-2 sentences)
- **Existing copy paste** — allow users to paste existing About text, service descriptions, or taglines that the AI should incorporate

---

## 3. Multi-Step Content Generation Workflow

### Current State

Content generation is a single-pass pipeline:
```
User submits wizard → 3 sequential AI calls → Blueprint JSON → Provision immediately
```

No opportunity for review, iteration, or quality gates between generation and provisioning.

### Proposed Architecture: Research → Plan → Generate

Split the monolithic generation into distinct, reviewable phases:

```
┌─────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  1. RESEARCH │───▶│  2. PLAN     │───▶│  3. GENERATE  │───▶│ 4. REVIEW   │
│              │    │              │    │               │    │             │
│ • Analyze    │    │ • Site map   │    │ • Full-length │    │ • Markdown  │
│   industry   │    │ • Content    │    │   page content│    │   preview   │
│ • Identify   │    │   outline    │    │ • Component   │    │ • Edit/     │
│   competitors│    │ • SEO        │    │   trees       │    │   approve   │
│ • Extract    │    │   strategy   │    │ • Forms       │    │ • Re-gen    │
│   key themes │    │ • Tone/voice │    │ • Brand CSS   │    │   sections  │
│ • Compliance │    │   guide      │    │               │    │             │
│   flags      │    │              │    │               │    │             │
└─────────────┘    └─────────────┘    └──────────────┘    └─────────────┘
```

**Phase 1 — Research** (new):
- Deep analysis of the user's idea, industry, and audience
- Web research for industry-specific terminology, common page structures, competitor patterns
- Output: structured research brief (stored, not shown to user)

**Phase 2 — Plan** (new):
- Site map with page purposes and content outlines
- Per-page content strategy: what to cover, key messages, CTAs
- SEO keyword targets per page
- Output: content plan (optionally reviewable)

**Phase 3 — Generate** (enhanced):
- Full-length content per page using the research + plan as context
- Multiple AI calls per page (not one call for all pages)
- Industry-specific content patterns
- Output: complete blueprint with rich content

**Phase 4 — Review** (new):
- See section 4 below

### Model Considerations

| Phase | Model | Reasoning |
|-------|-------|-----------|
| Research | `gpt-4o` or `claude-sonnet` | Needs strong analytical capability |
| Plan | `gpt-4o` or `claude-sonnet` | Structural reasoning, SEO knowledge |
| Generate | `gpt-4o` or `claude-sonnet` | Long-form writing quality matters here |
| Current | `gpt-4o-mini` | Fast/cheap but produces shallow content |

The current use of `gpt-4o-mini` for all generation is a significant contributor to content quality issues. Consider upgrading to a more capable model at least for the generation phase, even if it increases latency and cost.

---

## 4. Content Review Step (Markdown Preview)

### Requirement

Before provisioning, users should be able to review and edit the generated content. The review interface should present the blueprint as readable markdown — not raw JSON.

### Proposed Flow

```
Onboarding Complete → Generation → Review Page → Approve/Edit → Provision
                                       ↑
                                       │
                                  Edit individual
                                  sections or
                                  regenerate pages
```

### Review Page Features

1. **Markdown rendering** — each page shown as a formatted document with:
   - Page title + meta description
   - Section headings with component type labels
   - Full content text (not truncated)
   - Form field previews

2. **Per-section actions:**
   - "Regenerate this section" — re-run AI for one section with same/modified context
   - "Edit content" — inline markdown editor for text tweaks
   - "Remove section" — delete a component from the page

3. **Per-page actions:**
   - "Regenerate entire page" — re-run generation for one page
   - "Add page" / "Remove page" — modify site structure

4. **Global actions:**
   - "Approve & Provision" — proceeds to Drupal provisioning
   - "Download as Markdown" — export all pages as `.md` files in a zip
   - "Download Blueprint JSON" — existing feature

### Storage

The reviewed/edited content replaces the blueprint in the database. The original AI output should be preserved as a separate version for comparison.

---

## 5. Provisioning Progress — Step-Level Updates

### Current State

The provisioning phase shows a single "70%" progress for the entire ~165-second Drupal installation. The status API reports only high-level states: `provisioning` → `live`.

### Expected Behavior

The progress UI should show which provisioning step is currently executing:

```
Setting up your site...

✅ Creating database              (2s)
✅ Configuring site settings       (1s)
✅ Registering domain             (1s)
🔄 Installing Drupal CMS          (45s)  ← Currently running
⬜ Installing design theme
⬜ Enabling modules
⬜ Importing content
⬜ Applying brand styling
⬜ Finalizing configuration
⬜ Going live
```

### Implementation Approach

The provisioning engine already logs step progress. Options:

**Option A — Database polling:** Each provisioning step updates a `provisioning_step` column on the `sites` table. The status API reads it. Simple but requires DB access from the provisioning process.

**Option B — File-based:** Provisioning writes step status to a shared JSON file in the blueprint directory. The status API reads it. No DB dependency from provisioning.

**Option C — Callback per step:** Provisioning sends a lightweight callback after each step completes. Most accurate but chattier.

---

## 6. Per-Site Database Users

### Current State

All provisioned Drupal sites use the **same database credentials** (default: `root/root` in dev, `db/db` in config). The provisioning step creates a new database per site but grants access to the shared user:

```sql
CREATE DATABASE site_{siteId};
GRANT ALL PRIVILEGES ON site_{siteId}.* TO 'root'@'%';
```

### Security Risk

If any single site is compromised (SQL injection, leaked credentials), the attacker has access to **every other site's database** on the same host.

### Expected Behavior

Each provisioned site should have its own database user:

```sql
CREATE DATABASE site_{siteId};
CREATE USER 'site_{siteId}'@'%' IDENTIFIED BY '{random_password}';
GRANT ALL PRIVILEGES ON site_{siteId}.* TO 'site_{siteId}'@'%';
```

The generated `settings.php` should use the site-specific credentials, not the shared root user.

---

## 7. AI Page Suggestion Contextuality

### Current State

Page suggestions come from two sources:

1. **AI suggestion** (`/api/ai/suggest-pages`): Sends industry + idea + audience to OpenAI asking for 5-8 relevant pages. Always includes Home + Contact.

2. **Fallback defaults** (if AI fails): Hardcoded per-industry page lists.

### Assessment

The AI suggestions are **moderately contextual**:
- Industry detection works well for clear inputs ("dental clinic" → healthcare)
- Page names are appropriate per industry (healthcare → "Providers", "Patient Portal")
- However, page suggestions don't reflect **specific services** the user mentioned
  - User says "I run a yoga studio with retreat programs" → gets generic healthcare pages, not "Retreats", "Class Schedule", "Instructor Profiles"
- The suggestion prompt is very short (5-8 words) and doesn't leverage the user's idea text deeply

### Recommendations

- Pass the full user idea text to the page suggestion prompt, not just the detected industry
- Generate page descriptions alongside titles (so the user understands why each page is suggested)
- Allow users to add custom pages with a description of what should go on them
- Consider a second AI pass that refines page suggestions after the user has selected/modified their initial list

---

## 8. Testing Strategy — Synthetic Use Cases & Personas

### Purpose

To validate that content generation meets quality expectations, we need a structured set of test scenarios that can be run repeatedly and evaluated against defined criteria.

### Synthetic Use Cases

Create a test suite of 10-15 realistic business scenarios spanning all supported industries:

| # | Persona | Business | Idea Input | Expected Outcome |
|---|---------|----------|------------|------------------|
| 1 | Dr. Sarah Chen | Dental clinic | "Family dental practice in Portland, OR specializing in cosmetic dentistry, implants, and pediatric care" | Healthcare pages with specific services, provider profiles, patient forms with HIPAA notice |
| 2 | James Rivera | Law firm | "Immigration law firm helping families with visa applications, green cards, and citizenship in Miami" | Legal pages with practice areas, attorney bios, case results, consultation CTA |
| 3 | Maria Santos | Restaurant | "Farm-to-table Italian restaurant in Austin with seasonal tasting menus and private dining events" | Restaurant pages with menu, reservations, gallery, events, sourcing philosophy |
| 4 | Alex Thompson | SaaS startup | "Project management tool for remote teams with time tracking, Kanban boards, and AI task prioritization" | Tech/SaaS pages with features, pricing, integrations, testimonials, free trial CTA |
| 5 | Priya Patel | Yoga studio | "Wellness center offering yoga, meditation retreats, and Ayurvedic nutrition counseling in Boulder" | Wellness pages with class schedule, retreats, instructor profiles, booking |
| 6 | Tom & Lisa Baker | Real estate | "Luxury real estate team specializing in waterfront properties in the Florida Keys" | Real estate pages with listings, neighborhoods, buyer/seller guides, market reports |
| 7 | Chef Kai Nakamura | Food truck | "Japanese-Mexican fusion food truck in LA with weekly rotating specials and catering" | Simple restaurant/food pages with menu, locations, catering inquiry, social links |
| 8 | Dr. Emily Wong | Therapist | "Licensed therapist specializing in anxiety, PTSD, and couples counseling — telehealth available" | Healthcare pages with services, approach/methodology, insurance info, intake forms |
| 9 | Marcus Johnson | Nonprofit | "Youth mentorship nonprofit connecting at-risk teens with professional mentors in Detroit" | Nonprofit pages with mission, programs, volunteer signup, donate, impact stories |
| 10 | Sarah O'Brien | Wedding planner | "Destination wedding planning in Ireland — castle venues, local vendors, and full-service coordination" | Service pages with packages, portfolio/gallery, venue partners, planning process |

### Evaluation Criteria

For each test case, evaluate:

| Criterion | Target |
|-----------|--------|
| **Content relevance** | Content directly addresses the business described, not generic filler |
| **Content depth** | Each page has 300+ words of meaningful content |
| **Industry accuracy** | Correct industry detected; appropriate compliance flags |
| **Page structure** | Pages match what a real business of this type would need |
| **SEO quality** | Meta titles/descriptions are specific and keyword-rich |
| **Tone consistency** | Writing style matches the business type (formal for legal, warm for wellness) |
| **Call-to-action relevance** | CTAs match the business goal (book appointment vs. request quote vs. order online) |
| **Visual component selection** | Space DS components appropriate for content type |

### Presentation Materials

To communicate the vision and validate expectations with stakeholders, produce:

1. **Vision deck** (5-10 slides):
   - Problem: Current website builders produce generic sites
   - Solution: AI-powered generation with deep industry understanding
   - Demo: Side-by-side of current output vs. expected output
   - Architecture: Research → Plan → Generate → Review pipeline
   - Roadmap: Phased improvement plan

2. **Before/After comparisons** (per test case):
   - Current generator output (screenshot or markdown)
   - Expected production-quality output (manually crafted reference)
   - Gap analysis: what's missing, what needs improvement

3. **Content quality rubric**:
   - Scoring guide for evaluating generated content
   - Pass/fail thresholds per criterion
   - Automated checks where possible (word count, keyword presence, uniqueness)

---

## Summary of Required Work

| # | Work Item | Priority | Effort | Sprint |
|---|-----------|----------|--------|--------|
| 1 | Enhance onboarding with industry-specific follow-up questions | P1 | M | 05d |
| 2 | Implement Research → Plan → Generate pipeline | P0 | XL | 05d-06 |
| 3 | Upgrade AI model from gpt-4o-mini to gpt-4o/claude-sonnet | P1 | S | 05d |
| 4 | Add content review page with markdown preview | P1 | L | 05d |
| 5 | Step-level provisioning progress updates | P2 | M | 05d |
| 6 | Per-site database user creation | P1 | S | 05d |
| 7 | Improve page suggestion contextuality | P1 | S | 05d |
| 8 | Create synthetic test cases & evaluation framework | P1 | M | 05d |
| 9 | Produce vision deck & before/after comparisons | P2 | M | 05d |
