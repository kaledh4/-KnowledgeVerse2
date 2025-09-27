# KnowledgeVerse

A modern knowledge management application built with Next.js, Supabase, and Prisma.

## Features

- 🔐 **Simple Authentication** - Email/password authentication with Supabase
- 📚 **Knowledge Management** - Store and organize your knowledge entries
- 🎨 **Modern UI** - Beautiful interface built with Tailwind CSS and Radix UI
- 🚀 **Easy Deployment** - Ready for CapRover deployment on CloudCone
- 🗄️ **PostgreSQL Database** - Powered by Supabase PostgreSQL

## Quick Start

### Prerequisites

- Node.js 18 or later
- A Supabase account and project
- (Optional) CapRover instance for deployment

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd KnowledgeVerse
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration
DATABASE_URL="postgresql://postgres.your_ref:[YOUR-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.your_ref:[YOUR-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

### 3. Database Setup

Generate the Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your connection strings
4. The application will automatically create the required tables when you run `npx prisma db push`

## Authentication

The application uses Supabase Auth with email/password authentication:

- Users can register with email and password
- Simple login/logout functionality
- Protected routes redirect to authentication page
- User session management with React Context

## Deployment with CapRover

This application is configured for easy deployment with CapRover on CloudCone.

### Prerequisites

- CapRover instance running on CloudCone
- Domain configured for your CapRover instance

### Deployment Steps

1. **Prepare your repository**: Ensure your code is in a Git repository

2. **Create app in CapRover**:
   - Log into your CapRover dashboard
   - Create a new app (e.g., "knowledgeverse")
   - Enable HTTPS if desired

3. **Set environment variables** in CapRover:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_database_connection_string
   DIRECT_URL=your_direct_database_connection_string
   ```

4. **Deploy**:
   - Use CapRover's Git integration to connect your repository
   - Or upload a tarball of your project
   - CapRover will automatically build using the included `Dockerfile`

### CapRover Configuration Files

- `captain-definition`: Tells CapRover to use Docker
- `Dockerfile`: Multi-stage build optimized for production
- `.dockerignore`: Excludes unnecessary files from Docker build

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── contexts/           # React contexts (Auth)
│   ├── lib/                # Utilities and configurations
│   └── types/              # TypeScript type definitions
├── prisma/
│   └── schema.prisma       # Database schema
├── captain-definition      # CapRover deployment config
├── Dockerfile             # Docker configuration
└── .dockerignore          # Docker ignore rules
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Deployment**: Docker + CapRover

## Support

For issues and questions, please check the documentation or create an issue in the repository.
