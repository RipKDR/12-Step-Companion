# Quick Test Guide

After setup, test these to verify everything works:

## 1. Test Supabase Connection

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Run: `SELECT COUNT(*) FROM profiles;`
3. If it works → ✅ Tables exist
4. If error "relation does not exist" → Run migrations first

## 2. Test tRPC Endpoint

**Start server:**
```bash
npm run dev
```

**Test endpoint:**
Open in browser:
```
http://localhost:5000/api/trpc/steps.getAll?input={"program":"NA"}
```

**Expected result:**
- ✅ Returns `[]` (empty array) = Working, just no data yet
- ✅ Returns array of steps = Working with data
- ❌ 404 or error = Check server console

## 3. Seed Steps Data

```bash
npm run seed:steps
```

**Expected output:**
```
✅ Inserted NA Step 1: Step One
✅ Inserted NA Step 2: Step Two
...
```

## 4. Test Again

After seeding, test the endpoint again:
```
http://localhost:5000/api/trpc/steps.getAll?input={"program":"NA"}
```

Should now return 12 steps!

## 5. Test in Component

In your React component:
```typescript
import { trpc } from "@/lib/trpc";

function MyComponent() {
  const { data: steps } = trpc.steps.getAll.useQuery({ program: "NA" });
  return <div>{steps?.length || 0} steps loaded</div>;
}
```

## Troubleshooting

**"Cannot connect to Supabase"**
- Check `.env` has correct `SUPABASE_URL`
- Verify internet connection
- Check Supabase project is active

**"Table does not exist"**
- Run migrations in Supabase SQL Editor
- Check you're using the right project

**"tRPC endpoint not found"**
- Make sure server is running
- Check `server/routes.ts` mounts tRPC correctly
- Look at server console for errors

**"Seed script fails"**
- Make sure tables exist first
- Check JSON files exist in `public/content/steps/`
- Verify Supabase connection works

## Success Checklist

- [ ] Supabase connection works
- [ ] All tables exist
- [ ] tRPC endpoint responds
- [ ] Seed script runs successfully
- [ ] Can query steps from component

Once all checked, you're ready to build! 🚀

