# 🎯 Action Plan - What to Do Next

## ✅ Current Status
- ✅ Setup completed
- ✅ Environment variables configured
- ✅ `@supabase/supabase-js` added to package.json
- ⏳ Need to install dependencies
- ⏳ Need to run database migrations
- ⏳ Need to verify everything works

## 📋 Step-by-Step Action Plan

### Step 1: Install Missing Dependency ⚠️ REQUIRED

```bash
npm install @supabase/supabase-js
# or if using pnpm:
pnpm add @supabase/supabase-js
```

**Why**: The verification script needs this package to test Supabase connection.

---

### Step 2: Run Database Migrations ⚠️ REQUIRED

**In Supabase Dashboard:**

1. Go to your Supabase project → **SQL Editor**
2. Open `server/migrations/0001_supabase_schema.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for success message
7. Repeat for `server/migrations/0002_rls_policies.sql`

**Verify tables exist:**
- Go to **Table Editor** in Supabase
- You should see: `profiles`, `steps`, `step_entries`, `daily_entries`, `action_plans`, `routines`, `sponsor_relationships`, etc.

---

### Step 3: Verify Setup ✅

```bash
npm run verify
```

**Expected output:**
```
✅ Environment Variables: ✅
✅ Supabase Connection: ✅
✅ Database Tables: ✅
✅ tRPC Endpoints: ✅
✅ Seed Data: ⚠️ (will be empty until you seed)
```

If any checks fail, fix those issues first.

---

### Step 4: Seed Initial Data 📊

```bash
npm run seed:steps
```

This populates the `steps` table with NA/AA step definitions.

**Expected output:**
```
✅ Inserted NA Step 1: Step One
✅ Inserted NA Step 2: Step Two
...
✅ Inserted NA Step 12: Step Twelve
```

---

### Step 5: Test the API 🧪

**Start the dev server:**
```bash
npm run dev
```

**Test in browser:**
Open: `http://localhost:5000/api/trpc/steps.getAll?input={"program":"NA"}`

**Expected result:**
- Should return JSON array with 12 steps
- If empty array `[]`, check seed script ran successfully

---

### Step 6: Start Developing 🚀

Now you can start building features!

#### Option A: Update Existing Components

1. **Migrate components to use tRPC:**
   ```typescript
   // Before (old way)
   const [steps, setSteps] = useState([]);
   
   // After (new way)
   import { trpc } from "@/lib/trpc";
   const { data: steps } = trpc.steps.getAll.useQuery({ program: "NA" });
   ```

2. **Start with these files:**
   - `client/src/routes/Steps.tsx` → Use `trpc.steps.getAll.useQuery()`
   - `client/src/routes/Journal.tsx` → Use `trpc.dailyEntries.*` hooks
   - See `client/src/components/examples/` for examples

#### Option B: Build New Features

1. **Sponsor Connection UI**
   - Generate sponsor code
   - Enter sponsor code
   - View shared data

2. **Action Plans UI**
   - Create/edit action plans
   - Trigger on geofence enter

3. **Routines UI**
   - Schedule routines
   - Log completions
   - Push notifications

---

## 🎯 Quick Reference

### Useful Commands

```bash
# Install dependencies
npm install

# Verify setup
npm run verify

# Seed steps data
npm run seed:steps

# Start dev server
npm run dev

# Type check
npm run check

# Run tests
npm test
```

### Key Files

- **tRPC Hooks**: `client/src/hooks/` - Custom hooks for all endpoints
- **Example Components**: `client/src/components/examples/` - See how to use hooks
- **Migration Guide**: `docs/TRPC_MIGRATION_GUIDE.md` - How to migrate components
- **API Reference**: `docs/API_REFERENCE.md` - All available endpoints

### Testing Checklist

- [ ] Dependencies installed
- [ ] Database migrations run
- [ ] Verification script passes
- [ ] Seed script runs successfully
- [ ] tRPC endpoint returns data
- [ ] Can query from React component

---

## 🐛 Troubleshooting

### "Cannot find package '@supabase/supabase-js'"
**Fix**: Run `npm install` or `pnpm install`

### "Table does not exist"
**Fix**: Run migrations in Supabase SQL Editor

### "tRPC endpoint 404"
**Fix**: 
1. Make sure server is running: `npm run dev`
2. Check server console for errors
3. Verify Express mounts tRPC at `/api/trpc`

### "Seed script fails"
**Fix**:
1. Make sure tables exist (run migrations)
2. Check JSON files exist in `public/content/steps/`
3. Verify Supabase connection works

---

## 📚 Next Steps After Verification

Once everything is verified:

1. **Migrate existing components** to use tRPC hooks
2. **Build sponsor connection** UI
3. **Implement action plans** UI
4. **Add routines** with notifications
5. **Test RLS policies** with multiple users
6. **Deploy** to production

---

## ✨ Success!

You'll know everything is working when:
- ✅ `npm run verify` passes all checks
- ✅ tRPC endpoint returns data
- ✅ Can query from React components
- ✅ Seed script runs without errors

**Ready to build! 🚀**

