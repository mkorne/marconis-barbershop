#!/bin/bash
set -e

DOMAIN="barbering.marconi.com"
APP_DIR="/var/www/marconis-barbershop"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo "=========================================="
echo "  Marconi's Barber Shop - Production Setup"
echo "=========================================="

# 1. Install system dependencies
echo "[1/8] Installing system dependencies..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx postgresql postgresql-contrib nodejs npm

# 2. Setup PostgreSQL database
echo "[2/8] Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER barber_app WITH PASSWORD 'barber2024';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE marconis_barbershop OWNER barber_app;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE marconis_barbershop TO barber_app;" 2>/dev/null || true

# 3. Install app dependencies
echo "[3/8] Installing app dependencies..."
cd "$BACKEND_DIR"
npm ci --production
cd "$FRONTEND_DIR"
npm ci

# 4. Generate Prisma client and run migrations
echo "[4/8] Running database migrations..."
cd "$BACKEND_DIR"
cp .env.production .env
npx prisma generate
npx prisma migrate deploy

# 5. Seed database
echo "[5/8] Seeding database..."
node prisma/seed.js

# 6. Configure Nginx
echo "[6/8] Configuring Nginx..."
sudo cp "$APP_DIR/nginx.conf" /etc/nginx/sites-available/$DOMAIN
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# 7. Setup SSL certificate
echo "[7/8] Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m info@marconis.com

# 8. Start application with PM2
echo "[8/8] Starting application..."
cd "$BACKEND_DIR"
pm2 delete marconis-barbershop 2>/dev/null || true
pm2 start src/server.js --name marconis-barbershop -i max --env production
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp /home/$(whoami)
sudo systemctl reload nginx

echo ""
echo "=========================================="
echo "  Deployment complete!"
echo "  https://$DOMAIN"
echo "  Admin: admin / admin123"
echo "=========================================="