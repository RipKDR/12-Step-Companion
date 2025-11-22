# Setup Verification Checklist

Since you've completed the setup, verify these items:

## ✅ Environment Variables

Check your `.env` file has:

```env
# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (long JWT token)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (VERY long JWT token, 200+ chars)

# Mobile App (REQUIRED for mobile)
EXPO_PUBLIC_API_URL=http://localhost:5000
# Or your production URL: https://your-api.com
```

**Important Notes:**
- Service role key should be a JWT token (starts with `eyJhbGci...`)
- Get it from: Supabase Dashboard → Settings → API → `service_role` secret key
- EXPO_PUBLIC_API_URL should be a URL, not a token/key

## ✅ Database Migrations

**Check in Supabase Dashboard:**
1. Go to "Table Editor"
2. Verify these tables exist:
   - profiles
   - steps
   - step_entries
   - daily_entries
   - action_plans
   - routines
   - sponsor_relationships

**If tables are missing:**
1. Go to "SQL Editor"
2. Copy/paste `server/migrations/0001_supabase_schema.sql`
3. Click "Run"
4. Repeat for `server/migrations/0002_rls_policies.sql`

## ✅ Test Connection

**Option 1: Use verification script**
```bash
npm run verify
```

**Option 2: Manual test**
1. Start server: `npm run dev`
2. Open browser: `http://localhost:5000/api/trpc/steps.getAll?input={"program":"NA"}`
3. Should return `[]` (empty) or array of steps

## ✅ Seed Data

If tables exist but are empty:
```bash
npm run seed:steps
```

This populates the steps table with NA/AA step definitions.

## 🎯 What to Do Next

Once verified:

1. **Start developing**
   - Use tRPC hooks in components
   - See `client/src/hooks/` for examples
   - See `client/src/components/examples/` for component patterns

2. **Test mobile app** (optional)
   ```bash
   cd apps/mobile
   npm install
   npx expo start
   ```

3. **Test web portal** (optional)
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

4. **Migrate existing components**
   - Follow `docs/TRPC_MIGRATION_GUIDE.md`
   - Replace local state with tRPC hooks
   - Start with read-only queries, then add mutations

## 🐛 Common Issues

**"Invalid service role key"**
- Service role key should be 200+ characters
- Get from: Supabase Dashboard → Settings → API
- Copy the entire `service_role` secret key (not anon key)

**"Table does not exist"**
- Run migrations in Supabase SQL Editor
- Check you're using the correct Supabase project

**"tRPC endpoint 404"**
- Make sure server is running: `npm run dev`
- Check server console for errors
- Verify Express mounts tRPC at `/api/trpc`

## 📚 Helpful Files

- `VERIFY_SETUP.md` - Detailed verification steps
- `QUICK_TEST.md` - Quick test guide
- `SETUP_GUIDE.md` - Complete setup instructions
- `NEXT_STEPS.md` - What to do after setup
- `docs/TRPC_MIGRATION_GUIDE.md` - How to migrate components

## ✨ Success Indicators

You'll know setup is complete when:
- ✅ Server starts without errors
- ✅ tRPC endpoint returns data (or empty array)
- ✅ Can query from React components using hooks
- ✅ Tables exist in Supabase
- ✅ Seed script runs successfully

**Ready to build! 🚀**
