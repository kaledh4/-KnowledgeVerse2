# CapRover Deployment Guide for KnowledgeVerse

This guide will help you deploy your KnowledgeVerse application to CapRover on an Ubuntu VPS using the `cloudcone` branch.

## Prerequisites

- Ubuntu VPS (minimum 1GB RAM, 1 CPU core)
- Domain name pointing to your VPS IP
- SSH access to your VPS
- Docker installed on your VPS

## Step 1: Install CapRover on Ubuntu VPS

### 1.1 Connect to your VPS
```bash
ssh root@your-vps-ip
```

### 1.2 Install Docker (if not already installed)
```bash
# Update package index
apt update

# Install required packages
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Add Docker repository
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
apt update
apt install -y docker-ce

# Start and enable Docker
systemctl start docker
systemctl enable docker
```

### 1.3 Install CapRover
```bash
# Install CapRover globally
docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover
```

### 1.4 Setup CapRover
```bash
# Install CapRover CLI
npm install -g caprover

# Setup CapRover (run this from your local machine)
caprover serversetup
```

Follow the prompts:
- Enter your VPS IP address
- Enter your domain (e.g., `yourdomain.com`)
- Enter your email for Let's Encrypt SSL
- Choose a password for CapRover dashboard

## Step 2: Access CapRover Dashboard

1. Open your browser and go to `https://captain.yourdomain.com`
2. Login with the password you set during setup
3. You should see the CapRover dashboard

## Step 3: Deploy KnowledgeVerse Application

### 3.1 Create a New App in CapRover

1. In the CapRover dashboard, go to "Apps"
2. Click "Create New App"
3. Enter app name: `knowledgeverse`
4. Click "Create New App"

### 3.2 Configure Environment Variables

Go to your app settings and add these environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_supabase_database_url

# NextAuth (if using)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://knowledgeverse.yourdomain.com

# Other environment variables as needed
NODE_ENV=production
```

### 3.3 Deploy from GitHub

1. In your app settings, go to "Deployment" tab
2. Select "Deploy from Github/Bitbucket/Gitlab"
3. Enter your repository details:
   - Repository: `https://github.com/kaledh4/-KnowledgeVerse2`
   - Branch: `cloudcone`
   - Username: `your_github_username`
   - Password/Token: `your_github_token`

4. Click "Save & Update"

### 3.4 Configure Build Settings

The app will use the existing `captain-definition` file which contains:

```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

### 3.5 Enable HTTPS and Custom Domain

1. Go to "HTTP Settings" in your app
2. Enable "HTTPS"
3. Enable "Redirect HTTP to HTTPS"
4. Add your custom domain if desired (e.g., `knowledgeverse.yourdomain.com`)

## Step 4: Database Setup

### 4.1 Run Prisma Migrations

After deployment, you may need to run database migrations:

1. Go to your app in CapRover
2. Open "App Logs" to monitor the deployment
3. The Dockerfile already includes Prisma generate and deploy commands

### 4.2 Verify Database Connection

Check the app logs to ensure:
- Prisma client is generated successfully
- Database connection is established
- No migration errors

## Step 5: Monitoring and Maintenance

### 5.1 View Application Logs
- Go to your app in CapRover dashboard
- Click on "App Logs" to view real-time logs
- Monitor for any errors or issues

### 5.2 Update Application
To update your application:
1. Push changes to the `cloudcone` branch
2. In CapRover, go to your app's "Deployment" tab
3. Click "Force Rebuild" to trigger a new deployment

### 5.3 Scale Application
- Go to "App Configs" in your app settings
- Adjust "Instance Count" to scale horizontally
- Increase "Memory Limit" if needed

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check app logs for specific error messages
   - Verify all environment variables are set correctly
   - Ensure the `cloudcone` branch has all necessary files

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check Supabase project settings
   - Ensure database is accessible from your VPS IP

3. **SSL Certificate Issues**
   - Ensure domain DNS is pointing to your VPS
   - Wait for Let's Encrypt certificate generation
   - Check CapRover logs for SSL-related errors

4. **Memory Issues**
   - Increase memory limit in app settings
   - Consider upgrading VPS if consistently running out of memory

## Security Considerations

1. **Firewall Configuration**
   ```bash
   # Configure UFW firewall
   ufw allow ssh
   ufw allow 80
   ufw allow 443
   ufw allow 3000
   ufw enable
   ```

2. **Regular Updates**
   ```bash
   # Keep system updated
   apt update && apt upgrade -y
   
   # Update CapRover
   docker pull caprover/caprover
   ```

3. **Backup Strategy**
   - Regular database backups via Supabase
   - Consider VPS snapshots
   - Keep environment variables backed up securely

## Support and Resources

- CapRover Documentation: https://caprover.com/docs/
- CapRover GitHub: https://github.com/caprover/caprover
- Community Support: CapRover Slack Group

Your KnowledgeVerse application should now be successfully deployed and accessible at your configured domain!