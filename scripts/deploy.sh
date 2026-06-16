#!/bin/bash
set -euo pipefail

# TreeFish Store - VPS Deployment Script
# Usage: ./scripts/deploy.sh <VPS_HOST> [SSH_USER]
#
# Prerequisites on VPS:
#   - SSH access configured
#   - Domain treefish.pl DNS A record pointing to VPS IP

VPS_HOST="${1:?Usage: $0 <VPS_HOST> [SSH_USER]}"
SSH_USER="${2:-root}"
REMOTE_DIR="/opt/treefish"
SSH_OPTS="-o StrictHostKeyChecking=accept-new"

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== TreeFish VPS Deployment ==="
echo "Host: $SSH_USER@$VPS_HOST"
echo "Remote dir: $REMOTE_DIR"

echo ""
echo "=== Step 1: Verify Docker on VPS ==="
ssh $SSH_OPTS "$SSH_USER@$VPS_HOST" bash <<'REMOTE_DOCKER'
if ! command -v docker &>/dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi
docker --version
docker compose version
echo "Docker OK"
REMOTE_DOCKER

echo ""
echo "=== Step 2: Setup .env on VPS ==="
ssh $SSH_OPTS "$SSH_USER@$VPS_HOST" bash <<REMOTE_ENV
mkdir -p $REMOTE_DIR
if [ ! -f "$REMOTE_DIR/.env" ]; then
    DB_PASSWORD=\$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
    NEXTAUTH_SECRET=\$(openssl rand -base64 32)
    ADMIN_PASSWORD=\$(openssl rand -base64 16 | tr -d '/+=' | head -c 16)

    cat > "$REMOTE_DIR/.env" <<EOF
DB_PASSWORD=\$DB_PASSWORD
NEXTAUTH_SECRET=\$NEXTAUTH_SECRET
ADMIN_PASSWORD=\$ADMIN_PASSWORD
STRIPE_SECRET_KEY=sk_test_REPLACE_ME
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_ME
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_ME
EOF
    echo "Created .env with generated secrets"
    echo "ADMIN_PASSWORD=\$ADMIN_PASSWORD"
    echo ">>> Update Stripe keys in $REMOTE_DIR/.env <<<"
else
    echo ".env already exists, skipping"
fi
REMOTE_ENV

echo ""
echo "=== Step 3: Sync project files ==="
rsync -avz --delete \
    --exclude node_modules \
    --exclude .next \
    --exclude .git \
    --exclude '.env*' \
    --exclude '*.pem' \
    --exclude '*.key' \
    --exclude .vercel \
    --exclude tsconfig.tsbuildinfo \
    --exclude next-env.d.ts \
    -e "ssh $SSH_OPTS" \
    ./ "$SSH_USER@$VPS_HOST:$REMOTE_DIR/"
echo "Files synced"

echo ""
echo "=== Step 4: SSL Certificate ==="
ssh $SSH_OPTS "$SSH_USER@$VPS_HOST" bash <<REMOTE_SSL
cd $REMOTE_DIR
if [ ! -d "/etc/letsencrypt/live/treefish.pl" ]; then
    echo "Obtaining SSL certificate..."
    cp nginx/treefish-initial.conf nginx/treefish-active.conf
    mv nginx/treefish.conf nginx/treefish-ssl.conf
    cp nginx/treefish-active.conf nginx/treefish.conf

    docker compose up -d nginx
    sleep 3

    docker compose run --rm certbot certonly \
        --webroot --webroot-path=/var/www/certbot \
        -d treefish.pl -d www.treefish.pl \
        --email michal@geekwork.pl \
        --agree-tos --non-interactive

    docker compose down
    mv nginx/treefish-ssl.conf nginx/treefish.conf
    echo "SSL certificate obtained"
else
    echo "SSL certificate already exists"
fi
REMOTE_SSL

echo ""
echo "=== Step 5: Build and deploy ==="
ssh $SSH_OPTS "$SSH_USER@$VPS_HOST" bash <<REMOTE_DEPLOY
cd $REMOTE_DIR
docker compose build app
docker compose --profile init run --rm migrate
docker compose up -d db app nginx certbot

echo "Waiting for services..."
sleep 10
docker compose ps
REMOTE_DEPLOY

echo ""
echo "=== Step 6: Verify ==="
sleep 5
HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" "https://treefish.pl" 2>/dev/null || echo "000")
if [ "\$HTTP_STATUS" = "200" ]; then
    echo "SUCCESS: treefish.pl is live (HTTP \$HTTP_STATUS)"
else
    echo "WARNING: Got HTTP \$HTTP_STATUS"
    echo "Check logs: ssh $SSH_USER@$VPS_HOST 'cd $REMOTE_DIR && docker compose logs'"
fi

echo ""
echo "=== Deployment Complete ==="
echo "Site: https://treefish.pl"
echo "Admin: https://treefish.pl/admin/login"
echo ""
echo "Next steps:"
echo "1. Update Stripe keys in $REMOTE_DIR/.env on VPS"
echo "2. Restart: ssh $SSH_USER@$VPS_HOST 'cd $REMOTE_DIR && docker compose restart app'"
echo "3. Stripe webhook: https://treefish.pl/api/webhooks/stripe"
