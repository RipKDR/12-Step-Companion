# Database Migrations

This directory contains SQL migration files for Supabase database setup.

## Migration Order

1. `0001_supabase_schema.sql` - Creates all tables, enums, and indexes
2. `0002_rls_policies.sql` - Creates Row Level Security (RLS) policies

## Running Migrations

### Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order
4. Verify tables and policies are created correctly

### Manual Migration

1. Connect to your Supabase database using psql or Supabase SQL Editor
2. Run `0001_supabase_schema.sql` first
3. Run `0002_rls_policies.sql` second
4. Verify all tables and policies exist

## Migration Strategy

- **Dual Database Support**: Migrations are designed to work alongside existing Neon database
- **Backward Compatible**: Existing Neon schema remains unchanged
- **RLS First**: All tables have RLS enabled by default
- **Indexes**: All foreign keys and commonly queried columns are indexed

## Testing Migrations

After running migrations:

1. Verify all tables exist: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
2. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
3. Test RLS policies with different user contexts
4. Verify indexes exist: `SELECT indexname FROM pg_indexes WHERE schemaname = 'public';`

## Rollback

If you need to rollback migrations:

1. Drop RLS policies: `DROP POLICY IF EXISTS ... ON table_name;`
2. Drop tables in reverse order (respecting foreign key constraints)
3. Drop enums: `DROP TYPE IF EXISTS enum_name;`

## Notes

- All `user_id` columns reference `auth.users.id` (Supabase Auth)
- Timestamps use `timestamp` type (not `timestamptz`) for consistency
- JSONB columns are used for flexible schema (arrays, objects)
- All tables have `created_at` and `updated_at` timestamps where applicable

