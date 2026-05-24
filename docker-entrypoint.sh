#!/bin/sh
set -e

echo "→ Waiting for database…"
RETRIES=30
until npx --no-install prisma db execute --stdin <<<"SELECT 1" >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "  Database not reachable after 30s; aborting."
    exit 1
  fi
  sleep 1
done

echo "→ Applying Prisma migrations…"
npx --no-install prisma migrate deploy

echo "→ Seeding default super admin (idempotent)…"
npx --no-install prisma db seed || echo "  (seed skipped or already applied)"

echo "→ Starting Next.js…"
exec "$@"
