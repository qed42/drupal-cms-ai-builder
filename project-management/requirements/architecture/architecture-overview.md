# Architecture Overview
## AI-Powered Drupal Website Builder

**Version:** 2.0
**Date:** 2026-03-18
**Status:** Draft
**Previous:** v1.0 (2026-03-17) — Single Drupal monolith. Superseded by split-platform architecture.

---

## 1. System Context

### Architecture Vision

The platform is split into **three layers**: a Next.js Platform App (user-facing), a Provisioning Engine (automation), and Drupal Multisite instances (site runtime). The onboarding journey, user identity, and subscription management live in Next.js. Drupal is the site runtime — it serves generated websites and provides Canvas-based editing.

### System Boundary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Next.js Platform App                                │
│                  (Identity, Onboarding, Dashboard)                       │
│                                                                          │
│  ┌────────────┐  ┌──────────────────┐  ┌──────────────┐                 │
│  │  Auth &     │  │  Onboarding      │  │  Dashboard   │                 │
│  │  Users      │  │  Wizard          │  │  (sub mgmt)  │                 │
│  └────────────┘  └────────┬─────────┘  └──────────────┘                 │
│                           │                                              │
│                    AI: Industry inference,                                │
│                    page suggestion,                                       │
│                    color extraction                                       │
│                           │                                              │
│                  ┌────────┴────────┐                                      │
│                  │    Blueprint     │                                      │
│                  │  (Markdown +     │                                      │
│                  │   Assets)        │                                      │
│                  └────────┬────────┘                                      │
└───────────────────────────┼──────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     Provisioning Engine                                    │
│                 (Node.js/Python + Drush CLI)                               │
│                                                                           │
│  1. Create database   4. Build Canvas layouts   7. Configure menus        │
│  2. Generate settings 5. Apply brand tokens     8. Update sites.php       │
│  3. drush site:install 6. Import content        9. Callback → Platform    │
└───────────────────────────┬───────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │  Site A     │ │  Site B     │ │  Site C     │
       │  (Drupal    │ │  (Drupal    │ │  (Drupal    │
       │  multisite) │ │  multisite) │ │  multisite) │
       │             │ │             │ │             │
       │  Own DB     │ │  Own DB     │ │  Own DB     │
       │  Own config │ │  Own config │ │  Own config │
       │  Own files  │ │  Own files  │ │  Own files  │
       │  Space theme│ │  Space theme│ │  Space theme│
       │  + Canvas   │ │  + Canvas   │ │  + Canvas   │
       └────────────┘ └────────────┘ └────────────┘
```

### Actors

| Actor | Where | Interaction |
|-------|-------|------------|
| **Site Owner** (primary user) | Next.js App → Drupal site | Onboarding wizard → blueprint generated → site provisioned → edit via Canvas |
| **Site Visitor** (anonymous) | Drupal site | Views published site, submits forms |
| **Platform Admin** | Next.js App + Drupal admin | Manages platform, monitors sites |

### External Systems

| System | Purpose | Integration Point |
|--------|---------|-------------------|
| OpenAI API | LLM for industry analysis, page suggestion, content generation | Next.js (onboarding AI) + Drupal (content generation during provisioning) |
| Anthropic Claude API | LLM (alternative/failover) | Same as OpenAI |
| Stripe | Subscription billing | Next.js Platform App |
| SMTP Service | Transactional email | Next.js (onboarding emails) + Drupal (form notifications) |
| Let's Encrypt | SSL certificate provisioning | Server-level automation |

---

## 2. Architecture Style

### Decision: Split-Platform with Drupal Multisite

**Changed from v1:** The v1 architecture was a Drupal monolith handling everything (onboarding, AI, editing, publishing). v2 splits the platform into specialized layers.

**Rationale for the split:**
- The onboarding journey (Figma designs) is a conversational, one-question-per-screen UX that is far better served by a modern React/Next.js frontend than Drupal Form API
- User identity, subscription, and dashboard features are standard SaaS concerns — Next.js with a proper DB is the right tool
- Drupal's strength is content management and rendering — it should focus on being the site runtime
- Multisite gives real database-level isolation without container orchestration overhead
- The "blueprint" as a contract between onboarding and provisioning creates a clean boundary

**Why Drupal Multisite (not containers):**
- Single codebase, single server — no Kubernetes/ECS orchestration needed
- Each site gets its own database and files directory — real isolation
- Shared modules and theme (Space) across all sites — one update applies everywhere
- Provisioning is fast (~30 seconds: create DB, `drush si`, import config/content)
- Scales vertically to hundreds of sites on a single server before needing to shard

**Trade-offs:**
- (+) Best-in-class UX for onboarding (Next.js)
- (+) Real data isolation per site (own DB)
- (+) Single Drupal codebase to maintain
- (+) No container orchestration complexity
- (-) Two applications to deploy and maintain (Next.js + Drupal)
- (-) Auth handoff between Next.js and Drupal requires careful design
- (-) Shared PHP process — one site can't have unique modules

**Rejected alternatives:**
- *Drupal monolith (v1 approach):* Onboarding UX too constrained by Drupal Form API. Dashboard/subscription better served by Next.js.
- *Container-per-site:* Over-engineered for MVP. Docker/ECS orchestration adds significant ops burden. Can migrate to this later if multisite hits limits.
- *Single-instance multi-tenancy (v1 approach):* Entity-level ACL is fragile — a bug leaks data. Multisite is safer with minimal extra cost.

### Patterns Used

| Pattern | Where Applied |
|---------|--------------|
| **Blueprint as contract** | Markdown files are the interface between Next.js onboarding and Drupal provisioning |
| **Platform + Runtime split** | Next.js owns user lifecycle; Drupal owns content runtime |
| **Multisite isolation** | Each provisioned site is a Drupal multisite with own DB |
| **Pipeline** | Content generation during provisioning (analyze → build pages → generate content → apply brand) |
| **Token-based theming** | Brand customization via CSS custom properties (Space design tokens) |
| **One-time login token** | Auth handoff from Next.js dashboard to Drupal Canvas editor |

---

## 3. Component Architecture

### 3.1 Next.js Platform App

```
platform-app/                          # Next.js application
├── src/
│   ├── app/                           # App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (onboarding)/
│   │   │   ├── start/                 # "Let's shape your big idea"
│   │   │   ├── name/                  # "What are we calling this?"
│   │   │   ├── idea/                  # "What's the big idea?"
│   │   │   ├── audience/             # "Who is this for?"
│   │   │   ├── pages/                # "Let's map your site" (AI-suggested)
│   │   │   ├── design/              # "How should it feel?"
│   │   │   ├── brand/               # "Give it a face" (logo + colors)
│   │   │   └── fonts/               # "Select a font"
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Site overview + status
│   │   │   └── subscription/         # Subscription management
│   │   └── api/
│   │       ├── onboarding/           # Save/resume onboarding data
│   │       ├── ai/
│   │       │   ├── analyze/          # Industry inference from description
│   │       │   ├── suggest-pages/    # AI-suggested page structure
│   │       │   └── extract-colors/   # Color extraction from uploaded assets
│   │       ├── provision/            # Trigger site provisioning
│   │       ├── auth/                 # NextAuth routes
│   │       └── webhooks/
│   │           └── stripe/           # Stripe webhook handler
│   ├── lib/
│   │   ├── db/                       # Database client (Prisma / Drizzle)
│   │   ├── ai/                       # AI client wrappers
│   │   ├── provisioning/             # Provisioning engine client
│   │   └── stripe/                   # Stripe integration
│   └── components/
│       ├── onboarding/               # Wizard step components
│       └── dashboard/                # Dashboard UI
├── prisma/
│   └── schema.prisma                 # Database schema
└── public/
```

### 3.2 Drupal Multisite (Site Runtime)

```
web/modules/custom/
├── ai_site_builder/                   # Core module (simplified from v1)
│   ├── src/
│   │   ├── Service/
│   │   │   ├── BlueprintImportService.php       # Parses blueprint markdowns
│   │   │   ├── BlueprintImportServiceInterface.php
│   │   │   ├── ComponentManifestService.php     # SDC component catalog
│   │   │   ├── ComponentManifestServiceInterface.php
│   │   │   ├── BrandTokenService.php            # CSS custom property generation
│   │   │   ├── BrandTokenServiceInterface.php
│   │   │   ├── ContentPopulationService.php     # Creates entities from blueprint
│   │   │   ├── ContentPopulationServiceInterface.php
│   │   │   └── AutoLoginService.php             # One-time login token validation
│   │   ├── Controller/
│   │   │   └── AutoLoginController.php          # Token-based login from dashboard
│   │   ├── Plugin/
│   │   │   └── AiAgent/
│   │   │       ├── PageBuilderAgent.php          # Builds Canvas layouts
│   │   │       └── ContentGeneratorAgent.php     # Generates text content
│   │   └── Drush/
│   │       └── Commands/
│   │           └── ProvisionCommands.php         # Drush commands for provisioning
│   └── config/
│       └── install/                              # Content type configs, field configs
│
└── ai_site_builder_content/           # Content type definitions submodule
    └── config/
        └── install/                   # All shared content type YAML configs
```

**What moved out of Drupal (compared to v1):**

| Component | v1 (Drupal) | v2 (Next.js) | Reason |
|-----------|-------------|--------------|--------|
| OnboardingWizardForm | Drupal Form API | Next.js pages | Better UX, conversational flow |
| SiteProfile entity | Drupal entity | Platform DB table | Onboarding data owned by platform |
| IndustryAnalyzerService | Drupal service | Next.js API route | AI inference during onboarding |
| TrialManager | Drupal service | Next.js + Stripe | Subscription is platform concern |
| SubscriptionService | Drupal service | Next.js | Payment processing |
| User registration | Drupal auth | NextAuth | Platform owns identity |
| Node access / ACL | hook_node_access | N/A (multisite isolation) | DB-level isolation replaces ACL |

**What stays in Drupal:**

| Component | Purpose |
|-----------|---------|
| ComponentManifestService | SDC catalog for AI agents during provisioning |
| BrandTokenService | CSS custom property generation from brand data |
| ContentPopulationService | Creates Drupal entities from blueprint content |
| PageBuilderAgent | Builds Canvas layouts using AI agent tools |
| ContentGeneratorAgent | Generates text content for pages/entities |
| AutoLoginService | Validates one-time tokens from platform dashboard |
| Content type configs | Shared content type definitions installed per site |
| Canvas integration | Visual editing for site owners post-provisioning |
| Space theme | SDC components, design tokens |

### 3.3 Provisioning Engine

```
provisioning/                          # Standalone Node.js/Python tool
├── src/
│   ├── provision.js                   # Main entry point
│   ├── steps/
│   │   ├── 01-create-database.js      # CREATE DATABASE site_{id}
│   │   ├── 02-generate-settings.js    # Write sites/{domain}/settings.php
│   │   ├── 03-install-drupal.js       # drush site:install
│   │   ├── 04-import-config.js        # drush config:import (content types)
│   │   ├── 05-parse-blueprint.js      # Read markdown files, extract frontmatter
│   │   ├── 06-build-pages.js          # drush ai-site-builder:import-blueprint
│   │   ├── 07-apply-brand.js          # drush ai-site-builder:apply-brand
│   │   ├── 08-configure-site.js       # Menus, pathauto, metatags
│   │   ├── 09-update-routing.js       # Update sites.php + DNS/proxy
│   │   └── 10-callback.js             # Notify platform: site is live
│   ├── blueprint/
│   │   └── parser.js                  # Markdown + frontmatter parser
│   └── utils/
│       ├── drush.js                   # Drush command executor
│       └── database.js                # Database creation helper
├── package.json
└── Dockerfile                         # Can run as ECS task
```

### 3.4 Component Responsibilities

| Component | Responsibility | Key Interface |
|-----------|---------------|---------------|
| **Next.js Platform App** | User identity, onboarding wizard, dashboard, subscription management | REST API + Server Actions |
| **Provisioning Engine** | Orchestrates Drupal multisite creation from blueprint | CLI: `provision --blueprint ./path --domain site.example.com` |
| **Drupal ai_site_builder** | Blueprint import, Canvas page building, brand tokens, content generation | Drush commands: `ai-site-builder:import-blueprint`, `ai-site-builder:apply-brand` |
| **Drupal Canvas (contrib)** | Visual page editor, SDC component rendering | Canvas editing API, AI Agent tools |
| **Space (theme)** | SDC components, design tokens, layout system | Component library, CSS custom properties |

---

## 4. Data Architecture

### 4.1 Platform Database (Next.js / PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hash
  name        VARCHAR(255),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Sites table (1 user = 1 site for MVP)
CREATE TABLE sites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  domain          VARCHAR(255) UNIQUE,        -- e.g., "my-clinic.example.com"
  status          VARCHAR(50) DEFAULT 'onboarding',
                  -- onboarding | provisioning | live | suspended | expired
  industry        VARCHAR(100),               -- inferred from "big idea"
  drupal_site_dir VARCHAR(255),               -- e.g., "sites/my-clinic.example.com"
  provisioned_at  TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Onboarding sessions (stores wizard progress)
CREATE TABLE onboarding_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  site_id         UUID REFERENCES sites(id) ON DELETE CASCADE,
  current_step    INTEGER DEFAULT 0,
  completed_at    TIMESTAMP,
  data            JSONB NOT NULL DEFAULT '{}',
  -- data contains all onboarding inputs:
  -- {
  --   "project_name": "...",
  --   "big_idea": "...",
  --   "audience": "...",
  --   "suggested_pages": [...],
  --   "design_source": "ai" | "figma",
  --   "figma_url": "...",
  --   "logo_url": "...",
  --   "colors": { "primary": "#...", "secondary": "#...", ... },
  --   "fonts": { "heading": "...", "body": "..." },
  --   "industry_inferred": "healthcare",
  --   "compliance_flags": [...]
  -- }
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Blueprints (AI-generated output, consumed by provisioning)
CREATE TABLE blueprints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID REFERENCES sites(id) ON DELETE CASCADE,
  version         INTEGER DEFAULT 1,
  status          VARCHAR(50) DEFAULT 'generating',
                  -- generating | ready | provisioned | failed
  storage_path    VARCHAR(500),               -- S3 or local path to blueprint bundle
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  site_id         UUID REFERENCES sites(id) ON DELETE CASCADE,
  stripe_sub_id   VARCHAR(255),
  plan            VARCHAR(50) DEFAULT 'trial',  -- trial | basic | pro
  status          VARCHAR(50) DEFAULT 'trial',  -- trial | active | past_due | cancelled | expired
  trial_ends_at   TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Drupal Per-Site Database

Each Drupal multisite has its own database containing:
- Standard Drupal tables (node, users, config, cache, etc.)
- Content type field tables (field_data_*, field_revision_*)
- One admin user (mapped from platform user via auto-login)
- Generated content nodes (pages, services, team members, etc.)
- Webform submissions
- Canvas layout data
- Brand token settings

**No `field_site_profile` needed** — each site IS the profile. No entity-level ACL needed — database isolation handles it.

### 4.3 Blueprint Format (Contract Between Platform and Provisioning)

The blueprint is a directory of markdown files + assets produced by the Next.js app's AI pipeline and consumed by the provisioning engine.

```
blueprint-{site_id}/
├── site.md                            # Site metadata
├── pages/
│   ├── home.md                        # Each page with component layout
│   ├── about.md
│   ├── services.md
│   ├── contact.md
│   └── [industry-specific].md
├── content/
│   ├── services.md                    # Structured content items
│   ├── team-members.md
│   └── testimonials.md
├── brand/
│   ├── tokens.json                    # Colors, fonts
│   ├── logo.png                       # Uploaded logo
│   └── fonts/                         # Custom font files (if uploaded)
└── forms/
    └── contact.md                     # Form field definitions
```

#### `site.md` — Site Metadata

```markdown
---
name: "Bright Smile Dental"
tagline: "Your family's smile, our passion"
industry: healthcare
audience: "Families with children seeking preventive dental care in the Portland metro area"
domain: bright-smile-dental
compliance:
  - hipaa
  - ada
pages:
  - home
  - about
  - services
  - team
  - contact
content_types:
  - service
  - team_member
  - testimonial
  - location
---
```

#### `pages/home.md` — Page Layout with Components

```markdown
---
title: Home
path: /
meta_title: "Bright Smile Dental | Family Dentistry in Portland"
meta_description: "Gentle, comprehensive dental care for the whole family. Book your appointment today."
---

## section: hero
component: space:hero
props:
  heading: "Your Family Deserves the Brightest Smiles"
  subheading: "Gentle, comprehensive dental care for patients of all ages in Portland."
  cta_text: "Book an Appointment"
  cta_url: /contact
  background_image: placeholder:dental-hero

## section: services_grid
component: space:card-grid
props:
  heading: "Our Services"
  columns: 3
  source: content_type:service

## section: testimonials
component: space:testimonial-slider
props:
  heading: "What Our Patients Say"
  source: content_type:testimonial

## section: cta
component: space:cta-banner
props:
  heading: "Ready for a Healthier Smile?"
  body: "Schedule your first visit today. New patients welcome."
  cta_text: "Contact Us"
  cta_url: /contact

## section: compliance
component: space:disclaimer
props:
  text: "This website is for informational purposes only and does not constitute medical advice."
```

#### `content/services.md` — Structured Content

```markdown
---
content_type: service
---

### General Dentistry
Comprehensive oral exams, cleanings, and preventive care for the whole family.

### Cosmetic Dentistry
Teeth whitening, veneers, and smile makeovers to help you look your best.

### Pediatric Dentistry
Gentle, kid-friendly dental care in a fun, welcoming environment.

### Emergency Care
Same-day appointments available for dental emergencies. Call us anytime.
```

#### `brand/tokens.json` — Brand Configuration

```json
{
  "colors": {
    "primary": "#2563eb",
    "secondary": "#1e40af",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "text": "#1a1a2e"
  },
  "fonts": {
    "heading": "Nunito Sans",
    "body": "Open Sans"
  },
  "logo": "brand/logo.png",
  "custom_fonts": []
}
```

### 4.4 Data Flow: End-to-End

```
User (Browser)          Next.js Platform              AI (OpenAI/Claude)
──────────────          ────────────────              ─────────────────
Register ──────────────► Create user
                         Create site record
                         Create subscription (trial)

Screen 1: Name ────────► Save to onboarding_sessions.data.project_name
Screen 2: Idea ────────► Save to data.big_idea ──────► Infer industry
                         ◄─────────────────────────── Return: industry, keywords
Screen 3: Audience ────► Save to data.audience ──────► Suggest pages
                         ◄─────────────────────────── Return: page list
Screen 4: Pages ───────► Save to data.suggested_pages (user can edit)
Screen 5: Design ──────► Save to data.design_source ("ai")
Screen 6: Brand ───────► Upload logo ────────────────► Extract colors (vision API)
                         ◄─────────────────────────── Return: color palette
                         Save to data.colors
Screen 7: Fonts ───────► Save to data.fonts
                         ◄── "Visualize my site"

                         Generate blueprint ──────────► AI generates page content,
                         (pages, content,                component layouts,
                          forms, brand)                  form definitions
                         ◄─────────────────────────── Blueprint files written

                         Save blueprint to storage
                         Trigger provisioning
                                │
                                ▼
                         Provisioning Engine
                         ├── Create DB
                         ├── drush site:install
                         ├── Import config + content
                         ├── Build Canvas layouts
                         ├── Apply brand tokens
                         ├── Configure menus/SEO
                         └── Callback: site live
                                │
                         Update site.status = "live"
                         ◄──────┘

Dashboard ◄────────────── Site card shows "Live"
"Edit Site" ─────────────► Generate one-time token
                           Redirect to Drupal auto-login
                                    │
                                    ▼
                           Drupal Site (Canvas editor)
```

---

## 5. Integration Architecture

### 5.1 Next.js ↔ AI Integration

The Next.js app makes AI calls during onboarding for three purposes:

| AI Call | Trigger | Input | Output |
|---------|---------|-------|--------|
| **Industry inference** | After "What's the big idea?" | Free-text description | Inferred industry, keywords, compliance flags |
| **Page suggestion** | After "Who is this for?" | Idea + audience + industry | Suggested page list (user can edit) |
| **Color extraction** | After logo/palette upload | Image file | Extracted hex colors |
| **Blueprint generation** | After "Visualize my site" | All onboarding data | Full blueprint (pages, content, forms) |

Industry inference and page suggestion are lightweight calls (single prompt → structured response). Blueprint generation is the heavy call — it produces all page content, component layouts, and form definitions.

### 5.2 Provisioning Engine ↔ Drupal Integration

The provisioning engine calls Drupal via Drush commands:

```bash
# Step 1: Install Drupal with base config
drush site:install --db-url=mysql://user:pass@host/site_123 \
  --site-name="Bright Smile Dental" \
  --account-name=admin \
  --account-mail=owner@example.com \
  --sites-subdir=bright-smile-dental.example.com

# Step 2: Enable required modules
drush en ai_site_builder ai_site_builder_content canvas webform metatag pathauto

# Step 3: Import content types for this industry
drush ai-site-builder:import-config --industry=healthcare

# Step 4: Import blueprint content and build pages
drush ai-site-builder:import-blueprint --path=/path/to/blueprint-{site_id}/

# Step 5: Apply brand tokens
drush ai-site-builder:apply-brand --tokens=/path/to/blueprint-{site_id}/brand/tokens.json

# Step 6: Configure menus and pathauto
drush ai-site-builder:configure-site
```

### 5.3 Next.js ↔ Drupal Auth Handoff

When a user clicks "Edit my site" from the dashboard:

```
Next.js Dashboard                              Drupal Site
      │                                             │
      │  1. POST /api/auth/create-login-token       │
      │     { site_id, user_email }                  │
      │     → Generate token (UUID, 60s TTL,         │
      │       single-use, stored in Platform DB)     │
      │                                              │
      │  2. Redirect browser to:                     │
      │     https://site.example.com/auto-login      │
      │     ?token=abc123&redirect=/canvas            │
      │─────────────────────────────────────────────►│
      │                                              │
      │                        3. AutoLoginController │
      │                           validates token     │
      │                           (calls Platform API │
      │                            or checks shared   │
      │                            secret + JWT)      │
      │                                              │
      │                        4. Creates/loads Drupal│
      │                           user session        │
      │                                              │
      │                        5. Redirect to Canvas  │
      │                           editor (/canvas)    │
```

**Token validation options (MVP: Option A):**

- **A) Shared secret + JWT:** Next.js signs a JWT with a shared secret. Drupal validates the signature. No network call needed. Simple, stateless.
- **B) Platform API callback:** Drupal calls `POST /api/auth/validate-token` on the Next.js app. More secure (token is single-use), but adds a network dependency.

### 5.4 Canvas + Space Theme Integration

Unchanged from v1 — Canvas and Space work the same way on each multisite instance:

- Canvas exposes AI Agent tools for page building
- Space SDC components are the whitelist of available components
- ComponentManifestService generates the catalog from Space's `*.component.yml` files
- BrandTokenService generates per-site CSS custom property overrides

The key difference: these tools are invoked during **provisioning** (via Drush commands), not during a live user session.

### 5.5 Design Token Integration

```
Blueprint brand/tokens.json
         │
         ▼
BrandTokenService (Drupal)
├── Maps colors → CSS custom property overrides
├── Maps fonts → font-family declarations + Google Fonts import
├── Generates: sites/{domain}/files/css/brand-tokens.css
│
▼
Space Theme
├── Reads CSS custom properties for all visual rendering
└── All SDC components inherit brand via token cascade
```

Generated CSS per site:

```css
/* sites/{domain}/files/css/brand-tokens.css */
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');

:root {
  --space-color-primary: #2563eb;
  --space-color-secondary: #1e40af;
  --space-color-accent: #f59e0b;
  --space-font-heading: 'Nunito Sans', sans-serif;
  --space-font-body: 'Open Sans', sans-serif;
}
```

---

## 6. AI Architecture

### 6.1 AI Split: Onboarding vs. Provisioning

AI work is split across two stages:

| Stage | Runs In | AI Tasks | Complexity |
|-------|---------|----------|------------|
| **Onboarding** | Next.js | Industry inference, page suggestion, color extraction | Lightweight (single prompt → structured response) |
| **Provisioning** | Drupal (via Drush) | Content generation, Canvas layout building | Heavy (needs SDC component knowledge, Canvas tools, Drupal entity awareness) |

**Why this split:** Content generation needs intimate knowledge of Space SDC component props, Canvas layout structures, and Drupal content type schemas. That knowledge lives in Drupal, not in a generic Next.js app. The onboarding AI just needs to understand the user's intent — it doesn't need Drupal knowledge.

### 6.2 Onboarding AI (Next.js)

#### Industry Inference

```
Input: "We're a family dental practice in Portland. We offer general dentistry,
        cosmetic procedures, and pediatric care."

Prompt: Analyze this business description. Return:
        - industry (from: healthcare, legal, real_estate, restaurant, professional_services, other)
        - keywords (5-10 relevant terms)
        - compliance_flags (e.g., hipaa, ada, fair_housing)
        - tone (professional_warm, corporate, casual, etc.)

Output: {
  "industry": "healthcare",
  "keywords": ["family dentistry", "pediatric dental", "cosmetic dentistry", "Portland dentist"],
  "compliance_flags": ["hipaa"],
  "tone": "professional_warm"
}
```

#### Page Suggestion

```
Input: industry=healthcare, idea="family dental practice", audience="families with children"

Output: [
  { "slug": "home", "title": "Home", "required": true },
  { "slug": "about", "title": "About Us", "required": true },
  { "slug": "services", "title": "Our Services", "required": true },
  { "slug": "team", "title": "Meet Our Team", "required": false },
  { "slug": "contact", "title": "Contact Us", "required": true },
  { "slug": "faq", "title": "FAQ", "required": false }
]
```

User can add/remove pages on Screen 4 before proceeding.

#### Color Extraction

```
Input: Uploaded logo image (PNG/JPG/SVG) or color palette reference file

Method: OpenAI Vision API or a dedicated color extraction library (e.g., node-vibrant)

Output: {
  "primary": "#00F1C6",
  "secondary": "#324E81",
  "accent": "#1A1A2E",
  "confidence": 0.85
}
```

User can adjust extracted colors before proceeding.

### 6.3 Provisioning AI (Drupal)

During provisioning, the AI agents run within Drupal's runtime via Drush commands. They have access to:

- **ComponentManifestService** — knows what Space SDC components exist and their props
- **Canvas tools** — can create pages, add sections, place components
- **Entity API** — can create nodes, taxonomy terms, webforms
- **Blueprint data** — knows what pages/content to create from the blueprint

#### Content Generation Pipeline

```
Blueprint (from Next.js)
    │
    ├── pages/home.md (component layout with placeholder content)
    ├── content/services.md (service list)
    └── brand/tokens.json
    │
    ▼
ContentGeneratorAgent (Drupal)
    │
    ├── Reads blueprint pages → creates nodes with Canvas layouts
    ├── Reads content items → creates entity instances
    ├── Fills component props with generated/blueprint content
    ├── Sets meta titles and descriptions
    └── Creates webforms from form definitions
    │
    ▼
BrandTokenService (Drupal)
    │
    └── Generates CSS from tokens.json → applies to theme
```

### 6.4 Error Handling

| Failure Point | Recovery Strategy |
|--------------|-------------------|
| AI call fails during onboarding | Retry with exponential backoff; show user-friendly error with manual input fallback |
| Blueprint generation fails | Retry; if persistent, queue for manual review |
| Provisioning step fails | Rollback: drop database, remove settings.php. Update site.status = "failed". Notify user. |
| Color extraction returns low confidence | Present extracted colors with "adjust these?" UI |
| AI suggests invalid component | ComponentManifestService rejects; re-prompt agent with manifest reminder |

---

## 7. API Design

### 7.1 Next.js API Routes (Internal)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/create-login-token` | POST | Generate one-time Drupal login token |
| `/api/onboarding/save` | POST | Save onboarding step data |
| `/api/onboarding/resume` | GET | Load saved onboarding progress |
| `/api/ai/analyze` | POST | Industry inference from description |
| `/api/ai/suggest-pages` | POST | AI-suggested page structure |
| `/api/ai/extract-colors` | POST | Color extraction from uploaded image |
| `/api/provision/trigger` | POST | Start site provisioning |
| `/api/provision/status/{site_id}` | GET | Poll provisioning progress |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/sites/{site_id}` | GET | Site details for dashboard |

### 7.2 Drupal Drush Commands (Provisioning Interface)

| Command | Purpose |
|---------|---------|
| `ai-site-builder:import-config` | Install content types for given industry |
| `ai-site-builder:import-blueprint` | Parse blueprint, create pages + content + forms |
| `ai-site-builder:apply-brand` | Generate and apply CSS custom properties |
| `ai-site-builder:configure-site` | Set up menus, pathauto patterns, metatag defaults |
| `ai-site-builder:create-login-token` | Generate one-time login token for a user |

### 7.3 Drupal Routes (Per-Site)

| Route | Method | Purpose |
|-------|--------|---------|
| `/auto-login` | GET | One-time token login from dashboard |
| `/canvas/*` | GET | Canvas visual editor (post-login) |

---

## 8. Security Architecture

### 8.1 Authentication & Authorization

| Layer | Mechanism |
|-------|-----------|
| **Platform auth** | NextAuth (email/password). Session-based or JWT. |
| **Drupal site auth** | One-time login token from platform. Drupal creates/loads local user. |
| **Auth handoff** | JWT signed with shared secret (RS256). Token contains: user_email, site_domain, exp (60s). |
| **Drupal site owner** | Single admin-level user per Drupal site. Full Canvas editing access. |
| **Platform admin** | Separate admin role in Next.js. Can view all sites, manage subscriptions. |

### 8.2 Data Protection

| Concern | Approach |
|---------|----------|
| **Site isolation** | Database-level isolation (Drupal multisite). No cross-site data access possible. |
| **LLM data isolation** | Each AI call includes only the requesting user's data. No shared context. |
| **API key security** | LLM keys stored as environment variables. Never exposed to frontend. |
| **Blueprint security** | Blueprints stored with site-specific paths. Access controlled by platform auth. |
| **File upload security** | File validation (type, size, MIME). Uploads processed server-side. |
| **HTTPS** | Enforced on both Next.js app and all Drupal sites. HSTS headers. |
| **CSRF** | Next.js: built-in CSRF. Drupal: built-in CSRF token on forms. |

### 8.3 Rate Limiting

| Endpoint | Limit | Rationale |
|----------|-------|-----------|
| Registration | 5 per IP per hour | Abuse prevention |
| AI calls (onboarding) | 20 per user per session | LLM cost control |
| Provisioning trigger | 1 per user (1 site = 1 license) | Business rule |
| Auto-login token | 10 per user per hour | Prevent token enumeration |
| Stripe webhook | Unlimited (verified by signature) | Stripe controls rate |

---

## 9. Infrastructure

### 9.1 Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        ECS / Docker Host                      │
│                                                               │
│  ┌────────────────────┐  ┌──────────────────────────────────┐ │
│  │  Next.js Container  │  │  Drupal Container                │ │
│  │                     │  │  (Nginx + PHP-FPM)               │ │
│  │  Platform App       │  │                                   │ │
│  │  Port 3000          │  │  Shared codebase                  │ │
│  │                     │  │  ├── sites/default/               │ │
│  └─────────┬───────────┘  │  ├── sites/site-a.example.com/   │ │
│            │              │  ├── sites/site-b.example.com/   │ │
│            │              │  └── sites/sites.php              │ │
│            │              │                                   │ │
│            │              │  Port 8080                        │ │
│            │              └──────────┬───────────────────────┘ │
│            │                         │                         │
│  ┌─────────┴─────────────────────────┴──────────────────────┐ │
│  │              Reverse Proxy (Nginx / Traefik)              │ │
│  │                                                           │ │
│  │  app.example.com ──────► Next.js :3000                    │ │
│  │  site-a.example.com ──► Drupal :8080                     │ │
│  │  site-b.example.com ──► Drupal :8080                     │ │
│  │  *.example.com ────────► Drupal :8080                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │  PostgreSQL         │  │  MySQL/MariaDB      │               │
│  │  (Platform DB)      │  │  (Drupal site DBs)  │               │
│  │                     │  │  ├── site_001        │               │
│  │  users, sites,      │  │  ├── site_002        │               │
│  │  onboarding,        │  │  └── site_003        │               │
│  │  subscriptions      │  │                      │               │
│  └────────────────────┘  └────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Scaling Considerations

| Bottleneck | MVP Approach | Future Scaling |
|-----------|-------------|----------------|
| **Next.js app** | Single container | Horizontal scaling (stateless) |
| **Drupal multisite** | Single container, multiple sites | Shard across multiple Drupal containers (sites.php routing) |
| **AI generation** | Synchronous during provisioning | Queue-based with dedicated worker containers |
| **Platform DB** | Single PostgreSQL instance | Managed RDS with read replicas |
| **Drupal DBs** | Single MySQL instance, multiple databases | Managed RDS, or separate instances per shard |
| **File storage** | Local filesystem | S3-compatible object storage |
| **DNS/routing** | Wildcard DNS + Nginx | CloudFront/Cloudflare for CDN + SSL |

### 9.3 Caching Strategy

| Layer | What | TTL |
|-------|------|-----|
| **CDN** | Published Drupal site pages | Until content changes (purge on edit) |
| **Drupal page cache** | Anonymous page views | Until content/config changes |
| **Drupal render cache** | SDC component render arrays | Until entity changes |
| **Next.js** | Dashboard data | Short (30s) or revalidate on mutation |
| **Component manifest** | SDC catalog | Until theme update (long-lived) |
| **AI responses** | Do NOT cache — each generation is unique | N/A |

---

## 10. Architecture Decision Records (ADRs)

### ADR-001: Split Platform Architecture (v2)

**Context:** The v1 architecture was a Drupal monolith handling onboarding, AI generation, editing, and publishing. Figma designs revealed the onboarding journey needs a conversational, one-question-per-screen UX. Additionally, the platform needs dashboard, subscription management, and user identity — standard SaaS features.

**Options:**
1. **Drupal monolith (v1)** — Everything in Drupal
2. **Next.js platform + Drupal multisite** — Split by concern
3. **Next.js platform + Container-per-site Drupal** — Maximum isolation

**Decision:** Option 2 — Next.js Platform + Drupal Multisite

**Rationale:**
- Onboarding UX requires modern frontend (React), not Drupal Form API
- Dashboard/subscription are standard SaaS — Next.js is right-sized
- Drupal multisite provides real isolation without container orchestration
- Single Drupal codebase reduces maintenance
- Blueprint as contract creates a clean boundary

**Consequences:**
- Two applications to deploy and maintain
- Auth handoff between Next.js and Drupal needed
- Existing Sprint 01-03 Drupal code (onboarding wizard, SiteProfile entity, trial service) is superseded
- The Drupal codebase becomes simpler (no onboarding, no ACL complexity)

---

### ADR-002: Blueprint as Markdown (Not JSON)

**Context:** Need a format for the AI-generated site specification that the provisioning engine consumes.

**Options:**
1. **JSON schema** — Structured, validatable, but verbose and hard for LLMs to produce consistently
2. **Markdown with YAML frontmatter** — Human-readable, LLM-native, version-controllable
3. **Database records** — Store in platform DB, pass IDs to provisioning engine

**Decision:** Option 2 — Markdown with YAML frontmatter

**Rationale:**
- LLMs produce markdown naturally and reliably
- Human-readable: developers can inspect and debug blueprints
- YAML frontmatter provides structured metadata (component types, props) while markdown body holds content
- Version-controllable (git-diffable)
- Easy to validate: parse frontmatter, check required fields

**Consequences:**
- Need a blueprint parser in the provisioning engine
- Blueprint schema must be documented and versioned
- AI prompts must specify the exact markdown format

---

### ADR-003: Drupal Multisite (Not Container-Per-Site)

**Context:** Need to provision isolated Drupal instances for each user's generated site.

**Options:**
1. **Drupal multisite** — Single codebase, per-site database and files
2. **Docker container per site** — Full isolation, own codebase per site
3. **Kubernetes pods** — Container-per-site with orchestration

**Decision:** Option 1 — Drupal Multisite

**Rationale:**
- All sites use the same modules and Space theme — no per-site code customization needed
- Single codebase means one update applies everywhere
- Provisioning is fast (~30s vs. 2-5min for container spin-up)
- No Kubernetes/ECS orchestration needed — fits developer's infrastructure experience
- Database-level isolation is sufficient security for MVP
- Scales to hundreds of sites on one server

**Trade-offs:**
- (+) Simple ops, fast provisioning, shared updates
- (-) Shared PHP process (noisy neighbor risk at scale)
- (-) Can't add per-site modules
- (-) Scaling ceiling (hundreds, not thousands of sites)

**Migration path:** If scaling demands it, move to container-per-site. The blueprint + provisioning engine architecture makes this straightforward — just change the provisioning steps.

---

### ADR-004: One-Time Generation (No Re-Generation)

**Context:** After the site is provisioned, does the user return to the onboarding wizard to regenerate?

**Decision:** No. Generation is a one-time flow. Post-provisioning edits happen directly on the Drupal site via Canvas.

**Rationale:**
- Re-generation would destroy user's manual edits
- Canvas provides sufficient editing capability for iterative changes
- Simplifies the platform: onboarding is fire-and-forget
- Blueprint is an artifact, not a living document

**Consequences:**
- No blueprint versioning needed (MVP)
- Dashboard shows site status but no "regenerate" option
- Section-level AI regeneration (US-021) still available within Canvas editor

---

### ADR-005: Auth Handoff via JWT (Not OAuth)

**Context:** When user clicks "Edit Site" in the Next.js dashboard, they need to be authenticated on their Drupal site.

**Options:**
1. **One-time JWT** — Next.js signs a short-lived JWT, Drupal validates with shared secret
2. **OAuth/OIDC** — Next.js as OAuth provider, Drupal as client
3. **Shared session store** — Redis-backed sessions shared between apps

**Decision:** Option 1 — One-time JWT (MVP)

**Rationale:**
- Simplest to implement — no OAuth server setup
- Stateless — Drupal validates JWT signature, no callback to Next.js needed
- Short-lived (60s) + single-use mitigates token theft
- Sufficient for 1-license-1-site model where cross-site auth isn't needed

**Migration path:** If the platform grows to need SSO across multiple services, migrate to OAuth/OIDC.

---

### ADR-006: Color Auto-Extraction (MVP)

**Context:** Figma designs show colors being auto-extracted from uploaded logo/palette.

**Options:**
1. **AI Vision API** — Send image to OpenAI Vision, ask for dominant colors
2. **Server-side library** — node-vibrant, color-thief, or sharp for color extraction
3. **Client-side library** — Extract in browser before upload

**Decision:** Option 1 for palette references (PDF/complex images), Option 2 for logos (simpler, faster)

**Rationale:**
- Logo color extraction is a well-solved problem — node-vibrant handles it without AI cost
- Color palette PDFs/complex brand files benefit from AI vision understanding
- Hybrid approach minimizes AI API costs while handling all input types

---

### ADR-007: Sequential AI Pipeline (Retained from v1)

**Context:** Same as v1 ADR-002. Content generation has linear dependencies.

**Decision:** Sequential pipeline — retained from v1.

**Rationale unchanged:** Industry analysis → page structure → content → forms → branding. Each step needs the previous step's output. No parallelism opportunity.

**Note:** The pipeline now runs during provisioning (Drush commands) rather than in Drupal Queue workers.

---

### ADR-008: Shared Content Types (Retained from v1)

**Context:** Same as v1 ADR-006. Content types are predefined and selected per industry.

**Decision:** Shared predefined catalog — retained from v1.

**Note:** With multisite, unused content types per industry can be excluded during provisioning. The `drush ai-site-builder:import-config --industry=healthcare` command only installs content types relevant to that industry. Cleaner than v1 where all types existed globally.

---

## Appendix: Technology Decisions Summary

| Decision | Choice | Alternatives Considered |
|----------|--------|------------------------|
| Architecture style | Next.js platform + Drupal multisite | Drupal monolith (v1), Container-per-site |
| Onboarding UI | Next.js (React) | Drupal Form API (v1) |
| Site runtime | Drupal multisite | Single-instance multi-tenant (v1), Container-per-site |
| Blueprint format | Markdown + YAML frontmatter | JSON schema, Database records |
| AI split | Lightweight in Next.js, heavy in Drupal | All in Next.js, All in Drupal |
| Auth handoff | One-time JWT | OAuth/OIDC, Shared sessions |
| Provisioning | Node.js script + Drush CLI | Drupal Queue (v1), Kubernetes operator |
| Color extraction | node-vibrant (logos) + AI Vision (complex) | Client-side, AI-only |
| Brand customization | CSS custom property overrides | Sub-themes, Theme settings |
| Content types | Shared catalog, per-industry selection | Dynamic per-site, Flexible single type |
| Generation model | One-time (no re-generation) | Re-generatable from dashboard |
| Payment | Stripe via Next.js | Drupal Commerce |
| User identity | NextAuth in Next.js | Drupal auth |
| Caching | Drupal page cache + CDN | Varnish, CDN-only |

---

*Next step: Invoke `/drupal-architect` to update the Drupal technical design for the simplified site-runtime role, define Drush commands, and update the content model. Then invoke `/tpm` to re-plan sprints around the new architecture.*
