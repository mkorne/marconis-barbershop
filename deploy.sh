#!/bin/bash

# Marconi's Barber Shop - Production Deployment Script
# This script automates the deployment process

set -e

echo "🚀 Starting deployment of Marconi's Barber Shop..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="barbering.marconi.com"
PROJECT_DIR="/var/www/marconis-barbershop"
BACKUP_DIR="/var/backups/marconis-barbershop"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Create backup
print_status "Creating backup..."
sudo mkdir -p $BACKUP_DIR
sudo tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C $PROJECT_DIR . 2>/dev/null || true

# Install dependencies
print_status "Installing backend dependencies..."
cd $PROJECT_DIR/backend && npm ci --production

print_status "Installing frontend dependencies..."
cd $PROJECT_DIR/frontend && npm ci

# Build frontend
print_status "Building frontend assets..."
npm run build

# Run database migrations
print_status "Running database migrations..."
cd $PROJECT_DIR/backend
npx prisma generate
npx prisma migrate deploy

# Restart services
print_status "Restarting application..."
pm2 reload ecosystem.config.js --env production

# Restart Nginx
print_status "Restarting Nginx..."
sudo systemctl reload nginx

# Health check
print_status "Performing health check..."
sleep 5
if curl -f "https://$DOMAIN/health" > /dev/null 2>&1; then
    print_status "✅ Deployment successful! Application is running at https://$DOMAIN"
else
    print_error "❌ Health check failed. Please check the logs."
    print_warning "Check PM2 logs: pm2 logs"
    print_warning "Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
    exit 1
fi

print_status "🎉 Deployment completed successfully!"
