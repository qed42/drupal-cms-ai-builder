# 🌐 Product Vision Document (Draft v1)

## 1. Vision Statement

Enable businesses to launch high-quality, extensible websites in minutes using AI—without sacrificing the power, flexibility, and scalability of a mature CMS like Drupal.

This product bridges the gap between:
- Ease of use (Wix AI-like onboarding)
- Enterprise-grade extensibility (Drupal ecosystem)

---

## 2. Product Summary

An AI-first website generation platform built on Drupal that allows small to mid-sized businesses to:

- Answer a 5-minute guided onboarding
- Automatically generate fully structured, branded, content-rich websites
- Review and edit using a component-based page builder (Drupal + SDC)
- Publish instantly with multi-site + managed hosting support
- Extend capabilities via the Drupal contrib ecosystem

---

## 3. Target Audience

### Primary Persona
- Founder / Marketing Manager
  - Limited technical expertise
  - Needs quick go-to-market
  - Focused on lead generation

### Secondary Persona
- Agencies / Consultants (Future expansion)
  - Want rapid prototyping + delivery
  - Need extensibility beyond no-code tools

---

## 4. Core Value Proposition

### 🚀 Speed
- Website live in < 30 minutes
- 5 min onboarding + AI generation

### 🧠 Intelligence
- AI understands:
  - Industry context
  - Content structure
  - Branding

### 🧩 Extensibility (Key Differentiator)
Unlike Wix AI, sites are built on Drupal and can be extended using the full contrib ecosystem.

---

## 5. Differentiation

| Capability | Wix AI | Your Product |
|----------|--------|-------------|
| AI onboarding | ✅ | ✅ |
| Industry awareness | Limited | Deep (Agent-driven) |
| CMS extensibility | ❌ | ✅ Drupal ecosystem |
| Structured content types | ❌ | ✅ |
| Advanced workflows | ❌ | ✅ |
| Developer extensibility | ❌ | ✅ |

---

## 6. Product Principles

1. AI-first, not AI-bolted-on  
2. Structured over free-form  
3. Guided simplicity, optional depth  
4. Design consistency via system, not templates  
5. Extensibility as a first-class feature  

---

## 7. Core Experience (User Journey)

### Step-by-Step Flow

#### 1. Setup Basics
- Site name  
- Logo upload  
- Tagline  
- Admin email  

#### 2. Industry Selection
- Healthcare / Legal / Real Estate / Other  
- Optional: Describe use case (free text)  

#### 3. Brand Input
- Colors  
- Fonts  
- Reference websites  
- Brand guidelines upload  

#### 4. Business Context
- Services offered  
- Target audience  
- Competitors  
- Key CTAs  

#### 5. Industry-Specific Questions (Dynamic)
Driven by Industry Agent  

Example (Healthcare):
- Do you offer appointments?  
- Types of services?  
- Locations?  

---

### ✨ “Magic Moment”

User clicks:

**“Generate My Website”**

AI:
- Selects components from design system  
- Creates:
  - Pages (Home, About, Services, Contact)  
  - Structured content types  
  - SEO copy  
  - CTAs  
- Applies branding tokens  

---

### 6. Review & Edit
- Drupal Canvas (SDC-based)  
- Inline editing  
- Section-level regeneration  

---

### 7. Publish
- Site deployed as:
  - Multi-site instance  
  - Vanity domain  
- Content initially in draft mode  

---

## 8. System Architecture (Conceptual)

### Core Layers

#### 1. AI Orchestration Layer
- Onboarding interpreter  
- Industry Agent  
- Page Builder Agent  
- Content Generator  

#### 2. Drupal Provisioning Engine
- Module auto-enablement  
- Content type creation  
- View generation  
- Theme + design token application  

#### 3. Design System Layer
- SDC components  
- Token-driven theming  
- Layout rules  

#### 4. Runtime Layer
- Drupal (traditional frontend)  
- Multi-site architecture  

---

## 9. AI Architecture

### Agents

#### 🧠 Industry Agent
- Determines:
  - Required pages  
  - Content structure  
  - Compliance hints  

#### 🏗 Page Builder Agent
- Maps content → components  
- Ensures:
  - No new components created  
  - Only design-system compliant layouts  

#### ✍️ Content Agent
- Generates:
  - SEO content  
  - CTAs  
  - Disclaimers  

---

### Guardrails

- Strict component usage (SDC only)  
- Brand token enforcement  
- Industry-aware constraints  
- No hallucinated structures  

---

## 10. MVP Scope

### Included

- AI onboarding wizard  
- Industry-aware questionnaire  
- Page generation (content + layout)  
- Drupal auto-provisioning  
- SDC-based page builder  
- Inline editing  
- Section regeneration  
- Forms + basic CRM integration  
- Multi-site deployment  
- Free trial (ephemeral environments)  

---

### Excluded (Post-MVP)

- Plugin marketplace  
- Advanced AI optimization (CRO)  
- Multi-language  
- Advanced analytics  
- Industry deep integrations  

---

## 11. Lead Capture Capabilities

- Smart forms  
- CTA suggestions (AI)  
- CRM integrations:
  - HubSpot  
  - Salesforce  
- Basic analytics  

---

## 12. Hosting Model

### Dual Mode

#### SaaS Mode
- Fully managed  
- Auto-provisioned  

#### Self-hosted Mode
- Deploy to customer infrastructure  

---

## 13. Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| AI hallucination | Strict component + schema constraints |
| Poor content quality | Regeneration + editing |
| Industry misalignment | Industry Agent training |
| Over-complex Drupal exposure | Abstract by default |
| Performance issues | CWV-focused design system |

---

## 14. Success Metrics

- Time to publish (< 30 min)  
- Conversion rate (form submissions)  
- AI generation acceptance rate  
- Edit vs regenerate ratio  
- Number of sites launched  

---

## 15. Future Roadmap (Directional)

### V2
- Multi-language  
- Industry add-ons  
- Template learning from usage  

### V3
- Plugin marketplace  
- AI CRO optimization  
- Agent customization  
