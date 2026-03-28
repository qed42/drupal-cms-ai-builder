# AWS Deployment Guide

Deploy the AI Site Builder to a single EC2 instance running 5 Docker containers: Caddy (reverse proxy + SSL), Platform (Next.js), PostgreSQL, Drupal (Nginx + PHP-FPM), and MariaDB.

## Prerequisites

- AWS account with EC2 access
- GoDaddy account with `drupalcms.app` domain
- Anthropic API key for AI pipeline
- SSH key pair for EC2 access

## Architecture

```
Internet
  │
  ├── app.drupalcms.app ──► Caddy ──► platform:3000  (Next.js)
  │                           │
  └── *.drupalcms.app  ──► Caddy ──► drupal-web:80   (Nginx + PHP-FPM)
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                          postgres:5432           mariadb:3306
                        (Platform DB)           (Drupal DBs)
```

---

## Step 1: Provision EC2 Instance

### 1.1 Launch Instance

- **AMI:** Amazon Linux 2023 or Ubuntu 22.04
- **Type:** t3.xlarge (4 vCPU, 16 GB RAM)
- **Storage:** 100 GB gp3 EBS
- **Key pair:** Create or select existing SSH key

### 1.2 Security Group

Create a security group with these inbound rules:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP only | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP (Caddy redirect to HTTPS) |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

### 1.3 Elastic IP

```bash
# Allocate and associate an Elastic IP via AWS Console or CLI:
aws ec2 allocate-address --domain vpc
aws ec2 associate-address --instance-id i-xxxx --allocation-id eipalloc-xxxx
```

Note the Elastic IP — you'll need it for DNS configuration.

### 1.4 Install Docker

SSH into the instance and install Docker + Docker Compose:

```bash
# Amazon Linux 2023
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable docker && sudo systemctl start docker

# Install Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Create deploy user (no root SSH)
sudo useradd -m -G docker deploy
sudo cp -r ~/.ssh /home/deploy/.ssh
sudo chown -R deploy:deploy /home/deploy/.ssh
```

```bash
# Ubuntu 22.04
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable docker && sudo systemctl start docker

sudo useradd -m -G docker deploy
sudo cp -r ~/.ssh /home/deploy/.ssh
sudo chown -R deploy:deploy /home/deploy/.ssh
```

### 1.5 Configure Docker Daemon (recommended)

```bash
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
sudo systemctl restart docker
```

---

## Step 2: Configure DNS (GoDaddy)

### 2.1 DNS Records

In GoDaddy DNS management for `drupalcms.app`, add:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `app` | `<Elastic-IP>` | 600 |
| A | `*` | `<Elastic-IP>` | 600 |

### 2.2 Generate API Credentials

1. Go to https://developer.godaddy.com/keys
2. Create a **Production** API key
3. Save the API Key and Secret — needed for Caddy's DNS-01 challenge

### 2.3 Verify DNS Propagation

```bash
dig +short app.drupalcms.app    # Should return your Elastic IP
dig +short test.drupalcms.app   # Should return your Elastic IP
```

---

## Step 3: Deploy Application

### 3.1 Clone Repository

```bash
ssh deploy@<Elastic-IP>
cd ~
git clone <repository-url> ai-builder
cd ai-builder
```

### 3.2 Create Environment File

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with real values:

```bash
# Generate secure secrets
openssl rand -base64 32  # Run 3 times for NEXTAUTH_SECRET, JWT_SHARED_SECRET, PROVISION_CALLBACK_KEY

# Generate secure passwords
openssl rand -base64 24  # Run 2 times for PG_PASSWORD, MARIADB_ROOT_PASSWORD
```

Fill in all values:

```env
PG_PASSWORD=<generated-password>
MARIADB_ROOT_PASSWORD=<generated-password>
NEXTAUTH_SECRET=<generated-secret>
JWT_SHARED_SECRET=<generated-secret>
PROVISION_CALLBACK_KEY=<generated-secret>
ANTHROPIC_API_KEY=sk-ant-api03-...
GODADDY_API_KEY=<from-step-2.2>
GODADDY_API_SECRET=<from-step-2.2>
```

### 3.3 Build and Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

This will:
1. Build the custom Caddy image with GoDaddy DNS plugin
2. Build the platform app (Next.js standalone + Prisma)
3. Build the Drupal container (PHP 8.4 FPM + Nginx)
4. Pull postgres:16-alpine and mariadb:11.8
5. Start all 5 services with health checks

### 3.4 Monitor Startup

```bash
# Watch all container logs
docker compose -f docker-compose.prod.yml logs -f

# Check individual services
docker compose -f docker-compose.prod.yml logs platform   # Prisma migrate + Next.js start
docker compose -f docker-compose.prod.yml logs caddy       # TLS certificate provisioning
docker compose -f docker-compose.prod.yml logs drupal-web  # Nginx + PHP-FPM
```

The platform container will:
1. Wait for PostgreSQL health check
2. Run `prisma migrate deploy` automatically
3. Start the Next.js server on port 3000

Caddy will:
1. Request a wildcard TLS certificate from Let's Encrypt
2. Complete DNS-01 challenge via GoDaddy API
3. Begin proxying requests

---

## Step 4: Initialize Drupal

### 4.1 Install Base Site

```bash
docker compose -f docker-compose.prod.yml exec drupal-web \
  /var/www/html/vendor/bin/drush site:install drupal_cms_installer \
  --root=/var/www/html \
  --account-name=admin \
  --account-pass=<choose-admin-password> \
  -y
```

### 4.2 Verify Drupal Is Running

```bash
docker compose -f docker-compose.prod.yml exec drupal-web \
  /var/www/html/vendor/bin/drush status --root=/var/www/html
```

---

## Step 5: Verify Deployment

### 5.1 Service Health

```bash
docker compose -f docker-compose.prod.yml ps
```

All 5 services should show `Up (healthy)` or `Up`.

### 5.2 HTTPS Verification

```bash
curl -I https://app.drupalcms.app          # Should return 200 (platform)
curl -I https://test.drupalcms.app          # Should return 200 or Drupal response
```

### 5.3 End-to-End Flow

1. Open `https://app.drupalcms.app` in a browser
2. Register a new account
3. Complete the 8-step onboarding flow
4. Verify the progress screen shows activity log and pipeline artifacts
5. After provisioning, visit `https://<subdomain>.drupalcms.app`
6. Verify the site loads with correct content and branding

---

## Operations

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Specific service
docker compose -f docker-compose.prod.yml logs -f platform
docker compose -f docker-compose.prod.yml logs -f caddy
```

### Restarting Services

```bash
# Restart a single service
docker compose -f docker-compose.prod.yml restart platform

# Rebuild and restart after code changes
git pull
docker compose -f docker-compose.prod.yml up -d --build platform
```

### Updating the Application

```bash
cd ~/ai-builder
git pull origin main

# Rebuild changed services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Platform container auto-runs prisma migrate on restart
```

### Database Backups

```bash
# PostgreSQL (platform)
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U space space_platform > backup-platform-$(date +%Y%m%d).sql

# MariaDB (all Drupal databases)
docker compose -f docker-compose.prod.yml exec mariadb \
  mysqldump -u root -p --all-databases > backup-drupal-$(date +%Y%m%d).sql
```

### TLS Certificate Status

```bash
docker compose -f docker-compose.prod.yml exec caddy caddy list-certs
```

Certificates auto-renew via Caddy. No manual intervention needed.

---

## Troubleshooting

### Platform container keeps restarting

Check if PostgreSQL is healthy first:

```bash
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U space
```

Then check platform logs for Prisma migration errors:

```bash
docker compose -f docker-compose.prod.yml logs platform | head -50
```

### Caddy fails to obtain certificate

```bash
docker compose -f docker-compose.prod.yml logs caddy | grep -i "error\|tls\|acme"
```

Common causes:
- GoDaddy API credentials are wrong — verify at https://developer.godaddy.com/keys
- DNS records not propagated — wait 5 minutes and retry
- Rate limited by Let's Encrypt — use staging first by adding `acme_ca https://acme-staging-v02.api.letsencrypt.org/directory` to global Caddyfile options

### Provisioned sites return 404

Check Drupal's `sites.php` has the new domain mapping:

```bash
docker compose -f docker-compose.prod.yml exec drupal-web \
  cat /var/www/html/web/sites/sites.php
```

The provisioning engine auto-adds entries. If missing, the provisioning step may have failed — check provisioning logs:

```bash
docker compose -f docker-compose.prod.yml exec platform \
  cat /drupal-site/blueprints/bp-*/provision.log
```

### Drupal shows "white screen of death"

```bash
docker compose -f docker-compose.prod.yml exec drupal-web \
  tail -50 /var/log/nginx/error.log

docker compose -f docker-compose.prod.yml exec drupal-web \
  /var/www/html/vendor/bin/drush watchdog:show --root=/var/www/html
```

---

## Cost Estimate

| Resource | Monthly Cost |
|----------|-------------|
| EC2 t3.xlarge | ~$120 |
| Elastic IP (attached) | Free |
| EBS 100 GB gp3 | ~$8 |
| Data transfer (100 GB) | ~$9 |
| GoDaddy DNS | Included with domain |
| **Total** | **~$138/mo** |
