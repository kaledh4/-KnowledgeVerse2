#!/bin/bash

# KnowledgeVerse Production Deployment Script
# This script automates the deployment process on a VPS

set -e  # Exit on any error

echo "🚀 Starting KnowledgeVerse deployment..."

# Configuration
APP_NAME="knowledgeverse"
APP_DIR="/opt/$APP_NAME"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found. Please create it with your production environment variables."
    exit 1
fi

print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing required packages..."
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx ufw

print_status "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

print_status "Setting up environment variables..."
cp .env.production .env

print_status "Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

print_status "Waiting for services to start..."
sleep 30

print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

print_status "Configuring Nginx..."
sudo cp nginx.conf $NGINX_CONF

# Update nginx.conf with actual domain
read -p "Enter your domain name (e.g., example.com): " DOMAIN
sudo sed -i "s/your-domain.com/$DOMAIN/g" $NGINX_CONF

# Enable the site
sudo ln -sf $NGINX_CONF $NGINX_ENABLED

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

print_status "Testing Nginx configuration..."
sudo nginx -t

print_status "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

print_status "Setting up SSL certificate with Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

print_status "Setting up automatic SSL renewal..."
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

print_status "Creating backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash
# Backup script for KnowledgeVerse
BACKUP_DIR="/opt/backups/knowledgeverse"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f /opt/knowledgeverse/docker-compose.prod.yml exec -T postgres pg_dump -U knowledgeverse_user knowledgeverse > $BACKUP_DIR/db_backup_$DATE.sql

# Backup ChromaDB data
docker cp knowledgeverse-chromadb:/chroma/chroma $BACKUP_DIR/chromadb_backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh
sudo mv backup.sh /opt/knowledgeverse/

print_status "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/knowledgeverse/backup.sh") | crontab -

print_status "Deployment completed successfully! 🎉"
print_status "Your KnowledgeVerse application should be available at: https://$DOMAIN"
print_status ""
print_status "Next steps:"
print_status "1. Configure your Google OAuth credentials in the Google Cloud Console"
print_status "2. Update your .env file with the correct API keys"
print_status "3. Test the application functionality"
print_status ""
print_status "Useful commands:"
print_status "- View logs: docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f"
print_status "- Restart services: docker-compose -f $APP_DIR/docker-compose.prod.yml restart"
print_status "- Update application: cd $APP_DIR && git pull && docker-compose -f docker-compose.prod.yml up -d --build"

print_warning "Please reboot the system to ensure all changes take effect:"
print_warning "sudo reboot"