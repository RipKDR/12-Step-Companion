# Verify Your Setup

Since you've completed the setup, here's how to verify everything is working:

## Quick Verification Steps

### 1. Check Environment Variables

Make sure your `.env` file has these variables set:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: The service role key should be a long JWT token (200+ characters). If yours is short, you might have copied the wrong key.

### 2. Test Supabase Connection

You can test the connection in two ways:

**Option A: Using the verification script**
```bash
npm run verify
```

**Option B: Manual test in Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Click "SQL Editor"
3. Run: `SELECT COUNT(*) FROM profiles;`
4. If it works, tables exist. If you get "relation does not exist", run migrations.

### 3. Verify Tables Exist

Check these tables exist in Supabase Dashboard → Table Editor:
- ✅ profiles
- ✅ steps
- ✅ step_entries
- ✅ daily_entries
- ✅ action_plans
- ✅ routines
- ✅ sponsor_relationships
- ✅ (and others)

If tables are missing, run migrations:
1. Go to SQL Editor in Supabase
2. Copy contents of `server/migrations/0001_supabase_schema.sql`
3. Paste and run
4. Repeat for `server/migrations/0002_rls_policies.sql`

### 4. Test tRPC Endpoint

Start your dev server:
```bash
npm run dev
```

Then test the endpoint:
- Browser: `http://localhost:5000/api/trpc/steps.getAll?input=%7B%22program%22%3A%22NA%22%7D`
- Should return: `[]` (empty array if no steps seeded yet)

### 5. Seed Initial Data

If tables exist but are empty:
```bash
npm run seed:steps
```

This will populate the `steps` table with NA/AA step definitions.

## Common Issues

### "Missing env: SUPABASE_URL"
- Check `.env` file exists in project root
- Verify variable names match exactly (case-sensitive)
- Restart dev server after changing `.env`

### "Table does not exist"
- Run migrations in Supabase SQL Editor
- Check you're using the correct project

### "Invalid service role key"
- Service role key should be 200+ characters
- Get it from: Supabase Dashboard → Settings → API → `service_role` secret key
- Make sure you copied the entire key

### tRPC endpoint returns 404
- Make sure dev server is running: `npm run dev`
- Check server console for errors
- Verify tRPC is mounted at `/api/trpc`

## What's Working If...

✅ **Setup is complete when:**
- Environment variables are set
- Supabase connection works
- All tables exist
- tRPC endpoint returns data (or empty array)
- Seed script runs without errors

## Next Steps After Verification

Once everything is verified:

1. **Start developing**: Components can now use tRPC hooks
2. **Test mobile app**: `cd apps/mobile && npm install && npx expo start`
3. **Test web portal**: `cd apps/web && npm install && npm run dev`
4. **Migrate components**: Use hooks from `client/src/hooks/` to replace local state

## Need Help?

- Check `SETUP_GUIDE.md` for detailed setup instructions
- Check `NEXT_STEPS.md` for what to do next
- Check `docs/TRPC_MIGRATION_GUIDE.md` for migrating components

