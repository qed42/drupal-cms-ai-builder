.PHONY: up down status logs dev prod

up:
	@echo "Starting DDEV (Drupal)..."
	cd drupal-site && ddev start
	@echo "Starting Platform (PostgreSQL + Next.js dev)..."
	docker compose up -d --build
	@echo "Running database migrations..."
	docker compose exec platform npx prisma db push
	@echo "All services running. Platform: http://localhost:3000"

down:
	docker compose down
	cd drupal-site && ddev stop

status:
	@echo "=== Platform Stack ==="
	@docker compose ps
	@echo ""
	@echo "=== Drupal (DDEV) ==="
	@cd drupal-site && ddev status

logs:
	docker compose logs -f platform

dev:
	@echo "Starting Next.js in dev mode..."
	docker compose up -d --build platform
	@echo "Dev server running: http://localhost:3000"

prod:
	@echo "Building and starting Next.js in production mode..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build platform
	@echo "Production server running: http://localhost:3000"
