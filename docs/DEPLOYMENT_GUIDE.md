# 🚀 Deployment Guide - Marconi's Barber Shop

## 📋 Pre-Deployment Checklist

### 1. Development Environment Setup
- [x] Node.js 18+ installed
- [x] PostgreSQL database running
- [x] All environment variables configured
- [x] Application tested locally
- [x] Database migrations completed

### 2. Production Accounts Setup
- [ ] DigitalOcean account created
- [ ] Domain name purchased
- [ ] Paystack account verified
- [ ] Twilio account setup
- [ ] Cloudinary account setup

---

## 🌊 Phase 1: Database Setup (DigitalOcean Managed PostgreSQL)

### 1.1 Create Database Cluster
```bash
# Using DigitalOcean CLI (doctl)
doctl databases create marconis-db \
  --engine postgres \
  --version 14 \
  --region fra1 \
  --size db-s-1vcpu-1gb \
  --num-nodes 1
```

### 1.2 Get Connection Details
```bash
doctl databases connection marconis-db --format URL
```

### 1.3 Update Environment Variables
```bash
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

---

## 🖥️ Phase 2: Server Setup (DigitalOcean Droplet)

### 2.1 Create Droplet
```bash
# Create Ubuntu 22.04 droplet
doctl compute droplet create marconis-api \
  --region fra1 \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-2gb \
  --ssh-keys your-ssh-key-id
```

### 2.2 Initial Server Setup
```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

# Create app user
adduser --system --group --home /var/www/marconis marconis
```

### 2.3 Deploy Application
```bash
# Switch to app user
su - marconis

# Clone repository
git clone https://github.com/your-username/marconis-barbershop.git
cd marconis-barbershop

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install

# Build frontend
npm run build

# Setup environment
cp .env.example .env
nano .env  # Edit with production values
```

### 2.4 Database Setup
```bash
# Run migrations
cd backend
npx prisma migrate deploy

# Seed initial data
npm run seed
```

---

## 🔧 Phase 3: Process Management (PM2)

### 3.1 Create PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'marconis-api',
      script: 'src/server.js',
      cwd: '/var/www/marconis/marconis-barbershop/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/marconis-api-error.log',
      out_file: '/var/log/pm2/marconis-api-out.log',
      log_file: '/var/log/pm2/marconis-api.log',
      time: true,
      max_restarts: 10,
      restart_delay: 4000,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

### 3.2 Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

---

## 🌐 Phase 4: Nginx Configuration

### 4.1 Create Nginx Configuration
```nginx
# /etc/nginx/sites-available/marconis.com
server {
    listen 80;
    server_name marconis.com www.marconis.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/json application/xml+rss;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location / {
        root /var/www/marconis/marconis-barbershop/frontend/public;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

### 4.2 Enable Site
```bash
# Enable site
ln -s /etc/nginx/sites-available/marconis.com /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

## 🔒 Phase 5: SSL Certificate Setup

### 5.1 Obtain SSL Certificate
```bash
# Get certificate from Let's Encrypt
certbot --nginx -d marconis.com -d www.marconis.com

# Set up automatic renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Phase 6: Monitoring and Logging

### 6.1 Log Management
```bash
# Create log directories
mkdir -p /var/log/marconis
mkdir -p /var/log/pm2

# Setup log rotation
cat > /etc/logrotate.d/marconis << EOF
/var/log/marconis/*.log /var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 marconis marconis
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### 6.2 Monitoring Setup
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# Setup alerts
pm2 set pm2-server-monit:server_name "Marconis API"
pm2 set pm2-server-monit:secret_key "your-secret-key"
```

---

## 🗄️ Phase 7: Backup Strategy

### 7.1 Database Backup
```bash
# Create backup script
cat > /home/marconis/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/marconis"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
EOF

chmod +x /home/marconis/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/marconis/backup-db.sh
```

### 7.2 Application Backup
```bash
# Create application backup script
cat > /home/marconis/backup-app.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/marconis"
APP_DIR="/var/www/marconis/marconis-barbershop"

mkdir -p $BACKUP_DIR

# Backup application files (excluding node_modules)
tar --exclude='node_modules' --exclude='.git' -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www/marconis marconis-barbershop

# Keep only last 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "App backup completed: app_backup_$DATE.tar.gz"
EOF

chmod +x /home/marconis/backup-app.sh
```

---

## 🔥 Phase 8: Firewall Configuration

### 8.1 UFW Setup
```bash
# Enable UFW
ufw enable

# Allow essential ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Deny all other incoming traffic
ufw default deny incoming
ufw default allow outgoing

# Check status
ufw status
```

---

## 📱 Phase 9: Final Testing

### 9.1 Health Checks
```bash
# Test application health
curl -f http://your-domain.com/health

# Test API endpoints
curl -f https://your-domain.com/api/services

# Check SSL
curl -I https://your-domain.com
```

### 9.2 Performance Testing
```bash
# Install Apache Bench
apt install apache2-utils

# Test load
ab -n 1000 -c 10 https://your-domain.com/

# Monitor resources
htop
```

---

## 🚀 Phase 10: Go Live!

### 10.1 DNS Configuration
```bash
# Point your domain to the server IP
# A record: marconis.com -> your-server-ip
# CNAME record: www.marconis.com -> marconis.com
```

### 10.2 Final Checklist
- [ ] Database is accessible and seeded
- [ ] API endpoints are working
- [ ] Frontend loads correctly
- [ ] Payments are processing (test mode first)
- [ ] SMS notifications are sending
- [ ] SSL certificate is valid
- [ ] Monitoring is active
- [ ] Backups are scheduled
- [ ] Firewall is configured

---

## 📞 Support & Maintenance

### Daily Tasks
- Check PM2 status: `pm2 status`
- Monitor logs: `pm2 logs`
- Check disk space: `df -h`

### Weekly Tasks
- Update dependencies: `npm audit`
- Review error logs
- Check backup integrity

### Monthly Tasks
- Security updates: `apt update && apt upgrade`
- SSL certificate check: `certbot certificates`
- Performance review

---

## 🆘 Troubleshooting

### Common Issues

**Application won't start:**
```bash
pm2 logs marconis-api
pm2 restart marconis-api
```

**Database connection issues:**
```bash
# Test connection
node -e "console.log(process.env.DATABASE_URL)"
```

**High memory usage:**
```bash
pm2 restart marconis-api
pm2 monit
```

**SSL issues:**
```bash
certbot certificates
certbot renew --dry-run
```

---

## 📈 Scaling Considerations

### When to Scale:
- CPU usage consistently > 80%
- Memory usage > 85%
- Response times > 2 seconds
- Error rate > 1%

### Scaling Options:
1. **Vertical Scaling**: Upgrade droplet size
2. **Horizontal Scaling**: Add load balancer + multiple droplets
3. **Database Scaling**: Upgrade to larger database cluster
4. **CDN**: Use DigitalOcean Spaces + CDN

---

**🎉 Congratulations! Your barber shop website is now live and ready to serve customers!**

For support, contact: technical-support@marconis.com
