# TASK-462: EC2 Infrastructure Setup & Security Configuration

**Story:** US-086
**Effort:** M
**Milestone:** M23 — AWS Deployment

## Description
Provision the AWS EC2 instance, assign Elastic IP, configure security groups, and install Docker + Docker Compose. Document the setup for reproducibility.

## Implementation Details
1. Launch EC2 instance: t3.xlarge, 16GB RAM, 100GB EBS gp3, Amazon Linux 2023 or Ubuntu 22.04
2. Assign Elastic IP and associate with instance
3. Configure security group: inbound 80 (HTTP), 443 (HTTPS), 22 (SSH from admin IP only)
4. Install Docker Engine + Docker Compose plugin
5. Configure Docker daemon for production (log rotation, storage driver)
6. Create deployment user with Docker group access (no root SSH)
7. Document setup in `docs/aws-setup.md`

## Acceptance Criteria
- [ ] EC2 instance running with Elastic IP
- [ ] Security groups restrict SSH to admin IPs only
- [ ] `docker compose version` runs successfully
- [ ] Non-root user can run Docker commands
- [ ] Setup documented and reproducible

## Files
- `docs/aws-setup.md` (new — setup documentation)
