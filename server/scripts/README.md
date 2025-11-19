# Database Seed Scripts

Scripts to populate the database with initial data.

## Prerequisites

1. Supabase project must be set up
2. Environment variables must be configured (`.env` file)
3. Database migrations must be run (`0001_supabase_schema.sql`)

## Available Scripts

### Seed Steps

Populates the `steps` table with NA/AA step definitions from JSON files.

```bash
npm run seed:steps
```

**What it does:**
- Reads step JSON files from `public/content/steps/`
- Extracts prompts from each step's questions
- Inserts or updates steps in the database for both NA and AA programs
- Handles missing files gracefully

**File format expected:**
- `public/content/steps/1.json` through `12.json`
- Or program-specific: `1-na.json`, `1-aa.json`, etc.

**Output:**
- Creates 12 steps for NA program
- Creates 12 steps for AA program (uses same content if AA-specific files don't exist)

## Creating Custom Seed Scripts

To create a new seed script:

1. Create a new file in `server/scripts/`
2. Import `supabaseServer` from `../lib/supabase.js`
3. Use Supabase client to insert/update data
4. Add npm script to `package.json`:
   ```json
   "seed:your-script": "tsx server/scripts/your-script.ts"
   ```

## Notes

- Seed scripts use the service role key (bypasses RLS)
- Scripts are idempotent (safe to run multiple times)
- Always check for existing data before inserting
- Use transactions for related data when possible

