#!/bin/bash
set -euo pipefail

# 3DFish Store Deployment Script
# Requires: VERCEL_TOKEN, NEON_API_KEY environment variables

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "ERROR: VERCEL_TOKEN not set"
  exit 1
fi

if [ -z "${NEON_API_KEY:-}" ]; then
  echo "ERROR: NEON_API_KEY not set"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== Step 1: Create Neon database ==="
NEON_PROJECT=$(npx neonctl projects create --name "3dfish-store" --api-key "$NEON_API_KEY" --output json 2>/dev/null)
NEON_PROJECT_ID=$(echo "$NEON_PROJECT" | node -e "process.stdin.on('data',d=>{const p=JSON.parse(d);console.log(p.project?.id||p.id)})")
echo "Neon project: $NEON_PROJECT_ID"

DATABASE_URL=$(npx neonctl connection-string --project-id "$NEON_PROJECT_ID" --api-key "$NEON_API_KEY" 2>/dev/null)
echo "Database URL obtained"

echo "=== Step 2: Run Prisma migrations ==="
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
echo "Migrations applied"

echo "=== Step 3: Seed database ==="
DATABASE_URL="$DATABASE_URL" npx prisma db seed || echo "Seed skipped or failed (non-critical)"

echo "=== Step 4: Generate secrets ==="
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=$(openssl rand -base64 16)

echo "=== Step 5: Deploy to Vercel ==="
npx vercel pull --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
npx vercel link --yes --token "$VERCEL_TOKEN" 2>/dev/null || true

npx vercel env add DATABASE_URL production --token "$VERCEL_TOKEN" <<< "$DATABASE_URL" 2>/dev/null || true
npx vercel env add NEXTAUTH_SECRET production --token "$VERCEL_TOKEN" <<< "$NEXTAUTH_SECRET" 2>/dev/null || true
npx vercel env add NEXTAUTH_URL production --token "$VERCEL_TOKEN" <<< "https://3dfish.vercel.app" 2>/dev/null || true
npx vercel env add ADMIN_PASSWORD production --token "$VERCEL_TOKEN" <<< "$ADMIN_PASSWORD" 2>/dev/null || true
npx vercel env add STRIPE_SECRET_KEY production --token "$VERCEL_TOKEN" <<< "REPLACE_WITH_STRIPE_SECRET_KEY" 2>/dev/null || true
npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production --token "$VERCEL_TOKEN" <<< "REPLACE_WITH_STRIPE_PUBLISHABLE_KEY" 2>/dev/null || true

echo "=== Step 6: Production deployment ==="
DEPLOY_URL=$(npx vercel deploy --prod --yes --token "$VERCEL_TOKEN" 2>&1 | tail -1)
echo "Deployed to: $DEPLOY_URL"

echo ""
echo "=== Deployment Complete ==="
echo "URL: $DEPLOY_URL"
echo "Admin password: $ADMIN_PASSWORD"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo ""
echo "Next steps:"
echo "1. Configure Stripe test keys in Vercel dashboard"
echo "2. Set up Stripe webhook to: $DEPLOY_URL/api/webhooks/stripe"
echo "3. Update NEXTAUTH_URL to actual domain"
