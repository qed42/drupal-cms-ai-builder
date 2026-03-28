#!/bin/sh
set -e

echo "[start-prod] Waiting for database..."

# Retry Prisma migrate until postgres is ready (max 30s)
RETRIES=10
DELAY=3
for i in $(seq 1 $RETRIES); do
  if cd /app/platform-app && npx prisma migrate deploy 2>&1; then
    echo "[start-prod] Prisma migrations applied successfully."
    break
  fi
  if [ "$i" = "$RETRIES" ]; then
    echo "[start-prod] ERROR: Prisma migrate failed after $RETRIES attempts."
    exit 1
  fi
  echo "[start-prod] Database not ready, retrying in ${DELAY}s (attempt $i/$RETRIES)..."
  sleep $DELAY
done

echo "[start-prod] Starting Next.js server..."

# Use exec so Node receives SIGTERM directly for graceful shutdown
cd /app
exec node platform-app/server.js
