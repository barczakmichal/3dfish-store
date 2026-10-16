#!/bin/bash
set -euo pipefail

# treefish Store — VPS Deployment Script
# Usage: ./scripts/deploy-vps.sh <VPS_HOST> [SSH_USER=root]
#
# Deploys: PostgreSQL + Next.js app behind existing Traefik proxy
# Domain: treefish.pl (SSL handled by Traefik + Let's Encrypt)

VPS_HOST="${1:?Usage: $0 <VPS_HOST> [SSH_USER]}"
SSH_USER="${2:-root}"
APP_DIR="/opt/treefish"

echo "=== Deploying treefish Store to $SSH_USER@$VPS_HOST ==="

DB_PASSWORD="$(openssl rand -hex 20)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
ADMIN_PASSWORD="$(openssl rand -base64 16)"

echo "=== Step 1: Prepare VPS ==="
ssh "$SSH_USER@$VPS_HOST" bash -s <<'REMOTE_SETUP'
set -euo pipefail

if ! command -v docker &>/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

if ! docker compose version &>/dev/null; then
  echo "Installing Docker Compose plugin..."
  apt-get update && apt-get install -y docker-compose-plugin
fi

docker network inspect webproxy &>/dev/null || docker network create webproxy
mkdir -p /opt/treefish
echo "VPS server ready"
REMOTE_SETUP

echo "=== Step 2: Upload project files ==="
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

tar czf /tmp/treefish-deploy.tar.gz \
  -C "$PROJECT_DIR" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='*.pem' \
  --exclude='*.key' \
  .

scp /tmp/treefish-deploy.tar.gz "$SSH_USER@$VPS_HOST:$APP_DIR/"
rm /tmp/treefish-deploy.tar.gz

echo "=== Step 3: Build and start containers ==="
ssh "$SSH_USER@$VPS_HOST" bash -s -- "$DB_PASSWORD" "$NEXTAUTH_SECRET" "$ADMIN_PASSWORD" <<'REMOTE_DEPLOY'
set -euo pipefail

DB_PASSWORD="$1"
NEXTAUTH_SECRET="$2"
ADMIN_PASSWORD="$3"
APP_DIR="/opt/treefish"

cd "$APP_DIR"

tar xzf treefish-deploy.tar.gz
rm treefish-deploy.tar.gz

if [ ! -f .env ]; then
  cat > .env <<EOF
DB_PASSWORD=$DB_PASSWORD
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ADMIN_PASSWORD=$ADMIN_PASSWORD
STRIPE_SECRET_KEY=REPLACE_WITH_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_STRIPE_WEBHOOK_SECRET
EOF
  chmod 600 .env
  echo "Created .env with generated secrets"
else
  echo "Existing .env preserved"
fi

docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d db app

echo "Waiting for database..."
sleep 8

docker compose --profile init run --rm migrate
echo "Migrations applied"

echo "Containers started — Traefik will auto-detect and route treefish.pl"
REMOTE_DEPLOY

echo ""
echo "=== Deployment Complete ==="
echo "Domain: https://treefish.pl"
echo ""
echo "Credentials (save these!):"
echo "  DB Password:    $DB_PASSWORD"
echo "  Admin Password: $ADMIN_PASSWORD"
echo "  NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo ""
echo "Next steps:"
echo "1. Point DNS A records: treefish.pl -> $VPS_HOST, www.treefish.pl -> $VPS_HOST"
echo "2. Update Stripe keys in $APP_DIR/.env on VPS"
echo "3. Set Stripe webhook URL: https://treefish.pl/api/webhooks/stripe"
