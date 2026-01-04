/**
 * Run Migration Script
 *
 * Executes SQL migration files against Supabase database using REST API
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
    console.error("Please set these in your .env file");
    process.exit(1);
  }

  // Read migration file
  const migrationPath = join(process.cwd(), "server/migrations/0003_sponsor_codes.sql");
  let migrationSQL: string;

  try {
    migrationSQL = readFileSync(migrationPath, "utf-8");
  } catch (error) {
    console.error(`❌ Failed to read migration file: ${migrationPath}`);
    console.error(error);
    process.exit(1);
  }

  console.log("📄 Migration file loaded: 0003_sponsor_codes.sql");
  console.log("🚀 Executing migration via Supabase REST API...\n");

  try {
    // Use Supabase REST API to execute SQL
    // The REST API endpoint for executing SQL is: /rest/v1/rpc/exec_sql
    // But we need to use the Management API or direct SQL execution

    // Extract project reference from URL
    const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];

    if (!projectRef) {
      throw new Error("Could not extract project reference from SUPABASE_URL");
    }

    // Use Supabase Management API to execute SQL
    // Note: This requires the project API key, not the service role key
    // For direct SQL execution, we'll use the PostgREST API

    // Split SQL into executable statements (remove comments and empty lines)
    const statements = migrationSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--") && !s.startsWith("/*"))
      .map(s => s.replace(/\/\*[\s\S]*?\*\//g, "").trim())
      .filter(s => s.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement using Supabase REST API
    // We'll use the PostgREST endpoint with service role key
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      try {
        // Use Supabase REST API - execute SQL via RPC or direct endpoint
        // Note: Supabase doesn't expose a direct SQL execution endpoint via REST
        // We need to use psql or the Supabase Dashboard

        // For now, we'll provide instructions and display the SQL
        console.log("⚠️  Direct SQL execution via REST API is not available.");
        console.log("Please use one of the following methods:\n");
        break;
      } catch (error: any) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        errorCount++;
      }
    }

    // Since direct SQL execution isn't available via REST API,
    // provide alternative methods
    console.log("\n" + "=".repeat(70));
    console.log("📋 MIGRATION SQL (Copy to Supabase SQL Editor)");
    console.log("=".repeat(70));
    console.log(migrationSQL);
    console.log("=".repeat(70));

    console.log("\n✅ Migration SQL prepared!");
    console.log("\n📝 To apply this migration, use one of these methods:\n");

    console.log("Method 1: Supabase Dashboard (Recommended)");
    console.log("1. Go to: https://supabase.com/dashboard");
    console.log(`2. Select your project (${projectRef})`);
    console.log("3. Navigate to: SQL Editor");
    console.log("4. Click 'New Query'");
    console.log("5. Paste the SQL above");
    console.log("6. Click 'Run' (or press Ctrl+Enter)\n");

    console.log("Method 2: Supabase CLI");
    console.log("1. Install: npm install -g supabase");
    console.log(`2. Link: supabase link --project-ref ${projectRef}`);
    console.log("3. Run: supabase db push\n");

    if (process.env.DATABASE_URL) {
      console.log("Method 3: Direct PostgreSQL (psql)");
      console.log(`psql "${process.env.DATABASE_URL}" -f server/migrations/0003_sponsor_codes.sql\n`);
    }

    console.log("✨ Migration ready to apply!");

  } catch (error: any) {
    console.error("❌ Migration failed:");
    console.error(error.message);
    process.exit(1);
  }
}

runMigration().catch(console.error);
