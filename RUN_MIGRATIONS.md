# How to Run Database Migrations

Since the tables don't exist yet, you need to run the migrations in Supabase.

## Quick Steps

### 1. Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### 2. Run First Migration (Create Tables)

1. Open `server/migrations/0001_supabase_schema.sql` in your code editor
2. **Copy the ENTIRE file** (all 284 lines)
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
5. Wait for success message: "Success. No rows returned"

**What this does:**
- Creates all 15+ tables (profiles, steps, step_entries, daily_entries, etc.)
- Sets up indexes
- Creates enums

### 3. Run Second Migration (RLS Policies)

1. Open `server/migrations/0002_rls_policies.sql` in your code editor
2. **Copy the ENTIRE file**
3. Paste into Supabase SQL Editor
4. Click **Run**
5. Wait for success message

**What this does:**
- Enables Row Level Security (RLS) on all tables
- Creates policies for owner access
- Creates policies for sponsor access
- Ensures data privacy

### 4. Verify Tables Exist

1. In Supabase Dashboard, click **Table Editor** in left sidebar
2. You should see these tables:
   - ✅ profiles
   - ✅ steps
   - ✅ step_entries
   - ✅ daily_entries
   - ✅ craving_events
   - ✅ action_plans
   - ✅ routines
   - ✅ routine_logs
   - ✅ sobriety_streaks
   - ✅ sponsor_relationships
   - ✅ trigger_locations
   - ✅ messages
   - ✅ notification_tokens
   - ✅ risk_signals
   - ✅ audit_log

## Common Issues

### "relation already exists"
- Some tables might already exist
- This is okay - the migration will skip existing tables
- Continue with the next migration

### "permission denied"
- Make sure you're using the SQL Editor (not a restricted view)
- Check you're logged into the correct project

### "syntax error"
- Make sure you copied the ENTIRE file
- Don't modify the SQL
- Check for any copy/paste errors

### Migration runs but tables don't appear
- Refresh the Table Editor page
- Check if you're looking at the correct schema (should be `public`)
- Try running a test query: `SELECT * FROM profiles LIMIT 1;`

## After Migrations

Once migrations are complete:

1. **Verify setup:**
   ```bash
   npm run verify
   ```

2. **Seed data:**
   ```bash
   npm run seed:steps
   ```

3. **Test API:**
   ```bash
   npm run dev
   ```
   Then visit: `http://localhost:5000/api/trpc/steps.getAll?input={"program":"NA"}`

## Alternative: Using Supabase CLI

If you prefer command line:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

But the SQL Editor method is easier for first-time setup!

## Need Help?

- Check migration files are complete
- Verify you're in the correct Supabase project
- Check `.env` has correct `SUPABASE_URL`
- Look at Supabase logs for detailed errors

