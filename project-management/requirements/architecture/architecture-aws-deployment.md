# Architecture: AWS EC2 Deployment

**Status:** Proposed
**Date:** 2026-03-25
**Context:** Moving from local DDEV-based development to AWS EC2 production/staging environment

## 1. Current Architecture (Local Dev)

### Components
- **Platform App** — Next.js app + PostgreSQL via `docker-compose.yml`
- **Drupal Multisite** — DDEV-managed Nginx + PHP-FPM + MariaDB
- **Provisioning Engine** — Node.js child process spawned by platform app
- **Cross-Network Bridge** — `.ddev/docker-compose.platform.yaml` connects DDEV to platform network

### Wildcard Routing (DDEV)
- DNS: `*.ddev.site` resolves automatically (built-in wildcard DNS)
- SSL: mkcert local CA certificates
- Routing: ddev-router (Traefik-based) routes subdomains to Drupal's Nginx
- Drupal: `sites.php` maps hostname → site directory → per-site `settings.php`

## 2. Target Architecture (AWS EC2)

### Infrastructure Overview

```
Route 53
├── *.drupalcms.app     → ALB (or EC2 Elastic IP)
└── app.drupalcms.app   → ALB (or EC2 Elastic IP)

┌─────────────────────────────────────────────────────────┐
│  EC2 Instance (t3.xlarge or similar)                    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Caddy (Reverse Proxy + Auto-SSL)               │    │
│  │  - app.drupalcms.app → platform:3000            │    │
│  │  - *.drupalcms.app   → drupal-web:80            │    │
│  │  - Wildcard TLS via Let's Encrypt DNS-01        │    │
│  └──────────────┬──────────────────┬───────────────┘    │
│                 │                  │                     │
│  ┌──────────────▼──────┐  ┌───────▼────────────────┐   │
│  │  platform-app       │  │  drupal-web             │   │
│  │  (Next.js :3000)    │  │  (Nginx+PHP-FPM :80)   │   │
│  │                     │  │                         │   │
│  │  Spawns provision   │  │  Drupal Multisite       │   │
│  │  child processes    │  │  sites.php routing      │   │
│  └──────────┬──────────┘  └───────────┬─────────────┘   │
│             │                         │                  │
│  ┌──────────▼──────────┐  ┌───────────▼─────────────┐   │
│  │  postgres            │  │  mariadb                │   │
│  │  (PostgreSQL :5432)  │  │  (MariaDB :3306)        │   │
│  └─────────────────────┘  └─────────────────────────┘   │
│                                                          │
│  Shared Volume: /srv/drupal-site/                        │
│  (platform writes blueprints, provisioning engine reads) │
└─────────────────────────────────────────────────────────┘
```

### Component Mapping

| Component | Local (DDEV) | AWS (Production) |
|-----------|-------------|------------------|
| Reverse proxy | ddev-router (Traefik) | Caddy (auto-SSL) or ALB + Nginx |
| Drupal web | DDEV nginx-fpm container | Custom `drupal:php8.4-fpm` + Nginx sidecar |
| Drupal DB | DDEV MariaDB 11.8 | MariaDB container (or RDS) |
| Platform app | docker-compose `platform` service | Same container, different env vars |
| Platform DB | docker-compose PostgreSQL | PostgreSQL container (or RDS) |
| SSL | mkcert local CA | Let's Encrypt wildcard (DNS-01) or ACM |
| DNS | `*.ddev.site` built-in | Route 53 wildcard A record |

## 3. Wildcard Domain Routing — DDEV to Production

### What Changes

#### Layer 1: DNS
- **DDEV:** `*.ddev.site` resolves automatically via built-in wildcard DNS service
- **AWS:** In GoDaddy DNS, add wildcard A record for `drupalcms.app`:
  ```
  *.drupalcms.app    A    <EC2-Elastic-IP>
  app.drupalcms.app  A    <EC2-Elastic-IP>
  ```

#### Layer 2: TLS/SSL
- **DDEV:** mkcert generates locally-trusted certificates
- **AWS (Recommended — Caddy + GoDaddy DNS):**
  - Caddy auto-provisions wildcard certs via Let's Encrypt DNS-01 challenge
  - Uses `caddy-dns/godaddy` plugin for automated DNS-01 validation
  - Requires GoDaddy API key + secret (from https://developer.godaddy.com/keys)
  - Zero manual cert management, no Route 53 dependency
  - GoDaddy DNS: Add wildcard A record `*.drupalcms.app → EC2 Elastic IP` in GoDaddy dashboard

#### Layer 3: Request Routing
- **DDEV:** ddev-router inspects `Host` header, routes to DDEV web container
- **AWS (Caddy):**
  ```
  app.drupalcms.app {
      reverse_proxy platform:3000
  }

  *.drupalcms.app {
      reverse_proxy drupal-web:80
  }
  ```
- Drupal's `sites.php` continues to handle multisite resolution — no changes needed

### What Stays the Same
- Drupal `sites.php` domain mapping — untouched
- Per-site `settings.php` generation — untouched
- Provisioning engine steps — untouched
- Subdomain generation logic — untouched
- Platform API routes — untouched

## 4. Production Docker Compose

### New File: `docker-compose.aws.yml`

```yaml
services:
  caddy:
    build:
      context: ./caddy
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    environment:
      - GODADDY_API_KEY=${GODADDY_API_KEY}
      - GODADDY_API_SECRET=${GODADDY_API_SECRET}
    depends_on:
      - platform
      - drupal-web
    restart: unless-stopped

  platform:
    build:
      context: .
      dockerfile: platform-app/Dockerfile.prod
    environment:
      - DATABASE_URL=postgresql://space:${PG_PASSWORD}@postgres:5432/space_platform
      - NEXTAUTH_URL=https://app.drupalcms.app
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - SITE_DOMAIN_SUFFIX=drupalcms.app
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=${MARIADB_ROOT_PASSWORD}
      - PROVISION_CALLBACK_KEY=${PROVISION_CALLBACK_KEY}
      - JWT_SHARED_SECRET=${JWT_SHARED_SECRET}
    volumes:
      - drupal_site:/srv/drupal-site
      - blueprint_tmp:/srv/drupal-site/blueprints
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: space_platform
      POSTGRES_USER: space
      POSTGRES_PASSWORD: ${PG_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U space"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  drupal-web:
    build:
      context: ./drupal-site
      dockerfile: Dockerfile
    volumes:
      - drupal_site:/var/www/html
      - drupal_files:/var/www/html/web/sites
    depends_on:
      - mariadb
    restart: unless-stopped

  mariadb:
    image: mariadb:11.8
    environment:
      MYSQL_ROOT_PASSWORD: ${MARIADB_ROOT_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
  pg_data:
  mariadb_data:
  drupal_site:
  drupal_files:
  blueprint_tmp:
```

### New File: `caddy/Caddyfile`

```
{
    email admin@drupalcms.app
}

app.drupalcms.app {
    reverse_proxy platform:3000
}

*.drupalcms.app {
    tls {
        dns godaddy {
            api_token {env.GODADDY_API_KEY}:{env.GODADDY_API_SECRET}
        }
    }
    reverse_proxy drupal-web:80
}
```

## 5. Environment Variable Changes

| Variable | Dev Value | AWS Value |
|----------|-----------|-----------|
| `SITE_DOMAIN_SUFFIX` | `ai-site-builder.ddev.site` | `drupalcms.app` |
| `DB_HOST` | `ddev-ai-site-builder-db` | `mariadb` |
| `DB_PORT` | `3306` | `3306` (unchanged) |
| `DB_USER` | `root` | `root` (or dedicated user) |
| `DATABASE_URL` | `postgresql://...@localhost:5433/...` | `postgresql://...@postgres:5432/...` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://app.drupalcms.app` |
| `NEXTAUTH_SECRET` | `dev-secret-...` | Strong random secret |
| `JWT_SHARED_SECRET` | `dev-jwt-...` | Strong random secret |
| `PROVISION_CALLBACK_KEY` | `dev-callback-...` | Strong random secret |

## 6. Drupal Container (Replaces DDEV)

### New File: `drupal-site/Dockerfile`

```dockerfile
FROM php:8.4-fpm-alpine

# Install PHP extensions for Drupal
RUN apk add --no-cache \
    nginx \
    mariadb-client \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    icu-dev libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd intl opcache pdo_mysql zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy Drupal codebase
COPY . /var/www/html/
WORKDIR /var/www/html

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/web/sites

EXPOSE 80

CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
```

### Nginx Config: `drupal-site/docker/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/html/web;
    index index.php;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ ^/sites/.*/files/styles/ {
        try_files $uri /index.php$is_args$args;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires max;
        log_not_found off;
    }

    location ~ (^|/)\. {
        return 403;
    }
}
```

## 7. Migration Checklist

### Phase 1: Infrastructure Setup
- [ ] Launch EC2 instance (t3.xlarge, 16GB RAM, 100GB EBS)
- [ ] Assign Elastic IP
- [ ] Install Docker + Docker Compose on EC2
- [ ] Configure security groups: 80, 443, 22 (SSH)

### Phase 2: DNS & SSL
- [ ] In GoDaddy DNS, add wildcard A record: `*.drupalcms.app → Elastic IP`
- [ ] In GoDaddy DNS, add platform A record: `app.drupalcms.app → Elastic IP`
- [ ] Generate GoDaddy API key+secret at https://developer.godaddy.com/keys

### Phase 3: Application Deployment
- [ ] Clone repository to EC2
- [ ] Create `.env.production` with AWS values
- [ ] Build and start containers: `docker compose -f docker-compose.aws.yml up -d`
- [ ] Run Prisma migrations: `docker compose exec platform npx prisma migrate deploy`
- [ ] Verify Caddy obtains wildcard certificate

### Phase 4: Drupal Setup
- [ ] Create `drupal-site/Dockerfile` (production Drupal container)
- [ ] Create `drupal-site/docker/nginx.conf`
- [ ] Install Drupal base site: `docker compose exec drupal-web drush site:install`
- [ ] Verify multisite routing works with test subdomain

### Phase 5: End-to-End Validation
- [ ] Create account on `app.drupalcms.app`
- [ ] Complete onboarding flow
- [ ] Verify blueprint generation pipeline
- [ ] Trigger provisioning → verify site appears at `subdomain.drupalcms.app`
- [ ] Verify provisioning callback updates platform database

## 8. Scaling Considerations (Future)

### Single EC2 → Multi-Instance
When traffic demands it:
- **Database:** Move PostgreSQL + MariaDB to RDS (eliminates data volume management)
- **Platform:** Run behind ALB with multiple EC2 instances
- **Drupal:** Shared EFS volume for multisite files across instances
- **Provisioning:** Move to SQS + Lambda or ECS task (instead of child process)

### Cost Estimate (Single EC2)
| Resource | Monthly Cost |
|----------|-------------|
| EC2 t3.xlarge | ~$120 |
| Elastic IP | Free (when attached) |
| GoDaddy DNS | Included with domain |
| EBS 100GB gp3 | ~$8 |
| Data transfer (100GB) | ~$9 |
| **Total** | **~$138/mo** |

## 9. Architecture Decision Records

### ADR-020: Caddy + GoDaddy DNS over ALB/Route 53
- **Context:** Need wildcard TLS for `*.drupalcms.app`, DNS managed in GoDaddy
- **Options:** (A) ALB + ACM + Route 53, (B) Caddy with GoDaddy DNS-01, (C) Nginx + Certbot
- **Decision:** Caddy with `caddy-dns/godaddy` plugin (Option B)
- **Rationale:** Auto-renewing wildcard certs with zero config. Keeps DNS in GoDaddy (no Route 53 dependency). ALB adds $16/mo + requires Route 53 for ACM validation. Caddy's GoDaddy plugin handles DNS-01 challenge natively. Note: Requires custom Caddy build with the GoDaddy module (`xcaddy build --with github.com/caddy-dns/godaddy`).

### ADR-021: Single EC2 over ECS/Fargate
- **Context:** Need to run 5 containers (Caddy, platform, postgres, drupal-web, mariadb) with shared volumes
- **Options:** (A) Single EC2, (B) ECS with Fargate, (C) EKS
- **Decision:** Single EC2 (Option A) for dev/staging
- **Rationale:** Shared volume between platform and Drupal is critical for provisioning. ECS complicates volume sharing. EKS is overkill. Single EC2 matches current docker-compose model with minimal changes.

### ADR-022: Keep Child Process Provisioning
- **Context:** Provisioning engine runs as spawned child process
- **Options:** (A) Keep child process, (B) Move to SQS + Lambda, (C) ECS Task
- **Decision:** Keep child process (Option A) for initial deployment
- **Rationale:** Works correctly today, shares filesystem with Drupal container. Migration to queue-based would require significant refactoring. Revisit when scaling beyond single instance.
