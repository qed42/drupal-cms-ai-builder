# Architecture Overview
## AI-Powered Drupal Website Builder

**Version:** 1.0
**Date:** 2026-03-17
**Status:** Draft

---

## 1. System Context

### System Boundary

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Platform (Drupal 11)                         │
│                                                                     │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────────────┐ │
│  │  Onboarding  │  │  AI Orchestration │  │   Site Runtime         │ │
│  │  Module      │──│  Layer            │──│   (Canvas + Space)     │ │
│  │             │  │  (AI Agents)      │  │                        │ │
│  └─────────────┘  └──────────────────┘  └────────────────────────┘ │
│                           │                                         │
└───────────────────────────│─────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         ┌──────┴──────┐        ┌───────┴──────┐
         │  OpenAI API  │        │  Claude API   │
         └─────────────┘        └──────────────┘
```

### Actors

| Actor | Interaction |
|-------|------------|
| **Site Owner** (primary user) | Onboarding wizard → review/edit via Canvas → publish |
| **Site Visitor** (anonymous) | Views published site, submits forms |
| **Platform Admin** | Manages platform configuration, monitors usage |

### External Systems

| System | Purpose | Integration |
|--------|---------|-------------|
| OpenAI API | LLM for content generation, industry analysis | Via Drupal AI module provider plugin |
| Anthropic Claude API | LLM (alternative/failover provider) | Via Drupal AI module provider plugin |
| SMTP Service | Transactional email (form notifications, trial reminders) | Drupal Mail API |
| Payment Gateway (Stripe) | Subscription billing | Stripe API via custom module or Commerce |
| Let's Encrypt | SSL certificate provisioning | Server-level automation |

---

## 2. Architecture Style

### Decision: Drupal-Native Monolith with AI Orchestration Layer

The platform is built as a **single Drupal 11 application** with specialized modules, not a decoupled/headless architecture.

**Rationale:**
- Canvas requires a Drupal-rendered frontend — decoupling the frontend would bypass Canvas entirely
- The Space theme's SDC components are server-rendered Drupal components, not JS framework components
- Drupal AI Agents operates within Drupal's runtime — keeping everything in Drupal avoids a separate orchestration service
- For an investor MVP, a monolith is faster to build, deploy, and demonstrate
- Drupal's entity/field system natively provides the content modeling the AI agents need to manipulate

**Trade-offs:**
- (+) Single deployment unit, simpler DevOps
- (+) AI Agents have direct access to Drupal APIs (entity CRUD, config, menu system)
- (+) Canvas + Space work natively without translation layer
- (-) Scaling the AI generation workload requires scaling the entire Drupal app
- (-) Frontend customization constrained to what Drupal/Canvas/Space allow

**Rejected alternatives:**
- *Decoupled React frontend + Drupal API backend:* Would require re-implementing Canvas-like editing in React. Not feasible for MVP timeline.
- *Microservices (separate AI orchestration service):* Over-engineered for MVP. Can be extracted later if scaling demands it.

### Patterns Used

| Pattern | Where Applied |
|---------|--------------|
| **Plugin architecture** | AI Agents (each agent is a Drupal plugin), LLM providers |
| **Pipeline/Chain** | Site generation flow (Industry Agent → Page Builder Agent → Content Agent) |
| **Queue-based async processing** | Site generation executed via Drupal Queue API |
| **Entity-centric data model** | All user/site/content data as Drupal entities |
| **Token-based theming** | Brand customization via CSS custom properties (Space design tokens) |

---

## 3. Component Architecture

### 3.1 Custom Modules

```
modules/custom/
├── ai_site_builder/          # Core orchestration module
│   ├── src/
│   │   ├── Controller/       # Wizard pages, generation endpoint
│   │   ├── Entity/           # SiteProfile entity
│   │   ├── Form/             # Multi-step onboarding wizard form
│   │   ├── Service/          # SiteGenerationService, BrandTokenService
│   │   ├── Plugin/
│   │   │   └── AiAgent/      # Custom AI Agent plugins
│   │   ├── EventSubscriber/  # Generation lifecycle events
│   │   └── Queue/            # Generation queue workers
│   └── ai_site_builder.module
│
├── ai_site_builder_trial/    # Trial & subscription management
│   ├── src/
│   │   ├── Service/          # TrialManager, SubscriptionService
│   │   ├── Plugin/
│   │   │   └── QueueWorker/  # Trial expiry checker
│   │   └── EventSubscriber/  # Trial lifecycle events
│   └── ai_site_builder_trial.module
│
└── ai_site_builder_publish/  # Publishing workflow
    ├── src/
    │   ├── Service/          # PublishService, DomainService
    │   └── Controller/       # Publish endpoint
    └── ai_site_builder_publish.module
```

### 3.2 Component Responsibilities

| Component | Responsibility | Key Interfaces |
|-----------|---------------|----------------|
| **ai_site_builder** | Core module: onboarding wizard, site profile entity, AI agent orchestration, generation pipeline | `SiteGenerationService::generate(SiteProfile)` |
| **ai_site_builder_trial** | Trial lifecycle, expiry notifications, subscription integration | `TrialManager::isActive(User)`, `TrialManager::expire(User)` |
| **ai_site_builder_publish** | Bulk publish/unpublish, domain management | `PublishService::publish(SiteProfile)` |
| **Drupal AI (contrib)** | LLM provider abstraction, API key management | `\Drupal\ai\AiProviderInterface` |
| **Drupal AI Agents (contrib)** | Agent plugin system, tool definitions, agentic loop | `\Drupal\ai_agents\Plugin\AiAgent\AiAgentInterface` |
| **Canvas (contrib)** | Visual page editor, SDC component rendering | Canvas editing API |
| **Space (theme)** | SDC components, design tokens, layout system | Component library, CSS custom properties |
| **Webform (contrib)** | Form building, submission storage, email handlers | Webform API |

### 3.3 Module Dependency Graph

```
ai_site_builder
├── ai (contrib)
├── ai_agents (contrib)
├── canvas (contrib)
├── webform (contrib)
└── space (theme)

ai_site_builder_trial
├── ai_site_builder
└── commerce (or custom Stripe integration)

ai_site_builder_publish
├── ai_site_builder
└── domain (optional, for custom domains)
```

---

## 4. Data Architecture

### 4.1 Core Data Model

#### SiteProfile Entity (Custom Content Entity)

The central entity that stores all onboarding data and links to the generated site.

```
SiteProfile
├── id (int)
├── uuid (string)
├── user_id (entity_reference → User)
├── status (string: "onboarding" | "generating" | "generated" | "published" | "expired")
├── onboarding_step (int: 1-5, tracks progress for save/resume)
│
├── # Step 1: Basics
├── site_name (string)
├── tagline (string)
├── logo (file reference)
├── admin_email (email)
│
├── # Step 2: Industry
├── industry (entity_reference → taxonomy:industry)
├── industry_other (text_long, free-text for "Other")
│
├── # Step 3: Brand
├── color_primary (string, hex)
├── color_secondary (string, hex)
├── color_accent (string, hex)
├── font_heading (string)
├── font_body (string)
├── reference_urls (string, multi-value)
├── brand_guidelines (file reference)
│
├── # Step 4: Business Context
├── services (text_long, structured list)
├── target_audience (text_long)
├── competitors (string, multi-value)
├── ctas (string, multi-value)
│
├── # Step 5: Dynamic Questions
├── industry_answers (map/serialized, stores Q&A pairs)
├── compliance_flags (string, multi-value: "hipaa", "ada", "gdpr", etc.)
│
├── # Generation Metadata
├── generation_started (timestamp)
├── generation_completed (timestamp)
├── generated_pages (entity_reference → node, multi-value)
├── generated_content_types (string, multi-value, machine names)
│
├── # Trial & Subscription
├── trial_start (timestamp)
├── trial_end (timestamp)
├── subscription_id (string, external payment reference)
├── subscription_status (string: "trial" | "active" | "expired" | "cancelled")
│
├── created (timestamp)
└── changed (timestamp)
```

#### Content Entities (AI-Generated)

These are standard Drupal nodes and entities created programmatically by the AI agents:

```
Node types (dynamically created per site):
├── page (basic pages: Home, About, Contact)
├── service (if applicable)
├── team_member (if applicable)
├── testimonial (if applicable)
├── [industry-specific types]

Taxonomy vocabularies:
├── industry (predefined: Healthcare, Legal, Real Estate, Restaurant, Professional Services, Other)
├── service_category (generated per site)

Webform:
├── contact_form (generated per site)
├── [industry-specific forms]

Menu:
├── main (auto-populated with generated pages)
```

### 4.2 Data Flow: Onboarding → Generation → Publish

```
User Input          SiteProfile Entity       AI Agents              Drupal Entities
─────────────       ──────────────────       ─────────              ───────────────
Step 1-4 ────────►  Store onboarding
                    data
Step 5   ────────►  Store industry     ────► Industry Agent
                    answers                  analyzes context
                                             │
                                             ▼
"Generate" ──────►  status: generating ────► Page Builder Agent
                                             selects SDC components,
                                             composes layouts
                                             │
                                             ▼
                                             Content Agent ────────► Creates nodes,
                                             generates text,         entities, menus,
                                             SEO, CTAs               webforms
                                             │
                                             ▼
                    status: generated  ◄──── Brand Token Service ──► Applies design
                                             applies colors/fonts    tokens to theme

"Publish" ───────►  status: published  ────► PublishService ───────► Bulk publish
                                             publishes all nodes     all content
```

### 4.3 Data Isolation Strategy

For MVP, all sites run on a **single Drupal instance**. Data isolation is enforced at the application level:

| Concern | Approach |
|---------|----------|
| **Content isolation** | All generated nodes/entities tagged with `site_profile_id` via entity reference field. Views/queries always filter by owner's site profile. |
| **File isolation** | Files stored in per-user directories: `sites/default/files/sites/{site_profile_uuid}/` |
| **LLM prompt isolation** | Each AI agent call includes only the requesting user's SiteProfile data. No shared context/memory across users. |
| **Admin access isolation** | Custom permissions ensure users can only edit their own site's content. Standard Drupal access control via `hook_node_access` / entity access handlers. |

> **Trade-off acknowledged:** Single-instance multi-tenancy is simpler for MVP but limits true isolation. For production scaling, evaluate per-site containers or Drupal multi-site. See ADR-004.

---

## 5. Integration Architecture

### 5.1 Drupal AI Module Integration

```
ai_site_builder ──► Drupal AI Module ──► Provider Plugins
                    (abstraction)        ├── OpenAI Provider
                                         └── Anthropic Provider

Configuration:
- Default provider: OpenAI (gpt-4o)
- Fallback provider: Anthropic (Claude Sonnet)
- Failover: Automatic retry with alternate provider on 5xx/timeout
```

**Key integration points:**
- `\Drupal\ai\AiProviderInterface::chat()` — All LLM calls go through this abstraction
- Provider-agnostic prompts — agents construct prompts without provider-specific formatting
- API keys stored in Drupal config (encrypted via Key module)

### 5.2 Drupal AI Agents Integration

Each generation step is an AI Agent plugin:

```php
// Plugin annotation pattern
@AiAgent(
  id = "industry_analyzer",
  label = "Industry Analyzer Agent",
  description = "Analyzes industry and business context to determine site structure"
)
```

**Agent Plugins for this project:**

| Agent Plugin | Input | Output | Tools Available |
|-------------|-------|--------|-----------------|
| `industry_analyzer` | SiteProfile (industry, services, answers) | Site blueprint: required pages, content types, compliance flags | Read SiteProfile, taxonomy lookup |
| `page_builder` | Site blueprint + SDC component catalog | Assembled Canvas pages with placed components | **Canvas skills** (add_section, place_component, set_props, reorder), SDC component manifest |
| `content_generator` | Assembled pages + business context | Generated text content: headlines, body copy, SEO meta | Entity CRUD, metatag fields, Canvas set_component_props |
| `form_generator` | Industry context + page list | Webform configuration with fields | Webform API, Canvas place_component (to embed forms) |

> **Note:** The Page Builder Agent uses Canvas-provided AI Agent skills/tools to place components, rather than producing raw layout data. Canvas validates all tool calls, ensuring only valid operations are performed.

### 5.3 Canvas + Space Theme Integration

```
Canvas (Editor)
│
├── Reads: Space SDC component library
│   └── Components rendered in editor palette
│
├── Writes: Node layout data
│   └── Stores component placement, props, ordering
│
├── Exposes: AI Agent Skills/Tools
│   └── Canvas operations available as AI Agent tools:
│       ├── add_section(page, position)
│       ├── place_component(section, component_id, props)
│       ├── set_component_props(component_instance, props)
│       ├── reorder_sections(page, order)
│       └── remove_section(page, section_id)
│
└── AI Agent hook-in:
    └── "Regenerate" button triggers content_generator agent
        for the selected section/component only
```

**Key integration approach:** Canvas exposes its operations as **AI Agent skills/tools** via the Drupal AI Agents module. The Page Builder Agent does not construct raw Canvas layout data — instead, it calls Canvas-provided tool functions (e.g., "add a hero section", "place a card-grid component with these props"). This means:
- The agent interacts with Canvas through a well-defined tool API, not internal data structures
- Canvas validates all operations — the agent cannot create invalid layouts
- The SDC component manifest tells the agent *what* is available; Canvas skills handle *how* to place them
- This de-risks the Canvas integration significantly — changes to Canvas internals don't break the agent

### 5.4 Space Design Token Integration

```
User Brand Input (SiteProfile)
│
▼
BrandTokenService
├── Maps user colors → CSS custom property overrides
├── Maps user fonts → font-family declarations
├── Generates: theme settings override or inline CSS custom properties
│
▼
Space Theme
├── Reads CSS custom properties for all visual rendering
└── All SDC components inherit brand via token cascade
```

**Implementation approach:** Generate a CSS file with custom property overrides per site:

```css
/* Generated: /sites/default/files/sites/{uuid}/brand-tokens.css */
:root {
  --space-color-primary: #2563eb;
  --space-color-secondary: #1e40af;
  --space-color-accent: #f59e0b;
  --space-font-heading: 'Inter', sans-serif;
  --space-font-body: 'Open Sans', sans-serif;
}
```

Loaded via `hook_page_attachments` for the specific site.

---

## 6. AI Agent Architecture

### 6.1 Generation Pipeline

The site generation flow is a **sequential pipeline** with each agent producing structured output consumed by the next:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Industry        │     │ Page Builder     │     │ Content         │     │ Form            │
│ Analyzer Agent  │────►│ Agent            │────►│ Generator Agent │────►│ Generator Agent  │
│                 │     │                  │     │                 │     │                  │
│ IN: SiteProfile │     │ IN: Blueprint    │     │ IN: Layouts     │     │ IN: Page list    │
│ OUT: Blueprint  │     │ OUT: Layouts     │     │ OUT: Entities   │     │ OUT: Webforms    │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                                               │
                                                                               ▼
                                                                        ┌─────────────────┐
                                                                        │ Brand Token      │
                                                                        │ Service          │
                                                                        │ (not an agent)   │
                                                                        │                  │
                                                                        │ IN: SiteProfile  │
                                                                        │ OUT: CSS tokens  │
                                                                        └─────────────────┘
```

### 6.2 Agent Data Contracts

#### Industry Analyzer Agent → Site Blueprint

```json
{
  "pages": [
    { "type": "home", "title": "Home", "required": true },
    { "type": "about", "title": "About Us", "required": true },
    { "type": "services", "title": "Our Services", "required": true },
    { "type": "team", "title": "Our Team", "required": false },
    { "type": "contact", "title": "Contact Us", "required": true }
  ],
  "content_types": [
    {
      "machine_name": "service",
      "label": "Service",
      "fields": [
        { "name": "description", "type": "text_long" },
        { "name": "image", "type": "image" },
        { "name": "cta_text", "type": "string" }
      ]
    }
  ],
  "compliance": {
    "disclaimers": ["medical_general"],
    "form_requirements": ["hipaa_notice"]
  },
  "tone": "professional_warm",
  "keywords": ["family healthcare", "pediatrics", "urgent care"]
}
```

#### Page Builder Agent → Canvas Tool Calls

Rather than producing a JSON layout, the Page Builder Agent **executes Canvas skills** sequentially. Example tool call sequence for a Home page:

```
1. canvas_create_page(title="Home", type="page", path="/")
2. canvas_add_section(page="/", position=0)
3. canvas_place_component(section=0, component="space:hero", props={
     "headline": "{{generate}}",
     "subheadline": "{{generate}}",
     "cta_text": "Book an Appointment",
     "cta_url": "/contact",
     "image": "{{placeholder:hero}}"
   })
4. canvas_add_section(page="/", position=1)
5. canvas_place_component(section=1, component="space:card-grid", props={
     "heading": "Our Services",
     "cards": "{{ref:content_type:service}}",
     "columns": 3
   })
6. canvas_add_section(page="/", position=2)
7. canvas_place_component(section=2, component="space:cta-banner", props={
     "text": "{{generate}}",
     "button_text": "Get in Touch",
     "button_url": "/contact"
   })
```

> `{{generate}}` markers indicate content the Content Generator Agent must fill in a subsequent pass.
> `{{ref:content_type:service}}` indicates dynamic content pulled from generated entities.
> `{{placeholder:hero}}` indicates an image placeholder.
> Canvas validates each tool call — invalid component IDs or props are rejected immediately, giving the agent a chance to self-correct.

#### Content Generator Agent → Entity Data

The Content Generator Agent:
1. Creates Drupal content type definitions (if not already created by Industry Analyzer)
2. Creates entity instances with generated text
3. Fills `{{generate}}` markers in page layouts with actual content
4. Sets meta titles/descriptions on all pages

### 6.3 SDC Component Manifest

The Page Builder Agent needs a machine-readable catalog of available components. This is a **static manifest file** derived from the Space theme's SDC directory:

```json
{
  "components": [
    {
      "id": "space:hero",
      "label": "Hero Banner",
      "category": "hero",
      "props": {
        "headline": { "type": "string", "required": true },
        "subheadline": { "type": "string", "required": false },
        "cta_text": { "type": "string", "required": false },
        "cta_url": { "type": "string", "required": false },
        "image": { "type": "image", "required": false }
      },
      "slots": {},
      "usage_hint": "Full-width hero section, typically first on homepage"
    }
  ]
}
```

This manifest is:
- Generated from Space theme's `*.component.yml` files
- Included in the Page Builder Agent's system prompt
- The **single source of truth** for what components the AI can use — enforces the whitelist constraint

### 6.4 Error Handling & Recovery

| Failure Point | Recovery Strategy |
|--------------|-------------------|
| LLM API timeout/error | Retry up to 3 times with exponential backoff; failover to alternate provider |
| Agent produces invalid output | Validate against JSON schema; re-prompt with error feedback (agentic self-correction) |
| Agent references non-existent component | Reject and re-prompt with component manifest reminder |
| Partial generation failure (e.g., 3 of 5 pages created) | Mark generation as "partial"; allow user to retry from failure point |
| Queue worker crash | Drupal Queue API auto-retries; generation state tracked on SiteProfile entity |

---

## 7. API Design

### 7.1 Internal API (Module Services)

No public API for MVP. All interactions are internal Drupal services:

```php
// Core generation service
interface SiteGenerationServiceInterface {
  public function generate(SiteProfileInterface $profile): void;
  public function getStatus(SiteProfileInterface $profile): GenerationStatus;
  public function retry(SiteProfileInterface $profile, ?string $fromStep = NULL): void;
}

// Trial management
interface TrialManagerInterface {
  public function startTrial(AccountInterface $user): SiteProfileInterface;
  public function isActive(AccountInterface $user): bool;
  public function getRemainingDays(AccountInterface $user): int;
  public function expire(SiteProfileInterface $profile): void;
}

// Publishing
interface PublishServiceInterface {
  public function publish(SiteProfileInterface $profile): PublishResult;
  public function unpublish(SiteProfileInterface $profile): void;
  public function isPublished(SiteProfileInterface $profile): bool;
}

// Brand tokens
interface BrandTokenServiceInterface {
  public function generateTokens(SiteProfileInterface $profile): string; // Returns CSS
  public function applyTokens(SiteProfileInterface $profile): void;
}
```

### 7.2 Generation Progress Endpoint

For the real-time progress UI (US-019):

```
GET /api/generation/{site_profile_id}/status

Response (SSE stream or JSON polling):
{
  "status": "generating",
  "current_step": "content_generation",
  "steps": [
    { "id": "industry_analysis", "label": "Analyzing your industry...", "status": "completed" },
    { "id": "content_types", "label": "Creating content structure...", "status": "completed" },
    { "id": "page_layouts", "label": "Designing page layouts...", "status": "completed" },
    { "id": "content_generation", "label": "Writing content...", "status": "in_progress" },
    { "id": "forms", "label": "Creating forms...", "status": "pending" },
    { "id": "branding", "label": "Applying your brand...", "status": "pending" }
  ],
  "progress_percent": 60
}
```

**Implementation:** Polling endpoint (simpler for MVP) over SSE. Generation status stored on SiteProfile entity, updated by each queue worker step.

---

## 8. Security Architecture

### 8.1 Authentication & Authorization

| Layer | Mechanism |
|-------|-----------|
| **User authentication** | Drupal's built-in auth (session-based); custom simplified login/register forms |
| **Site owner authorization** | Custom access handler: users can only CRUD entities where `site_profile.user_id == current_user` |
| **Admin authorization** | Separate admin role with platform-wide access |
| **Canvas editing** | Custom permission: `edit own site content` — scoped to user's generated entities |
| **Drupal admin UI** | Blocked for site owners — they interact only via onboarding wizard + Canvas. Admin routes restricted by role. |

### 8.2 Data Protection

| Concern | Approach |
|---------|----------|
| **LLM data isolation** | Each agent call includes only the requesting user's SiteProfile data. No shared conversation memory. No PII sent to LLMs beyond business name/services. |
| **API key security** | LLM API keys stored via Drupal Key module (encrypted at rest). Never exposed to frontend. |
| **File upload security** | File validation (type, size, MIME check). Files stored outside webroot where possible. |
| **HTTPS** | Enforced at server level. HSTS headers. |
| **CSRF** | Drupal's built-in CSRF token protection on all forms and state-changing endpoints. |

### 8.3 Rate Limiting

| Endpoint | Limit | Rationale |
|----------|-------|-----------|
| Site generation | 3 per user per hour | Prevent LLM cost abuse |
| Section regeneration | 20 per user per hour | Allow iterative editing |
| Form submission | 10 per IP per hour | Spam prevention |
| Registration | 5 per IP per hour | Abuse prevention |

Implemented via a custom rate limiter service or contrib module (e.g., `rate_limiter`).

---

## 9. Infrastructure Considerations

### 9.1 MVP Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Application Server              │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Drupal   │  │ Queue    │  │ Cron       │ │
│  │ Web App  │  │ Worker   │  │ (trial     │ │
│  │          │  │ (AI gen) │  │  expiry)   │ │
│  └─────────┘  └──────────┘  └────────────┘ │
│       │                                     │
│  ┌────┴────┐                                │
│  │ Nginx   │                                │
│  │ + SSL   │                                │
│  └─────────┘                                │
└──────────────────────┬──────────────────────┘
                       │
              ┌────────┴────────┐
              │   MySQL/MariaDB  │
              │   Database       │
              └─────────────────┘
```

### 9.2 Scaling Considerations

| Bottleneck | MVP Approach | Future Scaling |
|-----------|-------------|----------------|
| **AI generation (CPU/time)** | Drupal Queue worker processes generation sequentially. Multiple queue workers for concurrency. | Dedicated queue worker containers, auto-scaled based on queue depth |
| **Database** | Single DB instance | Read replicas, or per-tenant databases |
| **File storage** | Local filesystem | S3-compatible object storage |
| **Caching** | Drupal page/render cache + Redis | CDN (CloudFront/Cloudflare) for published sites |
| **Multi-tenancy** | Single Drupal instance, application-level isolation | Container-per-site or Drupal multi-site |

### 9.3 Caching Strategy

| Layer | What | TTL |
|-------|------|-----|
| **Page cache** | Published site pages (anonymous) | Until content changes (tag-based invalidation) |
| **Render cache** | SDC component render arrays | Until entity/config changes |
| **AI response cache** | Do NOT cache — each generation is unique | N/A |
| **Component manifest** | SDC component catalog for AI agents | Until theme update |

---

## 10. Architecture Decision Records (ADRs)

### ADR-001: Drupal Monolith vs. Decoupled Architecture

**Context:** The platform needs an onboarding wizard (form-based), AI generation (backend), visual editing (Canvas), and a public-facing site.

**Options:**
1. **Drupal monolith** — Everything in Drupal: forms, AI orchestration, Canvas editing, public site
2. **Decoupled frontend (React/Next.js) + Drupal API** — React handles onboarding/editing UX, Drupal is headless backend
3. **Hybrid** — React for onboarding wizard only, Drupal for Canvas editing and public site

**Decision:** Option 1 — Drupal Monolith

**Rationale:**
- Canvas is a Drupal-native editor that requires Drupal's frontend rendering pipeline
- Space SDC components are Twig-based, server-rendered — not React components
- AI Agents module runs within Drupal's PHP runtime
- Decoupling would mean rebuilding Canvas in React — months of work with no benefit
- Monolith is fastest to build for MVP timeline

**Consequences:**
- Onboarding wizard UX constrained to what Drupal Form API + frontend libraries can achieve
- Consider using a JS framework (Alpine.js, Stimulus) for wizard interactivity within Drupal pages
- If onboarding UX proves insufficient, can decouple just the wizard in a future iteration

---

### ADR-002: AI Agent Orchestration — Pipeline vs. Orchestrator

**Context:** Multiple AI agents must work together to generate a site. Need to decide how they coordinate.

**Options:**
1. **Sequential pipeline** — Each agent runs in order, output feeds the next
2. **Orchestrator pattern** — A central coordinator decides which agent to call and when
3. **Event-driven** — Agents publish/subscribe to events, react independently

**Decision:** Option 1 — Sequential Pipeline

**Rationale:**
- The generation flow has clear, linear dependencies: industry analysis → page structure → content → forms → branding
- No parallelism opportunity — each step needs the previous step's output
- Simplest to implement, debug, and track progress
- Orchestrator adds complexity without benefit when the flow is linear
- Event-driven is over-engineered for a fixed pipeline

**Consequences:**
- Easy to add progress tracking (each step maps to a progress update)
- Easy to retry from a specific step on failure
- If future requirements need parallel agent work (e.g., generating pages in parallel), refactor to orchestrator

---

### ADR-003: Multi-Tenancy — Application-Level Isolation vs. Multi-Site

**Context:** Multiple users each have their own generated site. Need to isolate content, files, and configuration between them.

**Options:**
1. **Application-level isolation** — Single Drupal instance, entity-level access control, per-user file directories
2. **Drupal multi-site** — Each user gets a separate Drupal site instance sharing the same codebase
3. **Container-per-site** — Each user gets an isolated Docker container with their own Drupal instance

**Decision:** Option 1 — Application-Level Isolation (for MVP)

**Rationale:**
- Fastest to implement — no infrastructure provisioning automation needed
- Single database, single codebase, single deployment
- Drupal's entity access system is mature and battle-tested
- MVP won't have enough users to stress single-instance limits
- Multi-site and container-per-site require significant DevOps investment

**Trade-offs:**
- (+) Simple deployment, single point of management
- (-) All users share one database — potential noisy neighbor issues at scale
- (-) A bug in access control could leak data between users
- (-) Generated content types are shared across all sites (can't have per-site schema differences)

**Migration path:** If scaling demands it, Option 3 (container-per-site) is the cleanest upgrade path. The SiteProfile entity contains all data needed to provision a dedicated instance.

**Mitigation:** Comprehensive access control tests (Playwright); entity access handler audit; generated content types use a namespace prefix (e.g., `site_{uuid}_service`).

---

### ADR-004: Onboarding Wizard Implementation

**Context:** The 5-step onboarding wizard needs to feel modern and responsive, but must live within Drupal's frontend.

**Options:**
1. **Drupal Form API multi-step form** — Server-rendered, AJAX-powered step transitions
2. **Drupal Form API + Alpine.js** — Server-validated, client-enhanced interactivity
3. **Embedded React app** — React SPA embedded in a Drupal page for the wizard only
4. **Drupal Form API + HTMX** — Server-rendered with declarative AJAX behavior

**Decision:** Option 2 — Drupal Form API + Alpine.js

**Rationale:**
- Form API provides server-side validation, CSRF protection, and file upload handling natively
- Alpine.js adds client-side interactivity (step transitions, conditional fields, color picker) without a build step
- Lighter than React — no build pipeline, no hydration complexity
- Works within Drupal's rendering pipeline — compatible with Canvas and Space theme
- The wizard is a fixed 5-step flow, not a complex SPA — Alpine.js is right-sized

**Consequences:**
- Color picker component needs an Alpine.js integration (or a lightweight JS library)
- Step transitions are animated client-side but validated server-side
- Dynamic industry questions (Step 5) use AJAX callback to fetch AI-generated questions

---

### ADR-005: Brand Token Strategy

**Context:** Each site needs unique branding (colors, fonts) applied to the shared Space theme.

**Options:**
1. **CSS custom property overrides** — Generate a per-site CSS file that overrides Space's design tokens
2. **Drupal sub-theme per site** — Generate a Space sub-theme for each user
3. **Theme settings override** — Use Space theme's settings form to store per-site values, apply via preprocess

**Decision:** Option 1 — CSS Custom Property Overrides

**Rationale:**
- Space SDC components use CSS custom properties for theming — this is how they're designed to be customized
- A generated CSS file per site is simple, cacheable, and doesn't require theme compilation
- No build step needed — CSS file is generated PHP-side and attached via `hook_page_attachments`
- Sub-theme per site creates filesystem complexity and codebase bloat
- Theme settings override requires Space-specific integration that may break on theme updates

**Implementation:**
- `BrandTokenService` generates CSS from SiteProfile brand fields
- CSS file written to `public://sites/{uuid}/brand-tokens.css`
- Attached via `hook_page_attachments` when serving a request for that site
- Invalidated when user updates brand settings

---

### ADR-006: Content Type Strategy — Shared vs. Per-Site

**Context:** AI generates content types (Service, Team Member, etc.) based on industry. When multiple users share one Drupal instance, content type definitions are global.

**Options:**
1. **Shared content types** — Define a superset of content types at platform level; AI uses appropriate ones per industry
2. **Dynamic per-site content types** — AI creates content types dynamically with namespaced machine names
3. **Single flexible content type** — One "content item" type with configurable fields via paragraphs/components

**Decision:** Option 1 — Shared Content Types

**Rationale:**
- Drupal content types are config entities — creating them dynamically is fragile and hard to maintain
- A predefined set covering all MVP industries (see PRD Appendix B) is manageable (~10-15 types)
- Shared types mean shared views, shared form displays, shared access control — less to generate
- The AI agent selects which existing content types to use, rather than creating new ones
- Avoids database schema changes at runtime (which can cause locks and performance issues)

**Trade-offs:**
- (+) Predictable, testable, maintainable content architecture
- (+) Views and displays can be pre-built and themed
- (-) Less flexible — an industry the platform doesn't anticipate may get generic types
- (-) Unused content types exist in the system (minor, hidden from users)

**Content type catalog (MVP):**

| Machine Name | Used By Industries |
|-------------|-------------------|
| `page` | All |
| `service` | All |
| `team_member` | All |
| `testimonial` | All |
| `location` | Healthcare, Restaurant, Real Estate |
| `provider` | Healthcare |
| `attorney` | Legal |
| `practice_area` | Legal |
| `listing` | Real Estate |
| `menu_item` | Restaurant |
| `case_study` | Legal, Professional Services |

---

### ADR-007: Generation Execution — Synchronous vs. Queue

**Context:** Site generation involves multiple LLM calls (4 agents, each may make multiple calls). Total time: 1-5 minutes. Need to decide execution model.

**Options:**
1. **Synchronous request** — User waits on a long HTTP request with streaming progress
2. **Background queue** — Generation dispatched to Drupal Queue, progress polled by frontend
3. **Background queue + SSE** — Queue-based with Server-Sent Events for real-time progress

**Decision:** Option 2 — Background Queue with Polling

**Rationale:**
- Long HTTP requests risk timeouts (PHP `max_execution_time`, reverse proxy timeouts)
- Queue-based execution is resilient — survives server restarts, retryable on failure
- Polling is simpler to implement than SSE and sufficient for ~5-minute generation windows
- Drupal Queue API is mature and well-understood
- Progress stored on SiteProfile entity — polling is a simple entity load

**Implementation:**
- "Generate" button dispatches a queue item
- Dedicated queue worker (drush queue:run or supervisor-managed) processes generation
- Frontend polls `/api/generation/{id}/status` every 3 seconds
- Each pipeline step updates SiteProfile's `status` field

---

## Appendix: Technology Decisions Summary

| Decision | Choice | Alternatives Considered |
|----------|--------|------------------------|
| Architecture style | Drupal monolith | Decoupled React+Drupal, Hybrid |
| Agent orchestration | Sequential pipeline | Orchestrator, Event-driven |
| Multi-tenancy | Application-level isolation | Multi-site, Container-per-site |
| Onboarding UI | Drupal Form API + Alpine.js | React SPA, HTMX, plain Form API |
| Brand customization | CSS custom property overrides | Sub-themes, Theme settings |
| Content types | Shared/predefined catalog | Dynamic per-site, Flexible single type |
| Generation execution | Background queue + polling | Synchronous, Queue + SSE |
| Payment integration | Stripe (evaluate Commerce vs. custom) | PayPal, custom-only |
| LLM providers | OpenAI primary + Claude fallback | Single provider |
| Caching | Drupal cache + Redis | Varnish, CDN-only |

---

*Next step: Invoke `/drupal-architect` to map this architecture to Drupal-specific implementation details and break user stories into technical backlog tasks.*
