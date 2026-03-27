# TASK-463: GoDaddy DNS Configuration for Wildcard Domain

**Story:** US-087
**Effort:** XS
**Milestone:** M23 — AWS Deployment

## Description
Configure GoDaddy DNS records and generate API credentials for Caddy's DNS-01 challenge.

## Implementation Details
1. In GoDaddy DNS dashboard, add wildcard A record: `*.drupalcms.app → <Elastic IP>`
2. Add platform A record: `app.drupalcms.app → <Elastic IP>`
3. Generate GoDaddy API key + secret at https://developer.godaddy.com/keys (Production environment)
4. Store credentials in `.env.production` on EC2

## Acceptance Criteria
- [ ] `dig +short *.drupalcms.app` resolves to EC2 Elastic IP
- [ ] `dig +short app.drupalcms.app` resolves to EC2 Elastic IP
- [ ] GoDaddy API credentials generated and stored securely
- [ ] DNS propagation confirmed (< 5 min for GoDaddy A records)

## Files
- None (infrastructure-only task)
