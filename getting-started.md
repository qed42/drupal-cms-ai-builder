# Getting Started

## Architecture Overview

This project is an AI-powered website builder that generates and provisions Drupal CMS sites through a guided onboarding flow.

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                           │
│  Onboarding Wizard → Progress UI → Dashboard → Canvas Editor│
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Next.js Platform App   │    │   Drupal CMS (Multisite) │
│   (port 3000)            │    │   (DDEV — port 443)      │
│                          │    │                          │
│  • Onboarding UI         │    │  • Canvas page editor    │
│  • AI blueprint gen      │    │  • Space DS components   │
│  • Dashboard & auth      │    │  • ai_site_builder module│
│  • Provisioning trigger   │    │  • Auto-login (JWT)      │
│                          │    │  • Per-site content       │
│  DB: PostgreSQL (5433)   │    │  DB: MariaDB (3306)      │
└──────────┬───────────────┘    └──────────▲───────────────┘
           │                               │
           ▼                               │
┌──────────────────────────┐               │
│  Provisioning Engine     │───────────────┘
│  (Node.js CLI)           │
│                          │
│  11-step pipeline:       │
│  1. Create database      │
│  2. Generate settings    │
│  3. Update sites.php     │
│  4. Install Drupal CMS   │
│  5. Install Space DS     │
│  6. Enable modules       │
│  7. Import config        │
│  8. Import blueprint     │
│  9. Apply brand tokens   │
│  10. Configure site      │
│  11. Callback → platform │
└──────────────────────────┘
```

### Components

| Component | Tech | Port | Database | Location |
|-----------|------|------|----------|----------|
| Platform App | Next.js 16, React 19 | 3000 | PostgreSQL 16 | `platform-app/` |
| Drupal CMS | Drupal 11, PHP 8.4 | 443 (DDEV) | MariaDB 11.8 | `drupal-site/` |
| Provisioning Engine | Node.js, TypeScript | — (CLI) | MariaDB (via DDEV) | `provisioning/` |
| PostgreSQL | PostgreSQL 16 Alpine | 5433 | — | `docker-compose.yml` |

### User Flow

1. **Register/Login** → Next.js handles auth (NextAuth + PostgreSQL)
2. **Onboarding Wizard** → 7 steps: name, idea, audience, pages, design, brand, fonts
3. **Blueprint Generation** → OpenAI generates site structure, content, forms
4. **Auto-Provisioning** → Engine creates a new Drupal multisite instance
5. **Dashboard** → Shows all sites with status, "Edit Site" opens Canvas editor
6. **Canvas Editor** → Drupal's visual editor with Space DS components, auto-login via JWT

## Prerequisites

- **Docker Desktop** (for PostgreSQL + Next.js containers)
- **DDEV** ([install guide](https://ddev.readthedocs.io/en/stable/users/install/)) — manages Drupal environment
- **Node.js 22+** (for provisioning engine, if running outside Docker)
- **OpenAI API key** (for AI blueprint generation)

## Quick Start

### 1. Clone and setup

```bash
git clone <repo-url>
cd drupal-cms-ai-builder
```

### 2. Configure environment

```bash
cp platform-app/.env.example platform-app/.env.local
```

Edit `platform-app/.env.local` and set your `OPENAI_API_KEY`.

### 3. Start all services

```bash
make up
```

This runs:
- `ddev start` — Drupal CMS with MariaDB, nginx, PHP 8.4
- `docker compose up` — PostgreSQL + Next.js platform app
- `prisma db push` — applies database migrations

### 4. Access the app

- **Platform**: http://localhost:3000
- **Drupal admin**: https://ai-site-builder.ddev.site (admin/admin)

### Other commands

```bash
make down      # Stop all services
make status    # Check service health
make logs      # Tail Next.js logs
```

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection for Next.js | `postgresql://space:space_dev_password@postgres:5432/space_platform` |
| `NEXTAUTH_SECRET` | Session encryption key | `dev-secret-change-in-production-32chars!` |
| `OPENAI_API_KEY` | AI blueprint generation | *(required)* |
| `JWT_SHARED_SECRET` | Shared secret for Drupal auto-login tokens | `dev-jwt-secret-change-in-production` |
| `PROVISION_CALLBACK_KEY` | Auth key for provisioning callback | `dev-callback-key-change-in-production` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` | DDEV MariaDB credentials for provisioning | `127.0.0.1` / `3306` / `db` / `db` |

## Project Structure

```
├── docker-compose.yml          # PostgreSQL + Next.js containers
├── Makefile                    # Orchestration: make up/down/status
├── platform-app/               # Next.js platform application
│   ├── prisma/schema.prisma   #   Database schema (User, Site, Blueprint, etc.)
│   ├── src/app/               #   App router pages & API routes
│   ├── src/components/        #   React components
│   ├── src/lib/               #   Blueprint generator, JWT, provisioning
│   └── tests/                 #   Playwright E2E tests
├── drupal-site/                # Drupal CMS installation
│   ├── .ddev/                 #   DDEV configuration
│   └── web/modules/custom/    #   ai_site_builder module
│       └── ai_site_builder/   #     Blueprint import, brand tokens, auto-login, drush commands
├── provisioning/               # Site provisioning engine
│   └── src/                   #   11-step pipeline (create DB → install → import → callback)
└── project-management/         # Sprint plans, backlog, outputs
    ├── sprints/               #   Sprint definitions
    ├── backlog/               #   Task specifications
    └── sprint-outputs/        #   QA reports & deliverables
```

## Running Tests

```bash
cd platform-app
npx playwright test                    # Run all tests
npx playwright test tests/sprint-05*   # Run Sprint 05 tests only
npx playwright test --reporter=list    # Verbose output
```

Tests require the dev server running on port 3000 (handled by `make up`).

## Development Workflow

This project uses an agent-driven SDLC with specialized personas:

| Command | Role | Purpose |
|---------|------|---------|
| `/ba` | Business Analyst | Vision → PRD |
| `/tpm` | Project Manager | PRD → stories → sprint plans |
| `/architect` | Solution Architect | Technical architecture |
| `/drupal-architect` | Drupal Architect | Drupal-specific design |
| `/dev` | Developer | Implement tasks |
| `/qa` | QA Engineer | Playwright tests & bug reports |

Typical cycle: `/tpm sprint` → `/dev sprint-NN` → `/qa sprint-NN` → fix bugs → next sprint.
