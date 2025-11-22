# Quick Setup Guide

## Prerequisites

- Node.js 20+ installed
- npm installed
- Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
npm install
```

If you encounter peer dependency warnings, use:
```bash
npm install --legacy-peer-deps
```

## Step 2: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Wait for the project to be ready (takes ~2 minutes)
3. Go to Project Settings → API
4. Copy the following values:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key (keep this secret!)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Keep your existing `DATABASE_URL` for Neon (during transition)

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the contents of `server/migrations/0001_supabase_schema.sql`
5. Click "Run" (or press Ctrl+Enter)
6. Wait for it to complete
7. Create a new query and run `server/migrations/0002_rls_policies.sql`
8. Verify tables were created by checking "Table Editor" in the sidebar

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 5: Generate TypeScript Types

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Generate types (replace YOUR_PROJECT_ID with your actual project ID)
supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/types/src/supabase.ts
```

**Note**: You can find your project ID in the Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`

## Step 6: Verify Setup

### Test Server

```bash
npm run dev
```

The server should start on port 5000. You should see:
```
✓ serving on port 5000
```

### Test tRPC Endpoint

Open your browser and visit:
```
http://localhost:5000/api/trpc/steps.getAll?input=%7B%22program%22%3A%22NA%22%7D
```

This should return an empty array `[]` (since no steps are seeded yet).

## Step 7: Set Up Mobile App (Optional)

```bash
cd apps/mobile
npm install
npx expo install
npx expo start
```

## Step 8: Set Up Web Portal (Optional)

```bash
cd apps/web
npm install
npm run dev
```

The web portal will start on `http://localhost:3000`

## Troubleshooting

### "Missing env: SUPABASE_URL"
- Make sure you created `.env` file from `.env.example`
- Check that environment variables are spelled correctly
- Restart your dev server after changing `.env`

### "Failed to mount tRPC router"
- Check that all tRPC dependencies are installed: `npm install`
- Verify `packages/api/src/routers/_app.ts` exists
- Check server console for detailed error messages

### Database Migration Errors
- Make sure you're running migrations in order (0001 first, then 0002)
- Check that UUID extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- Verify you have the correct permissions in Supabase

### TypeScript Errors
- Run `npm run check` to see all TypeScript errors
- Make sure you generated Supabase types (Step 5)
- Verify all dependencies are installed

## Next Steps

1. **Seed Initial Data**: Create a script to populate the `steps` table with NA/AA step definitions
2. **Set Up Authentication**: Configure Supabase Auth providers (Email, Google, etc.)
3. **Test RLS Policies**: Create test users and verify RLS policies work correctly
4. **Implement UI**: Connect React components to tRPC endpoints
5. **Set Up CI/CD**: Configure GitHub Actions for automated testing

## Useful Commands

```bash
# Type check
npm run check

# Run tests
npm test

# Lint code
npm run lint

# Generate database migrations (Drizzle)
npm run db:generate

# Push database changes (Drizzle)
npm run db:push
```

## Architecture Overview

- **Backend**: Express.js server with tRPC at `/api/trpc`
- **Database**: Supabase (PostgreSQL) with RLS policies
- **Mobile**: Expo React Native app with SQLite offline cache
- **Web**: Next.js 14 App Router for sponsor portal
- **API**: Type-safe tRPC endpoints with Zod validation
- **Auth**: Supabase Auth with NextAuth adapter (web)

## Security Notes

- ✅ Service role key is NEVER exposed to client
- ✅ RLS policies enforce access control
- ✅ All API endpoints validate input with Zod
- ✅ Sensitive operations are logged in audit_log table
- ✅ PostHog analytics is opt-in only
- ✅ No PII is tracked in analytics

