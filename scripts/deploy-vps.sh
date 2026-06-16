#!/bin/bash
set -euo pipefail

# 3DFish Store — VPS Deployment Script
# Usage: ./scripts/deploy-vps.sh <VPS_HOST> [SSH_USER=root]

VPS_HOST="${1:?Usage: $0 <VPS_HOST> [SSH_USER]}"
SSH_USER="${2:-root}"
APP_DIR="/opt/treefish"
REPO_URL="$(git remote get-url origin 2>/dev/null || echo '')"

echo "=== Deploying 3DFish Store to $SSH_USER@$VPS_HOST ==="

# --- Generate production secrets ---
DB_PASSWORD="$(openssl rand -hex 20)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
ADMIN_PASSWORD="$(openssl rand -base64 16)"

echo "=== Step 1: Prepare VPS server ==="
ssh "$SSH_USER@$VPS_HOST" bash -s <<'REMOTE_SETUP'
set -euo pipefail

# Install Docker if not present
if ! command -v docker &>/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

# Install docker compose plugin if not present
if ! docker compose version &>/dev/null; then
  echo "Installing Docker Compose plugin..."
  apt-get update && apt-get install -y docker-compose-plugin
fi

# Install Nginx if not present
if ! command -v nginx &>/dev/null; then
  echo "Installing Nginx..."
  apt-get update && apt-get install -y nginx
  systemctl enable --now nginx
fi

# Install Certbot if not present
if ! command -v certbot &>/dev/null; then
  echo "Installing Certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

# Create app directory
mkdir -p /opt/treefish
echo "VPS server ready"
REMOTE_SETUP

echo "=== Step 2: Upload project files ==="
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Create a clean tarball of the project (excluding dev files)
tar czf /tmp/treefish-deploy.tar.gz \
  -C "$PROJECT_DIR" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.pem' \
  --exclude='*.key' \
  .

scp /tmp/treefish-deploy.tar.gz "$SSH_USER@$VPS_HOST:/opt/treefish/"
rm /tmp/treefish-deploy.tar.gz

echo "=== Step 3: Deploy on VPS ==="
ssh "$SSH_USER@$VPS_HOST" bash -s -- "$DB_PASSWORD" "$NEXTAUTH_SECRET" "$ADMIN_PASSWORD" <<'REMOTE_DEPLOY'
set -euo pipefail

DB_PASSWORD="$1"
NEXTAUTH_SECRET="$2"
ADMIN_PASSWORD="$3"
APP_DIR="/opt/treefish"

cd "$APP_DIR"

# Extract project files
tar xzf treefish-deploy.tar.gz
rm treefish-deploy.tar.gz

# Create production .env
cat > .env <<EOF
DB_PASSWORD=$DB_PASSWORD
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ADMIN_PASSWORD=$ADMIN_PASSWORD
STRIPE_SECRET_KEY=REPLACE_WITH_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_STRIPE_WEBHOOK_SECRET
EOF
chmod 600 .env

# Build and start
docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

# Wait for DB to be healthy
echo "Waiting for database..."
sleep 5

# Run Prisma migrations + seed via the migrate service (has full deps including ts-node)
docker compose --profile init run --rm migrate
echo "Migrations and seed applied"

echo "Application started"
REMOTE_DEPLOY

echo "=== Step 4: Configure Nginx + SSL ==="
scp "$PROJECT_DIR/nginx/treefish.pl.conf" "$SSH_USER@$VPS_HOST:/etc/nginx/sites-available/treefish.pl"

ssh "$SSH_USER@$VPS_HOST" bash -s <<'REMOTE_NGINX'
set -euo pipefail

# Enable site
ln -sf /etc/nginx/sites-available/treefish.pl /etc/nginx/sites-enabled/treefish.pl
rm -f /etc/nginx/sites-enabled/default

# Test with HTTP-only first (for certbot)
cat > /etc/nginx/sites-available/treefish-http.conf <<'HTTPCONF'
server {
    listen 80;
    server_name treefish.pl www.treefish.pl;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
HTTPCONF

ln -sf /etc/nginx/sites-available/treefish-http.conf /etc/nginx/sites-enabled/treefish.pl
nginx -t && systemctl reload nginx

# Get SSL certificate
certbot --nginx -d treefish.pl -d www.treefish.pl --non-interactive --agree-tos -m michal@geekwork.pl || {
  echo "WARNING: SSL certificate failed — DNS may not be pointing to this server yet."
  echo "Run manually after DNS propagation: certbot --nginx -d treefish.pl -d www.treefish.pl"
}

# Restore full SSL config
ln -sf /etc/nginx/sites-available/treefish.pl /etc/nginx/sites-enabled/treefish.pl
rm -f /etc/nginx/sites-available/treefish-http.conf
nginx -t && systemctl reload nginx

echo "Nginx configured"
REMOTE_NGINX

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
echo "1. Point DNS A record for treefish.pl → $VPS_HOST"
echo "2. Point DNS A record for www.treefish.pl → $VPS_HOST"
echo "3. Update Stripe keys in /opt/treefish/.env on VPS"
echo "4. Re-run certbot if SSL failed: certbot --nginx -d treefish.pl -d www.treefish.pl"
echo "5. Set Stripe webhook URL: https://treefish.pl/api/webhooks/stripe"
