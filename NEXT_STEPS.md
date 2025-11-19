# Next Steps - Implementation Guide

## ✅ What's Been Completed

All core infrastructure has been implemented:

1. **Supabase Integration** - Client and server clients ready
2. **Database Schema** - All 15+ tables with migrations
3. **RLS Policies** - Comprehensive security policies
4. **tRPC APIs** - 7 routers with type-safe endpoints
5. **Mobile App Structure** - Expo setup with offline support
6. **Web Portal Structure** - Next.js 14 with NextAuth
7. **Seed Scripts** - Steps and sample data seeding
8. **Observability** - Sentry and PostHog setup
9. **Testing Infrastructure** - Templates and CI/CD

## 🚀 Immediate Next Steps

### 1. Install Dependencies

```bash
npm install
# or if you get peer dependency warnings:
npm install --legacy-peer-deps
```

### 2. Set Up Supabase

1. Create account at https://supabase.com
2. Create new project
3. Wait for project to initialize (~2 minutes)
4. Go to Project Settings → API
5. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your Supabase credentials
```

Required variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Database Migrations

**Option A: Supabase Dashboard (Easiest)**
1. Go to SQL Editor in Supabase dashboard
2. Run `server/migrations/0001_supabase_schema.sql`
3. Run `server/migrations/0002_rls_policies.sql`
4. Verify tables in Table Editor

**Option B: Supabase CLI**
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

### 5. Generate TypeScript Types

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/types/src/supabase.ts
```

Find your project ID in the Supabase dashboard URL.

### 6. Seed Initial Data

```bash
# Seed steps table (NA/AA)
npm run seed:steps

# Seed sample data (requires SAMPLE_USER_ID env var)
SAMPLE_USER_ID=your-user-id npm run seed:sample
```

### 7. Test the Setup

```bash
# Start dev server
npm run dev

# Test tRPC endpoint
curl "http://localhost:5000/api/trpc/steps.getAll?input=%7B%22program%22%3A%22NA%22%7D"
```

Should return an array of steps (empty if not seeded yet).

## 📋 Integration Checklist

### Client Integration

- [x] TRPCProvider integrated in `App.tsx`
- [ ] Update components to use tRPC hooks
  - Example: `const { data } = trpc.steps.getAll.useQuery({ program: "NA" })`
- [ ] Replace existing API calls with tRPC
- [ ] Test queries and mutations

### Mobile App Setup

```bash
cd apps/mobile
npm install
npx expo install
npx expo start
```

- [ ] Test SQLite offline cache
- [ ] Test location permissions
- [ ] Test notifications
- [ ] Connect to tRPC API

### Web Portal Setup

```bash
cd apps/web
npm install
npm run dev
```

- [ ] Configure NextAuth providers
- [ ] Test authentication flow
- [ ] Build sponsor dashboard UI
- [ ] Test RLS policies

## 🔧 Development Tasks

### High Priority

1. **Connect UI to tRPC**
   - Update `client/src/routes/Steps.tsx` to use `trpc.steps.getAll.useQuery()`
   - Update `client/src/routes/Journal.tsx` to use `trpc.dailyEntries.*` hooks
   - Replace existing API calls

2. **Implement Sponsor Connection UI**
   - Generate sponsor code
   - Enter sponsor code
   - View shared data

3. **Test RLS Policies**
   - Create test users
   - Verify owner access works
   - Verify sponsor access works
   - Verify unauthorized access is blocked

### Medium Priority

4. **Geofencing Implementation**
   - Complete background task handler
   - Test geofence triggers
   - Implement action plan auto-open

5. **Routine Notifications**
   - Set up Supabase Scheduled Functions
   - Test notification delivery
   - Handle notification clicks

6. **Data Export/Import**
   - Implement export to JSON/PDF
   - Implement import with conflict resolution
   - Test with real data

### Low Priority

7. **Testing**
   - Write unit tests for routers
   - Write integration tests
   - Write E2E tests

8. **Documentation**
   - API documentation
   - Component documentation
   - Deployment guide

## 🐛 Troubleshooting

### "Missing env: SUPABASE_URL"
- Check `.env` file exists and has correct variable names
- Restart dev server after changing `.env`

### "Failed to mount tRPC router"
- Verify all dependencies installed: `npm install`
- Check server console for detailed errors
- Verify `packages/api/src/routers/_app.ts` exists

### Migration Errors
- Run migrations in order (0001, then 0002)
- Check UUID extension is enabled
- Verify you have correct permissions

### TypeScript Errors
- Run `npm run check` to see all errors
- Generate Supabase types (step 5 above)
- Verify all dependencies installed

## 📚 Useful Commands

```bash
# Type check
npm run check

# Run tests
npm test

# Lint code
npm run lint

# Seed steps
npm run seed:steps

# Seed sample data
SAMPLE_USER_ID=xxx npm run seed:sample

# Generate database types (Drizzle)
npm run db:generate

# Push database changes (Drizzle)
npm run db:push
```

## 🎯 Success Criteria

You'll know everything is working when:

1. ✅ Server starts without errors
2. ✅ tRPC endpoint returns data: `/api/trpc/steps.getAll`
3. ✅ Database has all tables
4. ✅ RLS policies are enabled
5. ✅ Seed scripts run successfully
6. ✅ TypeScript types are generated
7. ✅ Client can query tRPC endpoints
8. ✅ Mobile app can connect (if set up)
9. ✅ Web portal authenticates (if set up)

## 📞 Need Help?

- Check `SETUP_GUIDE.md` for detailed setup instructions
- Check `docs/RISKS.md` for known issues and mitigations
- Check `IMPLEMENTATION_SUMMARY.md` for what was built
- Review `server/migrations/README.md` for migration help

Good luck! 🚀

