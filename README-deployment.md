# KnowledgeVerse Production Deployment Guide

This guide will help you deploy KnowledgeVerse to a CloudCone VPS with multi-user authentication support.

## Prerequisites

- CloudCone VPS with Ubuntu 20.04+ or similar Linux distribution
- Domain name pointed to your VPS IP address
- Google Cloud Console project for OAuth setup
- OpenAI API key

## Pre-deployment Setup

### 1. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local development)
7. Save the Client ID and Client Secret

### 2. Environment Variables Setup

1. Copy `.env.production` to `.env` on your VPS
2. Update the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://knowledgeverse_user:YOUR_SECURE_PASSWORD@localhost:5432/knowledgeverse?sslmode=require"

# ChromaDB Configuration
CHROMADB_URL="http://localhost:8000"

# OpenAI API Configuration
OPENAI_API_KEY="your-openai-api-key"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-secure-random-string-minimum-32-characters"
NEXTAUTH_URL="https://your-domain.com"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# PostgreSQL Password (used by Docker Compose)
POSTGRES_PASSWORD="your-secure-database-password"
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

1. **Upload files to your VPS:**
   ```bash
   scp -r . user@your-vps-ip:/home/user/knowledgeverse/
   ```

2. **SSH into your VPS:**
   ```bash
   ssh user@your-vps-ip
   cd knowledgeverse
   ```

3. **Make deployment script executable:**
   ```bash
   chmod +x deploy.sh
   ```

4. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

5. **Follow the prompts and enter your domain name when asked**

6. **Reboot the system:**
   ```bash
   sudo reboot
   ```

### Method 2: Manual Deployment

#### Step 1: System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx ufw git

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
```

#### Step 2: Firewall Configuration

```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

#### Step 3: Application Setup

```bash
# Create application directory
sudo mkdir -p /opt/knowledgeverse
sudo chown $USER:$USER /opt/knowledgeverse

# Clone or copy your application
cd /opt/knowledgeverse
# Copy your files here

# Set up environment variables
cp .env.production .env
# Edit .env with your actual values
```

#### Step 4: Docker Deployment

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
sleep 30

# Run database migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

#### Step 5: Nginx Configuration

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/knowledgeverse

# Update domain name in config
sudo sed -i 's/your-domain.com/youractual-domain.com/g' /etc/nginx/sites-available/knowledgeverse

# Enable site
sudo ln -s /etc/nginx/sites-available/knowledgeverse /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### Step 6: SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Post-deployment Configuration

### 1. Verify Services

```bash
# Check if all containers are running
docker-compose -f /opt/knowledgeverse/docker-compose.prod.yml ps

# Check application logs
docker-compose -f /opt/knowledgeverse/docker-compose.prod.yml logs -f app

# Check nginx status
sudo systemctl status nginx
```

### 2. Test the Application

1. Visit `https://your-domain.com`
2. Try logging in with Google OAuth
3. Create a knowledge entry
4. Test search functionality

### 3. Set Up Monitoring (Optional)

```bash
# Install htop for system monitoring
sudo apt install htop

# Set up log rotation for Docker
sudo nano /etc/logrotate.d/docker-containers
```

Add to the file:
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
```

## Backup and Maintenance

### Automated Backups

The deployment script sets up daily backups at 2 AM. Backups include:
- PostgreSQL database dump
- ChromaDB vector data

### Manual Backup

```bash
# Database backup
docker-compose -f /opt/knowledgeverse/docker-compose.prod.yml exec postgres pg_dump -U knowledgeverse_user knowledgeverse > backup_$(date +%Y%m%d).sql

# ChromaDB backup
docker cp knowledgeverse-chromadb:/chroma/chroma ./chromadb_backup_$(date +%Y%m%d)
```

### Updates

```bash
cd /opt/knowledgeverse
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

### Common Issues

1. **Application not accessible:**
   - Check if containers are running: `docker ps`
   - Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify firewall settings: `sudo ufw status`

2. **Database connection errors:**
   - Check PostgreSQL container: `docker logs knowledgeverse-postgres`
   - Verify DATABASE_URL in .env file

3. **OAuth not working:**
   - Verify Google OAuth credentials
   - Check NEXTAUTH_URL matches your domain
   - Ensure redirect URIs are correctly configured in Google Console

4. **SSL certificate issues:**
   - Run: `sudo certbot certificates`
   - Renew manually: `sudo certbot renew`

### Useful Commands

```bash
# View all logs
docker-compose -f /opt/knowledgeverse/docker-compose.prod.yml logs -f

# Restart specific service
docker-compose -f /opt/knowledgeverse/docker-compose.prod.yml restart app

# Access database
docker-compose -f /opt/knowledgeverse/docker-compose.prod.yml exec postgres psql -U knowledgeverse_user -d knowledgeverse

# Check disk usage
df -h
docker system df
```

## Security Considerations

1. **Regular Updates:**
   - Keep the system updated: `sudo apt update && sudo apt upgrade`
   - Update Docker images regularly

2. **Firewall:**
   - Only necessary ports are open (22, 80, 443)
   - Consider changing SSH port from default 22

3. **Backups:**
   - Automated daily backups are configured
   - Test backup restoration periodically

4. **SSL:**
   - SSL certificates auto-renew via cron job
   - Strong SSL configuration in nginx

## Support

If you encounter issues during deployment:

1. Check the logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure your domain DNS is properly configured
4. Check that all required ports are open and services are running

For additional support, refer to the main README.md file or create an issue in the project repository.