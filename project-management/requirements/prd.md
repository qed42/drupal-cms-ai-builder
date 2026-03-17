# Product Requirements Document (PRD)
## AI-Powered Drupal Website Builder

**Version:** 1.0 (MVP)
**Date:** 2026-03-17
**Status:** Draft

---

## 1. Executive Summary

An AI-first website generation platform built on Drupal CMS that enables small to mid-sized businesses to launch professional, extensible websites in under 30 minutes. Users complete a guided 5-minute onboarding questionnaire, after which AI agents — powered by OpenAI and Claude models — automatically generate industry-aware pages, structured content, SEO copy, and branded layouts using the Space design system's SDC components. The result is a fully functional Drupal site that users can edit via Drupal Canvas and extend through the Drupal contrib ecosystem — combining the ease of Wix AI with enterprise-grade CMS power.

---

## 2. Problem Statement

**Who:** Small to mid-sized business owners (founders, marketing managers) who need a professional web presence but lack technical expertise or budget for custom development.

**Problem:** Current solutions force a tradeoff:
- **DIY builders** (Wix, Squarespace) are easy but produce cookie-cutter sites with no extensibility, poor content structure, and vendor lock-in
- **CMS platforms** (Drupal, WordPress) are powerful but require technical expertise, significant setup time, and developer involvement
- **AI website generators** produce generic output without industry awareness, structured content models, or real CMS capabilities

**Impact:** Businesses either overpay for custom development, settle for limited platforms they'll outgrow, or delay their web presence entirely.

**Solution:** An AI-driven platform that automates the complex parts of Drupal site building (content architecture, page layout, content generation, branding) while preserving the full power of Drupal for future extensibility.

---

## 3. User Personas

### 3.1 Primary: Sarah — Small Business Founder

| Attribute | Detail |
|-----------|--------|
| **Role** | Founder / Owner of a healthcare clinic |
| **Tech Skill** | Low — can use email, social media, basic web tools |
| **Goal** | Launch a professional website to attract patients and enable appointment bookings |
| **Pain Points** | Quoted $5K–$15K for custom site; tried Wix but felt generic; needs HIPAA-aware content |
| **Success Criteria** | Site live within a day; looks professional; captures leads; easy to update |

### 3.2 Primary: Marcus — Marketing Manager

| Attribute | Detail |
|-----------|--------|
| **Role** | Marketing Manager at a real estate firm |
| **Tech Skill** | Medium — comfortable with CMS basics, not a developer |
| **Goal** | Rapidly launch a listings-ready site with lead capture and CRM pipeline |
| **Pain Points** | Current site is slow, hard to update, and doesn't convert; agency quotes take weeks |
| **Success Criteria** | SEO-optimized content; integrated forms; ability to add features without re-platforming |

### 3.3 Future (Post-MVP): Alex — Agency Developer

| Attribute | Detail |
|-----------|--------|
| **Role** | Web developer at a digital agency |
| **Tech Skill** | High — Drupal expertise |
| **Goal** | Rapid client site prototyping with the ability to customize deeply |
| **Pain Points** | Building from scratch every time; clients want quick previews |
| **Success Criteria** | Generate a solid starting point in minutes; full developer access to customize |

---

## 4. Functional Requirements

### 4.1 Onboarding Wizard

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-101 | Site basics input | Must | Collect site name, tagline, logo upload, admin email |
| FR-102 | Industry selection | Must | Predefined industry categories (Healthcare, Legal, Real Estate, Restaurant, Professional Services, Other) with free-text fallback |
| FR-103 | Brand input | Must | Color palette picker, font selection, reference website URLs, brand guidelines file upload |
| FR-104 | Business context | Must | Services offered, target audience description, competitors, key CTAs |
| FR-105 | Dynamic industry questions | Must | AI Agent generates follow-up questions based on selected industry (e.g., "Do you offer appointments?" for healthcare) |
| FR-106 | Compliance inference | Should | AI Agent identifies compliance requirements (HIPAA, ADA, GDPR) based on industry + use-case and asks relevant questions |
| FR-107 | Onboarding progress indicator | Must | Visual step indicator showing completion progress |
| FR-108 | Save & resume onboarding | Should | Allow users to save progress and return later within the trial period |

### 4.2 AI Website Generation

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-201 | Page generation | Must | Auto-generate core pages: Home, About, Services, Contact (minimum); additional pages based on industry |
| FR-202 | Content type creation | Must | AI creates structured Drupal content types based on business context (e.g., Service, Team Member, Testimonial, Location) |
| FR-203 | SEO content generation | Must | Generate page content optimized for SEO with proper headings, meta descriptions, and structured data |
| FR-204 | CTA generation | Must | AI suggests and places contextually appropriate calls-to-action |
| FR-205 | Component selection | Must | AI selects components exclusively from the Space design system's SDC library — no custom/new components created |
| FR-206 | Brand token application | Must | Apply user's color palette, fonts, and branding to design tokens across the generated site |
| FR-207 | Layout composition | Must | AI assembles page layouts using SDC components following design system layout rules |
| FR-208 | Generation progress UI | Should | Real-time progress indicator during site generation showing current step (e.g., "Creating content types...", "Generating pages...") |
| FR-209 | Industry-specific content | Must | Content reflects industry context — terminology, tone, compliance disclaimers where applicable |
| FR-210 | Structured content population | Must | Auto-populate content types with realistic placeholder content (e.g., sample services, team bios) |

### 4.3 Review & Editing

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-301 | Canvas page editor | Must | Full page editing via Drupal Canvas — drag/drop SDC components, inline text editing |
| FR-302 | Section-level regeneration | Must | User can select any section/component and request AI to regenerate it with optional guidance |
| FR-303 | Content inline editing | Must | Direct text editing on the page without leaving the visual editor |
| FR-304 | Component swap | Should | Replace one SDC component with another compatible component from the design system |
| FR-305 | Page add/remove | Must | Add new pages or remove generated pages |
| FR-306 | Media management | Should | Upload and manage images; AI suggests stock images where appropriate |
| FR-307 | Undo/redo | Should | Revision-based undo/redo for editing changes |

### 4.4 Lead Capture & Forms

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-401 | Contact forms | Must | Auto-generated contact forms on relevant pages |
| FR-402 | Smart form fields | Should | AI suggests form fields based on industry and page context |
| FR-403 | Form submission storage | Must | All form submissions stored in Drupal (Webform or custom entity) |
| FR-404 | Email notifications | Must | Email notification to site owner on form submission |
| FR-405 | Basic submission dashboard | Should | Simple view of form submissions within Drupal admin |

### 4.5 Publishing & Deployment

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-501 | One-click publish | Must | Single action to publish the site from draft to live |
| FR-502 | Draft mode default | Must | All generated content starts in draft/preview mode |
| FR-503 | Custom domain support | Should | Connect a vanity domain to the published site |
| FR-504 | SSL provisioning | Must | Automatic SSL certificate for published sites |

### 4.6 User Account & Trial

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FR-601 | User registration | Must | Email-based registration to start the onboarding |
| FR-602 | Free trial | Must | 14-day free trial with full feature access |
| FR-603 | Trial expiry handling | Must | Clear communication before expiry; site preserved but taken offline after trial ends |
| FR-604 | Subscription activation | Must | Convert trial to paid subscription to keep site live |
| FR-605 | Subscription model | Must | 1 license = 1 site; subscription-based pricing |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | Onboarding wizard loads in < 2 seconds | Must |
| NFR-02 | AI site generation completes in < 5 minutes | Must |
| NFR-03 | Generated sites score 90+ on Core Web Vitals (LCP, CLS, INP) | Must |
| NFR-04 | Canvas editor loads in < 3 seconds | Should |

### 5.2 Security

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-05 | All data transmitted over HTTPS | Must |
| NFR-06 | User data isolated between sites (multi-tenant) | Must |
| NFR-07 | LLM prompts must not leak user data across tenants | Must |
| NFR-08 | File uploads scanned for malware | Should |
| NFR-09 | Rate limiting on AI generation endpoints | Must |

### 5.3 Scalability

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-10 | Support 100 concurrent site generations in MVP | Should |
| NFR-11 | Architecture supports horizontal scaling of generation workers | Must |

### 5.4 Accessibility

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-12 | Generated sites meet WCAG 2.1 AA standards | Must |
| NFR-13 | Onboarding wizard is keyboard-navigable | Should |
| NFR-14 | AI-generated content includes proper heading hierarchy and alt text placeholders | Must |

### 5.5 Reliability

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-15 | AI generation failures offer retry with graceful error messages | Must |
| NFR-16 | Generated site data is backed up before any regeneration | Should |

---

## 6. User Journeys

### 6.1 Journey: First-Time Site Creation (Happy Path)

**Actor:** Sarah (Small Business Founder)

1. Sarah visits the platform landing page and clicks "Build My Website"
2. She registers with her email and creates a password
3. **Step 1 — Basics:** Enters business name ("Sunrise Health Clinic"), tagline ("Caring for your family's health"), uploads her logo, enters admin email
4. **Step 2 — Industry:** Selects "Healthcare" from the industry list
5. **Step 3 — Branding:** Picks a calming blue/green palette, selects a clean sans-serif font, pastes a competitor's URL as reference
6. **Step 4 — Business Context:** Lists services (General Practice, Pediatrics, Urgent Care), describes target audience ("families in suburban areas"), enters key CTA ("Book an Appointment")
7. **Step 5 — Industry Questions:** AI asks: "Do you offer online appointment booking?", "How many locations do you have?", "Do you need HIPAA-compliant forms?" — Sarah answers each
8. Sarah clicks **"Generate My Website"**
9. A progress screen shows: "Analyzing your industry... Creating content structure... Generating pages... Applying your brand..."
10. Within ~3 minutes, Sarah sees a fully rendered preview of her website with Home, About, Services, Doctors, Contact pages
11. She enters the Canvas editor, tweaks the hero headline, replaces a stock photo, and regenerates the "Services" section with more detail
12. Satisfied, she clicks **"Publish"** — her site goes live on a platform subdomain
13. She receives an email confirming her site is live with a link to connect a custom domain

### 6.2 Journey: Editing After Generation

**Actor:** Marcus (Marketing Manager)

1. Marcus logs in and opens his generated real estate site in Canvas
2. He wants to add a "Featured Listings" section to the homepage
3. He clicks "Add Section" — Canvas shows available SDC components
4. He selects a card grid component, and the AI pre-fills it with sample listing data
5. He edits the listing content inline and rearranges the section order via drag-and-drop
6. He navigates to the Contact page and regenerates the form — AI adds "Property Interest" and "Budget Range" fields
7. He publishes the changes

### 6.3 Journey: Trial Expiry

1. Sarah receives an email on day 10: "Your trial expires in 4 days"
2. On day 13, she receives a final reminder with a link to subscribe
3. On day 15 (expired), her site goes offline but data is preserved
4. She subscribes on day 20 — her site comes back online immediately with all content intact

---

## 7. Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| **Time to first publish** | < 30 minutes from registration | Platform analytics |
| **Onboarding completion rate** | > 70% of registered users complete onboarding | Funnel analytics |
| **AI generation acceptance rate** | > 60% of generated content kept without major edits | Edit tracking (generated vs. modified) |
| **Edit vs. regenerate ratio** | < 3 regenerations per page on average | Platform analytics |
| **Trial to paid conversion** | > 15% | Subscription analytics |
| **Sites launched (first 6 months)** | 500+ live sites | Platform metrics |
| **Core Web Vitals compliance** | 90%+ of generated sites pass CWV | Lighthouse CI |
| **Form submission rate** | > 2% visitor-to-lead on generated sites | Form analytics |

---

## 8. Assumptions & Constraints

### Assumptions

1. **Space design system** provides sufficient SDC components to cover core page layouts across target industries (hero, card, grid, form, navigation, footer, CTA blocks, etc.)
2. **Drupal Canvas** is stable enough for production use as the primary page editing experience
3. **Drupal AI module** supports OpenAI and Claude model integrations for content generation
4. **Drupal AI Agents module** can orchestrate multi-step AI workflows (industry analysis → content structure → page generation)
5. Users in the target persona can navigate a 5-step wizard without assistance
6. OpenAI/Claude APIs maintain current pricing and availability levels through MVP launch
7. 4–6 industries can be adequately served with a shared component library (no industry-specific components needed)

### Constraints

1. **Component-only architecture:** AI must only use existing Space SDC components — no dynamically generated HTML or custom components
2. **LLM dependency:** Core generation flow requires LLM API availability; no offline fallback
3. **Single-site licensing:** MVP supports one site per subscription; no multi-site management
4. **Drupal version:** Must target Drupal 11.x (latest stable)
5. **No self-hosted mode in MVP:** Platform is SaaS-only for v1
6. **No CRM integration in MVP:** Form data stored in Drupal only; CRM sync is post-MVP
7. **Investor demo timeline:** MVP must be demo-ready as fast as possible

---

## 9. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **AI generates poor/irrelevant content** | Medium | High | Section-level regeneration with user guidance; human-editable everything; prompt engineering with industry-specific templates |
| R2 | **AI hallucinated page structures** (creates elements outside design system) | Medium | High | Strict component whitelist enforcement; validation layer that rejects non-SDC output; schema-constrained generation |
| R3 | **Space design system has component gaps** for certain industries | Medium | Medium | Audit component inventory against industry needs before dev; build missing critical components as part of MVP |
| R4 | **Drupal Canvas stability issues** in production | Low | High | Thorough QA; fallback to standard Drupal admin editing; report and patch Canvas bugs upstream |
| R5 | **LLM API outages** block site generation | Low | High | Queue-based generation with retry; multi-provider failover (OpenAI ↔ Claude); clear user messaging |
| R6 | **Generation takes too long** (> 5 min) — users abandon | Medium | Medium | Async generation with email notification; progress streaming; optimize prompt chains |
| R7 | **Compliance content is inaccurate** (e.g., wrong HIPAA disclaimers) | Medium | High | Disclaimers that AI-generated compliance content must be reviewed by legal; clear warnings in UI |
| R8 | **Multi-tenant data leakage** via shared LLM context | Low | Critical | Tenant-isolated prompt contexts; no shared conversation history; audit logging |
| R9 | **Trial abuse** — users generate sites and screenshot without paying | Medium | Low | Watermark in trial mode; limited export capabilities; accept some churn as cost of acquisition |
| R10 | **Investor demo fails** due to immature AI output | Medium | High | Curate demo scenarios with pre-tested industries; have rehearsed fallback flows |

---

## 10. Out of Scope (MVP)

The following are explicitly **not included** in the MVP release:

1. **Self-hosted deployment mode** — SaaS only
2. **Agency/multi-site management** — 1 license = 1 site
3. **CRM integrations** (HubSpot, Salesforce) — form data stays in Drupal
4. **Plugin/module marketplace** — no user-installable Drupal modules
5. **Multi-language / i18n** — English only
6. **Advanced analytics dashboard** — basic form submissions only
7. **AI-driven CRO** (conversion rate optimization) — no A/B testing or AI optimization loops
8. **E-commerce** — no product catalog, cart, or payment processing
9. **Blog/content marketing automation** — pages are generated, ongoing content is manual
10. **Custom code injection** — no user-added CSS/JS
11. **API access** — no public API for programmatic site management
12. **White-labeling** — platform branding visible
13. **Industry-specific deep integrations** (EHR systems, MLS feeds, legal case management)

---

## 11. Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| OQ-1 | What is the exact subscription price point? | Affects positioning, trial conversion messaging, feature gating decisions | Product/Business |
| OQ-2 | How many industries should MVP support at launch? Vision says 4 (Healthcare, Legal, Real Estate, + Other) — is this sufficient? | Determines AI agent training scope and component audit breadth | Product |
| OQ-3 | What happens to user data (form submissions, content) if subscription lapses after paid period? | Affects data retention policy, infrastructure costs, and legal obligations | Product/Legal |
| OQ-4 | Should generated sites include the platform's branding/attribution (e.g., "Powered by [Product]")? | Affects user perception, brand awareness, pricing tiers | Product |
| OQ-5 | What is the target hosting infrastructure for MVP? (Even if multi-site provisioning is deferred, sites need to run somewhere) | Directly impacts deployment architecture, cost model, and scaling plan | Engineering |
| OQ-6 | Are there any specific investor demo scenarios we should optimize for? | Affects which industries and flows get priority polish | Product/Business |
| OQ-7 | Should the AI generate actual stock images or just placeholders? If actual images, what is the image sourcing strategy (Unsplash, licensed, AI-generated)? | Affects visual quality of generated sites and cost structure | Product/Design |
| OQ-8 | What level of Drupal admin is exposed to end users? Full admin, simplified dashboard, or Canvas-only? | Affects UX complexity, support burden, and what users can break | Product/UX |

---

## Appendix A: Tech Stack Reference

| Layer | Technology | Role |
|-------|-----------|------|
| CMS | Drupal 11.x | Core content management, content types, user management |
| Page Builder | Drupal Canvas | Visual page editing with SDC components |
| Design System | Space Theme (SDC) | Component library for all visual elements |
| AI Orchestration | Drupal AI Agents | Multi-step AI workflow orchestration |
| AI Core | Drupal AI Module | LLM provider integration (OpenAI, Claude) |
| LLM Providers | OpenAI + Claude (Anthropic) | Content generation, industry analysis, page composition |
| Testing | Playwright | End-to-end test automation |
| Forms | Drupal Webform (or equivalent) | Lead capture and form submission management |

---

## Appendix B: Industry Coverage Matrix (Proposed MVP)

| Industry | Key Pages | Unique Content Types | Compliance Considerations |
|----------|-----------|---------------------|--------------------------|
| Healthcare | Home, About, Services, Doctors, Locations, Contact, Appointments | Provider, Service, Location | HIPAA (forms), ADA (accessibility) |
| Legal | Home, About, Practice Areas, Attorneys, Case Results, Contact | Attorney, Practice Area, Case Study | Attorney advertising rules, disclaimers |
| Real Estate | Home, Listings, Agents, Neighborhoods, Contact | Listing, Agent, Neighborhood | Fair housing disclaimers |
| Restaurant | Home, Menu, About, Gallery, Reservations, Contact | Menu Item, Menu Category | Food allergen info, health dept. compliance |
| Professional Services | Home, About, Services, Team, Testimonials, Contact | Service, Team Member, Testimonial | Industry-specific (varies) |
| Other (Generic) | Home, About, Services, Contact | Service, Team Member | General privacy policy, terms |

---

*Next step: Invoke `/tpm` to convert this PRD into user stories and begin sprint planning.*
