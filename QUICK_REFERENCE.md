# Quick Reference Card

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase
# - Create project at https://supabase.com
# - Add credentials to .env

# 3. Run migrations
# - Copy SQL from server/migrations/0001_supabase_schema.sql
# - Run in Supabase SQL Editor
# - Repeat for 0002_rls_policies.sql

# 4. Generate types
supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/types/src/supabase.ts

# 5. Seed data
npm run seed:steps

# 6. Start dev server
npm run dev
```

## 📝 Common Tasks

### Using tRPC in Components

```typescript
import { trpc } from "@/lib/trpc";

// Query
const { data, isLoading } = trpc.steps.getAll.useQuery({ program: "NA" });

// Mutation
const mutation = trpc.dailyEntries.upsert.useMutation();
await mutation.mutateAsync({ gratitude: "I'm grateful for..." });
```

### Using Custom Hooks

```typescript
import { useSteps, useTodaysEntry } from "@/hooks/useSteps";
import { useDailyEntries } from "@/hooks/useDailyEntries";

const { steps } = useSteps("NA");
const { entry } = useTodaysEntry("UTC");
const { entries } = useDailyEntries();
```

## 🔑 Environment Variables

```env
# Required for Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Optional
DATABASE_URL=postgresql://...  # Keep for Neon during transition
SENTRY_DSN=https://...
POSTHOG_API_KEY=xxx
```

## 📁 Key File Locations

- **tRPC Routers**: `packages/api/src/routers/`
- **Custom Hooks**: `client/src/hooks/use*.ts`
- **Example Components**: `client/src/components/examples/`
- **Migrations**: `server/migrations/*.sql`
- **Seed Scripts**: `server/scripts/seed-*.ts`
- **Documentation**: `docs/` and root `*.md` files

## 🛠️ NPM Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run check        # TypeScript type check
npm run test         # Run tests
npm run lint         # Lint code
npm run seed:steps   # Seed steps table
npm run seed:sample  # Seed sample data
```

## 🔍 Testing Endpoints

```bash
# Test tRPC endpoint
curl "http://localhost:5000/api/trpc/steps.getAll?input=%7B%22program%22%3A%22NA%22%7D"

# Or use browser:
# http://localhost:5000/api/trpc/steps.getAll?input={"program":"NA"}
```

## 📚 Documentation

- **Setup**: `SETUP_GUIDE.md`
- **Next Steps**: `NEXT_STEPS.md`
- **Migration**: `docs/TRPC_MIGRATION_GUIDE.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Checklist**: `IMPLEMENTATION_CHECKLIST.md`

## 🐛 Troubleshooting

**"Missing env: SUPABASE_URL"**
→ Check `.env` file exists and has correct variable names

**"Failed to mount tRPC router"**
→ Run `npm install` to ensure all dependencies are installed

**TypeScript errors**
→ Generate Supabase types: `supabase gen types typescript`

**Migration errors**
→ Run migrations in order (0001, then 0002)

## 💡 Quick Tips

- Use custom hooks (`useSteps`, `useDailyEntries`, etc.) instead of calling tRPC directly
- Check example components in `client/src/components/examples/` for patterns
- All mutations automatically invalidate related queries
- Use `enabled` option for conditional queries
- Handle errors with user-friendly messages

## 🔗 Useful Links

- Supabase Dashboard: https://supabase.com/dashboard
- tRPC Docs: https://trpc.io
- React Query Docs: https://tanstack.com/query
- Supabase Docs: https://supabase.com/docs

