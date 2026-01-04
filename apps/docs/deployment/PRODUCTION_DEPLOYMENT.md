# Production Deployment Guide

Complete guide for deploying the 12-Step Companion application to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Railway Deployment](#railway-deployment)
- [Docker Deployment](#docker-deployment)
- [Mobile App Deployment (EAS)](#mobile-app-deployment-eas)
- [Database Migrations](#database-migrations)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. **Node.js 20+** installed
2. **pnpm 8+** installed (`npm install -g pnpm`)
3. **Supabase Project** created and configured
4. **Environment Variables** prepared (see below)
5. **Git Repository** with code pushed

---

## Environment Variables

### Required Variables

#### Web App (Next.js)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Base URL of your application (e.g., `https://your-app.vercel.app`)

#### Server (Express/tRPC)
- `SUPABASE_URL` - Supabase project URL (server-side)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (server-side)
- `DATABASE_URL` - PostgreSQL connection string (optional, for direct DB access)
- `PORT` - Server port (defaults to 3000)

#### Mobile App (Expo)
- `EXPO_PUBLIC_API_URL` - API URL for mobile app
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase URL for mobile app
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key for mobile app

### Optional Variables

- `GEMINI_API_KEY` - Google Gemini API key for AI sponsor chat feature
- `SENTRY_DSN` - Sentry DSN for error tracking
- `POSTHOG_KEY` - PostHog key for analytics (opt-in only)

### Validation

Validate your environment variables before deploying:

```bash
pnpm run validate:env
```

---

## Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Link Your Project

```bash
vercel link
```

Follow the prompts to link your project to Vercel.

### Step 3: Configure Environment Variables

In the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables (see above)

Or use the CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
# ... add all other variables
```

### Step 4: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Step 5: Verify Deployment

1. Check build logs in Vercel dashboard
2. Visit your deployment URL
3. Test health endpoints:
   - `https://your-app.vercel.app/api/health`
   - `https://your-app.vercel.app/api/ready`

### Vercel Configuration

The `vercel.json` file is already configured:
- Build command: `pnpm --filter 12-step-companion-web build`
- Output directory: `apps/web/.next`
- Framework: Next.js

### Custom Domain

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update `NEXTAUTH_URL` environment variable

---

## Railway Deployment

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize Project

```bash
railway init
```

### Step 4: Configure Environment Variables

In Railway dashboard:
1. Go to your project
2. Click on "Variables"
3. Add all required environment variables

Or use the CLI:

```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL=your-url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
# ... add all other variables
```

### Step 5: Deploy

```bash
railway up
```

Railway will automatically:
- Build the Docker image using `Dockerfile`
- Run migrations (if configured)
- Start the application

### Step 6: Verify Deployment

1. Check Railway logs: `railway logs`
2. Visit your Railway URL
3. Test health endpoints

### Railway Configuration

The `railway.json` file is configured:
- Builder: Dockerfile
- Start command: `cd apps/web && pnpm start`
- Restart policy: ON_FAILURE (max 10 retries)

---

## Docker Deployment

### Step 1: Build Docker Image

```bash
docker build -t 12-step-companion .
```

### Step 2: Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e NEXTAUTH_SECRET=your-secret \
  -e NEXTAUTH_URL=http://localhost:3000 \
  12-step-companion
```

### Step 3: Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

### Dockerfile Details

The Dockerfile uses a multi-stage build:
1. **Base stage**: Installs dependencies
2. **Build stage**: Builds Next.js app
3. **Production stage**: Minimal runtime image

---

## Mobile App Deployment (EAS)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login

```bash
eas login
```

### Step 3: Configure EAS

The `apps/mobile/eas.json` file is already configured with:
- **development**: Development client builds
- **preview**: Internal distribution builds
- **production**: App store builds

### Step 4: Configure Environment Variables

Set EAS secrets:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value your-api-url
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value your-supabase-url
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-anon-key
```

### Step 5: Build

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Step 6: Submit to App Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

### EAS Configuration

The `apps/mobile/eas.json` includes:
- Development builds with simulator support
- Preview builds for internal testing
- Production builds optimized for app stores

---

## Database Migrations

### Running Migrations

Migrations are located in `server/migrations/`:

1. **Supabase Schema** (`0001_supabase_schema.sql`)
2. **RLS Policies** (`0002_rls_policies.sql`)
3. **Sponsor Codes** (`0003_sponsor_codes.sql`)

### Manual Migration

```bash
# Using Supabase CLI
supabase db push

# Or using the migration script
pnpm run db:migrate
```

### Automatic Migrations

For production, migrations should run automatically:

**Vercel**: Use Vercel Postgres or run migrations in a build hook
**Railway**: Use Railway Postgres and run migrations in startup script
**Docker**: Add migration step to Dockerfile or startup script

### Migration Script Example

Add to your deployment startup:

```bash
#!/bin/bash
# Run migrations before starting app
pnpm run db:migrate || echo "Migration failed, continuing..."
cd apps/web && pnpm start
```

---

## Health Checks

The application includes health check endpoints:

### `/api/health`

Simple health check - returns 200 OK if service is running.

```bash
curl https://your-app.vercel.app/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "12-step-companion-web"
}
```

### `/api/ready`

Readiness check - returns 200 OK if service is ready to serve traffic. Checks database connectivity.

```bash
curl https://your-app.vercel.app/api/ready
```

Response:
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### Configuring Health Checks

**Vercel**: Health checks are automatically configured
**Railway**: Configure in Railway dashboard under "Health Checks"
**Docker**: Use health check in docker-compose.yml:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## Troubleshooting

### Build Failures

1. **Check TypeScript errors**:
   ```bash
   pnpm run type-check:all
   ```

2. **Validate environment variables**:
   ```bash
   pnpm run validate:env
   ```

3. **Check build logs** for specific errors

### Deployment Issues

1. **Vercel**: Check build logs in dashboard
2. **Railway**: Check logs with `railway logs`
3. **Docker**: Check logs with `docker logs <container-id>`

### Database Connection Issues

1. Verify `DATABASE_URL` or Supabase credentials
2. Check RLS policies are applied
3. Verify network connectivity

### Mobile Build Issues

1. Check EAS build logs: `eas build:list`
2. Verify environment variables are set as secrets
3. Check `apps/mobile/app.config.js` for correct configuration

### Common Errors

**Error: Missing environment variable**
- Solution: Add missing variable to deployment platform

**Error: TypeScript compilation failed**
- Solution: Run `pnpm run type-check:all` locally and fix errors

**Error: Build artifact missing**
- Solution: Ensure `pnpm run build:production` completes successfully

**Error: Database migration failed**
- Solution: Check database connection and run migrations manually

---

## Production Readiness Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] TypeScript compiles without errors (`pnpm run type-check:all`)
- [ ] Production build succeeds (`pnpm run build:production`)
- [ ] Build validation passes (`pnpm run validate`)
- [ ] Database migrations are applied
- [ ] Health checks are working (`/api/health` and `/api/ready`)
- [ ] SSL/TLS is configured (HTTPS)
- [ ] Error tracking is configured (Sentry)
- [ ] Analytics is configured (PostHog, opt-in)
- [ ] Custom domain is configured (if applicable)
- [ ] Monitoring and alerts are set up

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review build logs
3. Check GitHub issues
4. Contact the development team

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Docker Documentation](https://docs.docker.com)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Supabase Documentation](https://supabase.com/docs)

