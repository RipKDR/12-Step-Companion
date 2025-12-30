/**
 * Execute Migration via Supabase Service Role
 *
 * Uses Supabase service role key to execute SQL via REST API
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

async function executeMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
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
    process.exit(1);
  }

  console.log("📄 Migration file loaded: 0003_sponsor_codes.sql");
  console.log("🚀 Executing migration via Supabase...\n");

  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Supabase doesn't provide direct SQL execution via JS client
    // We need to use the REST API or provide instructions
    console.log("⚠️  Supabase JS client doesn't support direct SQL execution.");
    console.log("The migration needs to be run via Supabase Dashboard or CLI.\n");

    // Extract project reference
    const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || "your-project";

    console.log("=".repeat(70));
    console.log("📋 MIGRATION INSTRUCTIONS");
    console.log("=".repeat(70));
    console.log("\n✅ Easiest Method: Supabase Dashboard\n");
    console.log("1. Go to: https://supabase.com/dashboard");
    console.log(`2. Select your project`);
    console.log("3. Click 'SQL Editor' in the left sidebar");
    console.log("4. Click 'New Query'");
    console.log("5. Copy and paste the SQL below");
    console.log("6. Click 'Run' (or press Ctrl+Enter)");
    console.log("\n" + "=".repeat(70));
    console.log("📋 MIGRATION SQL");
    console.log("=".repeat(70));
    console.log(migrationSQL);
    console.log("=".repeat(70));

    console.log("\n✨ After running the migration:");
    console.log("   - The sponsor_codes table will be created");
    console.log("   - RLS policies will be enabled");
    console.log("   - Sponsor code expiration will be active\n");

  } catch (error: any) {
    console.error("\n❌ Error:");
    console.error(error.message);
    process.exit(1);
  }
}

executeMigration().catch(console.error);

