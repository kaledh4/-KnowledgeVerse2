# Deployment Guide

This guide covers deploying KnowledgeVerse to production environments, specifically Vercel.

## Database Configuration

### Development (SQLite)
For local development, the application uses SQLite:

```bash
# Use SQLite schema
cp prisma/schema-sqlite.prisma prisma/schema.prisma

# Run migrations
npm run db:migrate:dev

# Generate Prisma client
npm run db:generate:dev
```

### Production (PostgreSQL)
For production deployment, use PostgreSQL:

1. **Set up PostgreSQL database** (recommended: Vercel Postgres, Supabase, or Neon)

2. **Update environment variables:**
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   ```

3. **Run migrations:**
   ```bash
   # The main schema.prisma is already configured for PostgreSQL
   npx prisma migrate deploy
   ```

## Vercel Deployment

### Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres recommended)
- ChromaDB instance (ChromaDB Cloud or self-hosted)
- OpenAI API key

### Environment Variables
Set these in your Vercel dashboard:

```env
DATABASE_URL="postgresql://..."
CHROMADB_URL="https://your-chromadb-instance.com"
OPENAI_API_KEY="sk-..."
NEXTAUTH_SECRET="your-secure-secret"
NEXTAUTH_URL="https://your-app.vercel.app"
```

### Deployment Steps

1. **Connect repository to Vercel**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure build settings**
   - Build command: `npm run build` (already configured in vercel.json)
   - Output directory: `.next`

3. **Set environment variables**
   - Add all required environment variables in Vercel dashboard

4. **Deploy**
   - Push to main branch or manually trigger deployment

### Database Migration
After deployment, run database migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

## ChromaDB Setup

### Option 1: ChromaDB Cloud (Recommended)
1. Sign up for ChromaDB Cloud
2. Create a new database
3. Use the provided URL in `CHROMADB_URL`

### Option 2: Self-hosted
1. Deploy ChromaDB to a cloud provider
2. Ensure it's accessible from your Vercel deployment
3. Update `CHROMADB_URL` accordingly

### Option 3: Fallback Mode
The application includes fallback handling for ChromaDB unavailability:
- Vector search will be skipped
- Only text-based search will be used
- Application continues to function normally

## Troubleshooting

### Database Issues
- Ensure PostgreSQL connection string is correct
- Check that database exists and is accessible
- Verify SSL settings if required

### ChromaDB Issues
- Test ChromaDB connectivity from your deployment region
- Check CORS settings if using self-hosted ChromaDB
- Monitor application logs for ChromaDB warnings

### Build Issues
- Ensure all environment variables are set
- Check that Prisma client generation succeeds
- Verify Node.js version compatibility (18+)

## Monitoring
- Monitor Vercel function logs for errors
- Set up alerts for database connection issues
- Track ChromaDB availability and performance