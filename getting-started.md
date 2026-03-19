# Getting Started

## What This Project Does

This is an AI-powered website builder. A user goes through a guided onboarding wizard, answers questions about their business, and the system:

1. Generates a full site blueprint (pages, content, forms, brand tokens) using OpenAI
2. Provisions a new Drupal CMS multisite instance automatically
3. Imports the blueprint into Drupal — creates pages with visual components, content nodes, webforms, and brand styling

The result is a fully functional Drupal website with the Space DS design system, editable via the Canvas visual page builder.

## Architecture

There are three main components that talk to each other:

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│   Register → Onboarding Wizard → Progress UI → Dashboard        │
│                                                    ↓            │
│                                         "Edit Site" opens       │
│                                         Drupal Canvas editor    │
└────────────────┬────────────────────────────────┬───────────────┘
                 │                                │
                 ▼                                ▼
┌────────────────────────────┐  ┌────────────────────────────────┐
│  Next.js Platform App      │  │  Drupal CMS (Multisite)        │
│  Container: space-ai-      │  │  Container: ddev-ai-site-      │
│             platform       │  │             builder-web         │
│                            │  │                                │
│  What it does:             │  │  What it does:                 │
│  • User registration/login │  │  • Hosts provisioned sites     │
│  • 7-step onboarding UI    │  │  • Canvas visual page editor   │
│  • AI blueprint generation │  │  • Space DS theme/components   │
│  • Dashboard (list sites)  │  │  • Content management          │
│  • Triggers provisioning   │  │  • Auto-login via JWT          │
│                            │  │                                │
│  Tech: Next.js 16, React 19│  │  Tech: Drupal 11, PHP 8.4     │
│  DB: PostgreSQL 16         │  │  DB: MariaDB 11.8              │
│  Port: 3000                │  │  Port: 443 (DDEV router)       │
└────────────┬───────────────┘  └────────────────▲───────────────┘
             │                                   │
             │  Spawns as background process      │
             ▼                                   │
┌────────────────────────────┐                   │
│  Provisioning Engine       │───────────────────┘
│  (runs inside platform     │   Executes drush commands
│   container via tsx)       │   via `docker exec` into
│                            │   the DDEV web container
│  11-step pipeline:         │
│   1. Create database       │
│   2. Generate settings.php │
│   3. Update sites.php      │
│   4. Install Drupal CMS    │
│   5. Install Space DS theme│
│   6. Enable modules        │
│   7. Import industry config│
│   8. Import blueprint      │
│   9. Apply brand tokens    │
│  10. Configure site        │
│  11. Callback → platform   │
└────────────────────────────┘
```

### How the containers connect

```
┌─────────────────────────────────────────────────────────┐
│  Docker network: drupal-cms-ai-builder_default          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ space-ai-    │  │ space-ai-    │                     │
│  │ platform     │  │ postgres     │                     │
│  │ (Next.js)    │──│ (PostgreSQL) │                     │
│  │ :3000        │  │ :5432→5433   │                     │
│  └──────┬───────┘  └──────────────┘                     │
│         │                                               │
│         │ docker exec + shared volume (/drupal-site)    │
│         │                                               │
│  ┌──────▼───────┐  ┌──────────────┐                     │
│  │ ddev-ai-site-│  │ ddev-ai-site-│                     │
│  │ builder-web  │──│ builder-db   │                     │
│  │ (Drupal)     │  │ (MariaDB)    │                     │
│  │ :443         │  │ :3306        │                     │
│  └──────────────┘  └──────────────┘                     │
│                                                         │
│  DDEV joins this network via docker-compose.platform.yaml│
└─────────────────────────────────────────────────────────┘
```

Key detail: The platform container mounts `./drupal-site:/drupal-site` and has Docker CLI installed. It runs provisioning drush commands via `docker exec ddev-ai-site-builder-web ...`, and shares files (blueprints, brand tokens) through the mounted volume.

## Prerequisites

You need all of these installed:

| Tool | Version | Why |
|------|---------|-----|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Runs PostgreSQL + Next.js containers |
| [DDEV](https://ddev.readthedocs.io/en/stable/users/install/) | v1.23+ | Manages the Drupal environment (nginx, PHP, MariaDB) |
| [OpenAI API key](https://platform.openai.com/api-keys) | — | Powers AI blueprint generation |

DDEV requires Docker, so install Docker Desktop first, then DDEV.

## Setup (First Time)

### 1. Clone the repo

```bash
git clone <repo-url>
cd drupal-cms-ai-builder
```

### 2. Set your OpenAI key

```bash
cp platform-app/.env.example platform-app/.env.local
```

Edit `platform-app/.env.local` and replace `sk-your-key-here` with your actual OpenAI API key. All other values have working defaults for local dev.

### 3. Start everything

```bash
make up
```

This does three things in order:
1. **`cd drupal-site && ddev start`** — Starts Drupal's nginx, PHP 8.4, and MariaDB containers. First run downloads images and runs `composer install` (~2-5 min).
2. **`docker compose up -d --build`** — Builds and starts the Next.js platform app and PostgreSQL. First run installs npm dependencies (~1-2 min).
3. **`docker compose exec platform npx prisma db push`** — Creates the PostgreSQL tables (User, Site, Blueprint, etc.).

**Important:** DDEV must start first because the platform container's Docker Compose network (`drupal-cms-ai-builder_default`) must exist before DDEV tries to join it via `docker-compose.platform.yaml`. If you see a network error, just run `make up` again.

### 4. Verify it's running

```bash
make status
```

You should see:
- `space-ai-platform` — Running on port 3000
- `space-ai-postgres` — Healthy on port 5433
- DDEV shows `ai-site-builder` as running

### 5. Access the app

| URL | What |
|-----|------|
| http://localhost:3000 | Platform app (register, onboard, dashboard) |
| https://ai-site-builder.ddev.site | Drupal admin for the default site (admin/admin) |

## Day-to-Day Commands

```bash
make up        # Start all services
make down      # Stop all services
make status    # Check what's running
make logs      # Tail Next.js platform logs
```

### Rebuilding after code changes

- **Next.js changes** (`platform-app/src/`): Auto-reloads via hot module replacement (volume-mounted).
- **Provisioning engine changes** (`provisioning/src/`): Also volume-mounted, picked up on next provisioning run.
- **Drupal module changes** (`drupal-site/web/modules/custom/`): Volume-mounted into DDEV, changes are immediate. Run `ddev drush cr` if needed.
- **Dockerfile or package.json changes**: Run `docker compose up -d --build platform` to rebuild the container.
- **Prisma schema changes**: Run `docker compose exec platform npx prisma db push` to update the database.

## How It Works End-to-End

Here's the full user journey and what happens under the hood:

### 1. Registration
User creates an account at http://localhost:3000/register. Credentials stored in PostgreSQL via NextAuth.

### 2. Onboarding Wizard (7 steps)
User goes through: Site Name → Business Idea → Target Audience → Page Selection → Design Source → Brand Assets (logo, colors) → Font Selection.

Each step's data is saved to an `onboarding_sessions` row in PostgreSQL.

### 3. Blueprint Generation
When the user submits the last step, the platform calls OpenAI to generate a structured blueprint JSON containing:
- **Site metadata** (name, industry, tone, tagline)
- **Pages** with component trees (Space DS components like hero banners, text blocks, CTAs)
- **Content** (services, team members, testimonials — based on industry)
- **Forms** (contact form with field definitions)
- **Brand tokens** (fonts, colors, logo URL)

The blueprint is saved to the `blueprints` table and also written to `drupal-site/blueprints/bp-XXXXX/blueprint.json` (shared volume).

### 4. Provisioning
The platform spawns the provisioning engine as a background process. It runs 11 steps (~2-3 minutes total):

| Step | What it does |
|------|-------------|
| 1. Create database | Creates a new MariaDB database (`site_{siteId}`) in the DDEV db container |
| 2. Generate settings.php | Writes Drupal settings with database credentials for the new site |
| 3. Update sites.php | Adds the new domain → directory mapping to Drupal's multisite config |
| 4. Install Drupal CMS | Runs `drush site:install` with the `drupal_cms_installer` profile (~50s) |
| 5. Install Space DS theme | Installs and sets Space DS as the default theme |
| 6. Enable modules | Enables webform, metatag, and the `ai_site_builder` custom module |
| 7. Import industry config | Enables industry-specific content types (healthcare, legal, etc.) |
| 8. Import blueprint | Creates Canvas pages with component trees, content nodes, webforms, and menus |
| 9. Apply brand tokens | Generates CSS custom properties for fonts/colors, writes `brand-tokens.css` |
| 10. Configure site | Rebuilds router, generates URL aliases via pathauto, clears caches |
| 11. Callback | POSTs to `/api/provision/callback` to update site status to "live" |

If any step fails (except the callback), the engine sends a failure callback and rolls back (drops database, removes site directory).

### 5. Dashboard
The dashboard polls `/api/provision/status` every 3 seconds. Once the site is "live", the user sees their site card with an "Edit Site" button.

### 6. Editing in Drupal
"Edit Site" generates a JWT auto-login token and redirects the user to the Drupal site's Canvas editor, where they can visually edit pages using Space DS components.

## File Structure

```
drupal-cms-ai-builder/
├── docker-compose.yml              # PostgreSQL + Next.js platform containers
├── Makefile                        # make up/down/status/logs
├── getting-started.md              # This file
│
├── platform-app/                   # Next.js application
│   ├── Dockerfile.dev              # Dev container (Node 22 Alpine + Docker CLI)
│   ├── .env.example                # Environment template — copy to .env.local
│   ├── prisma/
│   │   └── schema.prisma           # Database schema: User, Site, Blueprint, Session, etc.
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/       # Login page
│   │   │   ├── dashboard/          # Dashboard — lists user's sites
│   │   │   ├── onboarding/         # 7-step wizard + progress page
│   │   │   │   └── progress/       # Polls provisioning status, shows spinner/error/done
│   │   │   └── api/
│   │   │       ├── blueprint/      # GET /api/blueprint/[siteId] — download blueprint JSON
│   │   │       ├── onboarding/     # POST /api/onboarding/new — saves wizard data
│   │   │       ├── provision/
│   │   │       │   ├── start/      # POST — triggers provisioning engine
│   │   │       │   ├── status/     # GET — polls site/blueprint status
│   │   │       │   └── callback/   # POST — receives provisioning result (success/failure)
│   │   │       └── auth/           # NextAuth endpoints + JWT token creation
│   │   ├── components/
│   │   │   ├── dashboard/          # SiteCard, AddNewSiteButton
│   │   │   └── onboarding/         # Wizard step components, GenerationProgress
│   │   ├── lib/
│   │   │   ├── auth.ts             # NextAuth config (credentials provider + Prisma adapter)
│   │   │   ├── prisma.ts           # Prisma client singleton
│   │   │   ├── provisioning.ts     # spawnProvisioning() — writes blueprint, spawns engine
│   │   │   ├── jwt.ts              # JWT utilities for Drupal auto-login
│   │   │   ├── download.ts         # Client-side blueprint download helper
│   │   │   └── blueprint/
│   │   │       ├── generator.ts    # OpenAI prompt → structured blueprint JSON
│   │   │       ├── types.ts        # TypeScript types for blueprint structure
│   │   │       ├── component-tree-builder.ts  # Converts sections → Canvas component tree
│   │   │       └── canvas-component-versions.ts  # Space DS component version hashes
│   │   └── middleware.ts           # Auth middleware (protects /onboarding, /dashboard)
│   └── tests/                      # Playwright E2E tests
│
├── drupal-site/                    # Drupal CMS installation
│   ├── .ddev/
│   │   ├── config.yaml             # DDEV config: drupal11, PHP 8.4, MariaDB 11.8
│   │   └── docker-compose.platform.yaml  # Joins DDEV to the platform Docker network
│   ├── web/
│   │   ├── sites/
│   │   │   ├── default/            # Default Drupal site
│   │   │   ├── sites.php           # Multisite domain → directory mappings
│   │   │   └── *.ddev.site/       # Provisioned site directories (auto-created)
│   │   └── modules/custom/
│   │       └── ai_site_builder/    # Custom module for the builder
│   │           ├── src/
│   │           │   ├── Drush/Commands/
│   │           │   │   ├── ImportBlueprintCommands.php   # drush aisb:ib — imports blueprint JSON
│   │           │   │   ├── ApplyBrandCommands.php        # drush aisb:ab — applies brand tokens CSS
│   │           │   │   ├── ConfigureSiteCommands.php     # drush aisb:cs — routes, aliases, cache
│   │           │   │   └── ImportConfigCommands.php      # drush aisb:ic — industry content types
│   │           │   └── Service/
│   │           │       ├── BlueprintImportService.php    # Creates pages, content, forms from JSON
│   │           │       ├── BrandTokenService.php         # Generates CSS custom properties
│   │           │       └── AutoLoginService.php          # JWT-based auto-login for site owners
│   │           └── modules/
│   │               └── ai_site_builder_content/          # Content type configs per industry
│   └── blueprints/                 # Shared volume — blueprint JSON files written here
│       └── bp-XXXXX/              # Per-provisioning-run directory
│           ├── blueprint.json      # The generated blueprint
│           ├── tokens-{siteId}.json # Brand tokens extracted for drush
│           └── provision.log       # Provisioning engine log output
│
├── provisioning/                   # Provisioning engine (TypeScript CLI)
│   └── src/
│       ├── provision.ts            # Main orchestrator — parses args, runs 11 steps
│       ├── types.ts                # ProvisioningConfig, StepResult, RollbackAction
│       ├── steps/
│       │   ├── 01-create-database.ts
│       │   ├── 02-generate-settings.ts
│       │   ├── 03-update-sites.ts
│       │   ├── 04-install-drupal.ts
│       │   ├── 05-install-theme.ts
│       │   ├── 06-enable-modules.ts
│       │   ├── 07-import-config.ts
│       │   ├── 08-import-blueprint.ts
│       │   ├── 09-apply-brand.ts
│       │   ├── 10-configure-site.ts
│       │   └── 11-callback.ts
│       └── utils/
│           ├── drush.ts            # Executes drush via docker exec into DDEV container
│           ├── database.ts         # MySQL create/drop database utilities
│           └── logger.ts           # Winston logger
│
└── project-management/             # Sprint planning & tracking
    ├── requirements/               # PRD, user stories
    ├── backlog/                    # Task specifications
    ├── sprints/                    # Sprint plans
    └── sprint-outputs/            # QA reports, spike docs
```

## Environment Variables

All set in `docker-compose.yml` for containerized dev. You only need to create `platform-app/.env.local` with your OpenAI key.

| Variable | Purpose | Default |
|----------|---------|---------|
| `OPENAI_API_KEY` | AI blueprint generation | **Required** — set in `.env.local` |
| `DATABASE_URL` | PostgreSQL for Next.js (users, sites, blueprints) | Auto-set in docker-compose |
| `NEXTAUTH_SECRET` | Session encryption | `dev-secret-change-in-production-32chars!` |
| `NEXTAUTH_URL` | NextAuth callback base URL | `http://localhost:3000` |
| `JWT_SHARED_SECRET` | Shared with Drupal for auto-login tokens | `dev-jwt-secret-change-in-production` |
| `PROVISION_CALLBACK_KEY` | Auth key for provisioning engine → platform callback | `dev-callback-key-change-in-production` |
| `SITE_DOMAIN_SUFFIX` | Domain suffix for provisioned sites | `ai-site-builder.ddev.site` |
| `DB_HOST` | MariaDB host for provisioning | `ddev-ai-site-builder-db` |
| `DB_PORT` | MariaDB port | `3306` |
| `DB_USER` | MariaDB user | `root` |
| `DB_PASSWORD` | MariaDB password | `root` |

## Troubleshooting

### "Network drupal-cms-ai-builder_default not found" on DDEV start
DDEV's `docker-compose.platform.yaml` expects the platform network to exist. Run `docker compose up -d` first (or just `make up` which handles the order).

### Provisioning fails at step 4 (Install Drupal) — timeout
Drupal CMS installation takes ~50-60 seconds. If it times out, the 5-minute timeout in `drush.ts` may need increasing, or the DDEV container may be under-resourced. Check Docker Desktop's resource allocation.

### Provisioning fails at step 8 (Import Blueprint) — "property X is required"
Some Space DS components require layout props (`width`, `alignment`) that the AI generator doesn't produce. These defaults are defined in `component-tree-builder.ts` → `REQUIRED_PROP_DEFAULTS`. If you see a new required prop error, add the component and its defaults to that map.

### Site stuck in "provisioning" status
Check the provisioning log: `cat drupal-site/blueprints/bp-*/provision.log` (find the latest `bp-*` directory). If provisioning failed, the failure callback should update the status to `provisioning_failed`. If the callback itself failed, manually update: `docker exec space-ai-postgres psql -U space -d space_platform -c "UPDATE sites SET status = 'provisioning_failed' WHERE status = 'provisioning';"`.

### DDEV container can't connect to platform network
Run `docker network ls | grep drupal-cms` to verify the network exists. If not, run `docker compose up -d` to create it, then `cd drupal-site && ddev restart`.

### PostgreSQL port conflict (5433)
If port 5433 is in use, change the host port in `docker-compose.yml` under `postgres.ports` and update `DATABASE_URL` in `platform-app/.env.local` accordingly.

## Running Tests

```bash
# From the host machine (services must be running)
cd platform-app
npx playwright install    # First time only — installs browsers
npx playwright test       # Run all E2E tests
```
