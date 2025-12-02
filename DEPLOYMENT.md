# Deployment Guide - Hostinger VPS

This guide covers deploying Gone Off to a Hostinger VPS.

## Prerequisites

- Hostinger VPS with Ubuntu 22.04+
- SSH access to the VPS
- Domain name pointed to VPS IP

## Server Setup

### 1. Connect to VPS

```bash
ssh root@your-vps-ip
```

### 2. Update System

```bash
apt update && apt upgrade -y
```

### 3. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # Verify: v20.x.x
```

### 4. Install MySQL

```bash
apt install -y mysql-server
mysql_secure_installation
```

Create database and user:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE gone_off;
CREATE USER 'goneoff'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON gone_off.* TO 'goneoff'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Install PM2

```bash
npm install -g pm2
```

### 6. Install Nginx

```bash
apt install -y nginx
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

## Application Deployment

### 1. Create App Directory

```bash
mkdir -p /var/www/gone-off
cd /var/www/gone-off
```

### 2. Clone Repository

```bash
git clone https://github.com/your-username/gone-off.git .
```

Or upload files via SFTP/SCP.

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
```

Set the database URL:

```env
DATABASE_URL="mysql://goneoff:your-secure-password@localhost:3306/gone_off"
```

### 5. Setup Database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 6. Build Application

```bash
npm run build
```

### 7. Start with PM2

```bash
pm2 start npm --name "gone-off" -- start
pm2 save
pm2 startup
```

## Nginx Configuration

### 1. Create Site Config

```bash
nano /etc/nginx/sites-available/gone-off
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # PWA files
    location /sw.js {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "no-cache";
    }

    location /manifest.json {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "no-cache";
    }
}
```

### 2. Enable Site

```bash
ln -s /etc/nginx/sites-available/gone-off /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## SSL with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renewal is configured automatically.

## PM2 Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check app status |
| `pm2 logs gone-off` | View logs |
| `pm2 restart gone-off` | Restart app |
| `pm2 stop gone-off` | Stop app |
| `pm2 delete gone-off` | Remove app |
| `pm2 monit` | Monitor resources |

## Updating the Application

```bash
cd /var/www/gone-off
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart gone-off
```

Or create an update script:

```bash
nano /var/www/gone-off/update.sh
```

```bash
#!/bin/bash
cd /var/www/gone-off
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart gone-off
echo "Update complete!"
```

```bash
chmod +x update.sh
./update.sh
```

## Troubleshooting

### Check Logs

```bash
# Application logs
pm2 logs gone-off

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

### Common Issues

**Port 3000 in use:**
```bash
lsof -i :3000
kill -9 <PID>
pm2 restart gone-off
```

**Database connection failed:**
```bash
mysql -u goneoff -p gone_off
# Test connection, check credentials in .env
```

**Nginx 502 Bad Gateway:**
```bash
pm2 status  # Check if app is running
pm2 restart gone-off
```

**Permission issues:**
```bash
chown -R www-data:www-data /var/www/gone-off
chmod -R 755 /var/www/gone-off
```

## Monitoring

### Setup PM2 Monitoring (Optional)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### System Resources

```bash
htop          # CPU/Memory usage
df -h         # Disk space
free -m       # Memory
```

## Backup

### Database Backup

```bash
mysqldump -u goneoff -p gone_off > backup_$(date +%Y%m%d).sql
```

### Automated Daily Backup

```bash
crontab -e
```

Add:
```
0 2 * * * mysqldump -u goneoff -p'your-password' gone_off > /var/backups/gone-off-$(date +\%Y\%m\%d).sql
```

## Security Recommendations

1. **Firewall**: Only allow ports 22, 80, 443
2. **SSH**: Use key-based authentication, disable password login
3. **MySQL**: Use strong passwords, don't expose externally
4. **Updates**: Regular `apt update && apt upgrade`
5. **Fail2ban**: Install to prevent brute force attacks

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```
