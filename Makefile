.PHONY: up down status logs

up:
	@echo "Starting DDEV (Drupal)..."
	cd drupal-site && ddev start
	@echo "Starting Platform (PostgreSQL + Next.js)..."
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
