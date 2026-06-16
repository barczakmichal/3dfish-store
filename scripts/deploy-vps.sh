#!/bin/bash
set -euo pipefail

# 3DFish Store — VPS Deployment Script (fully dockerized)
# Usage: ./scripts/deploy-vps.sh <VPS_HOST> [SSH_USER=root]
#
# Deploys: PostgreSQL + Next.js app + Nginx + Certbot (all Docker)
# Domain: treefish.pl

VPS_HOST="${1:?Usage: $0 <VPS_HOST> [SSH_USER]}"
SSH_USER="${2:-root}"
APP_DIR="/opt/treefish"

echo "=== Deploying 3DFish Store to $SSH_USER@$VPS_HOST ==="

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

# Preserve existing .env on re-deploy
if [ ! -f .env ]; then
  cat > .env <<EOF
DB_PASSWORD=$DB_PASSWORD
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ADMIN_PASSWORD=$ADMIN_PASSWORD
STRIPE_SECRET_KEY=REPLACE_WITH_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=REPLACE_WITH_STRIPE_PUBLISHABLE_KEY
EOF
  chmod 600 .env
  echo "Created .env with generated secrets"
else
  echo "Existing .env preserved"
fi

# Start with HTTP-only nginx for certbot challenge
cp nginx/treefish-initial.conf nginx/active.conf
cp nginx/active.conf nginx/treefish.conf

docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d db app nginx

echo "Waiting for database..."
sleep 8

# Run migrations + seed
docker compose --profile init run --rm migrate
echo "Migrations applied"

echo "Containers started"
REMOTE_DEPLOY

echo "=== Step 4: SSL certificate ==="
ssh "$SSH_USER@$VPS_HOST" bash -s <<'REMOTE_SSL'
set -euo pipefail
cd /opt/treefish

docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d treefish.pl -d www.treefish.pl \
  --email michal@geekwork.pl \
  --agree-tos --non-interactive || {
  echo ""
  echo "WARNING: SSL failed — DNS may not point here yet."
  echo "After DNS propagation, run on VPS:"
  echo "  cd /opt/treefish"
  echo "  docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d treefish.pl -d www.treefish.pl --email michal@geekwork.pl --agree-tos --non-interactive"
  echo "  cp nginx/treefish.conf.ssl nginx/treefish.conf"
  echo "  docker compose restart nginx"
  exit 0
}

# SSL obtained — switch to full config
cp nginx/treefish.conf nginx/treefish.conf.initial
# The main treefish.conf from the repo has SSL enabled
# We need to copy the SSL version over active config
cat > nginx/treefish.conf <<'NGINXSSL'
upstream nextjs {
    server app:3000;
}

server {
    listen 80;
    server_name treefish.pl www.treefish.pl;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name treefish.pl www.treefish.pl;

    ssl_certificate /etc/letsencrypt/live/treefish.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/treefish.pl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location /_next/static/ {
        proxy_pass http://nextjs;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXSSL

docker compose restart nginx
docker compose up -d certbot

echo "SSL configured and auto-renewal enabled"
REMOTE_SSL

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
echo "1. Point DNS A records: treefish.pl → $VPS_HOST, www.treefish.pl → $VPS_HOST"
echo "2. Update Stripe keys in $APP_DIR/.env on VPS"
echo "3. Re-run SSL if it failed (see output above)"
echo "4. Set Stripe webhook URL: https://treefish.pl/api/webhooks/stripe"
