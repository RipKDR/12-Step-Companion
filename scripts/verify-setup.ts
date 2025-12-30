/**
 * Verify Setup Script
 * 
 * Tests that Supabase is configured correctly and everything is working
 * 
 * Usage:
 *   tsx scripts/verify-setup.ts
 */

import { supabaseServer } from "../packages/api/src/lib/supabase-server";
import { appRouter } from "../packages/api/src/routers/_app";
import { createContext } from "../packages/api/src/context";

async function checkEnvironmentVariables() {
  console.log("🔍 Checking environment variables...");
  
  const required = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
      console.log(`  ❌ ${key}: Missing`);
    } else {
      const value = process.env[key]!;
      // Mask sensitive values
      const masked = key.includes("KEY") || key.includes("SECRET")
        ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
        : value;
      console.log(`  ✅ ${key}: ${masked}`);
    }
  }
  
  if (missing.length > 0) {
    console.log(`\n⚠️  Missing environment variables: ${missing.join(", ")}`);
    console.log("   Add them to your .env file");
    return false;
  }
  
  return true;
}

async function testSupabaseConnection() {
  console.log("\n🔍 Testing Supabase connection...");
  
  try {
    // Simple query to test connection
    const { data, error } = await supabaseServer
      .from("profiles")
      .select("count")
      .limit(1);
    
    if (error) {
      // Check if it's a "relation does not exist" error (tables not created)
      if (error.message.includes("does not exist") || error.code === "42P01") {
        console.log("  ⚠️  Tables don't exist yet. Run migrations first!");
        return { connected: true, tablesExist: false };
      }
      console.log(`  ❌ Connection failed: ${error.message}`);
      return { connected: false, tablesExist: false };
    }
    
    console.log("  ✅ Supabase connection successful!");
    return { connected: true, tablesExist: true };
  } catch (error: any) {
    console.log(`  ❌ Connection error: ${error.message}`);
    return { connected: false, tablesExist: false };
  }
}

async function checkTables() {
  console.log("\n🔍 Checking database tables...");
  
  const tables = [
    "profiles",
    "steps",
    "step_entries",
    "daily_entries",
    "action_plans",
    "routines",
    "routine_logs",
    "sponsor_relationships",
    "trigger_locations",
    "messages",
    "notification_tokens",
    "risk_signals",
    "audit_log",
  ];
  
  const results: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      const { error } = await supabaseServer
        .from(table)
        .select("count")
        .limit(1);
      
      results[table] = !error;
      
      if (error) {
        if (error.message.includes("does not exist") || error.code === "42P01") {
          console.log(`  ❌ ${table}: Table does not exist`);
        } else {
          console.log(`  ⚠️  ${table}: ${error.message}`);
        }
      } else {
        console.log(`  ✅ ${table}: OK`);
      }
    } catch (error: any) {
      results[table] = false;
      console.log(`  ❌ ${table}: ${error.message}`);
    }
  }
  
  const allExist = Object.values(results).every((exists) => exists);
  const existingCount = Object.values(results).filter((exists) => exists).length;
  
  console.log(`\n  📊 ${existingCount}/${tables.length} tables exist`);
  
  if (!allExist) {
    console.log("\n  ⚠️  Some tables are missing. Run migrations:");
    console.log("      1. Go to Supabase Dashboard → SQL Editor");
    console.log("      2. Run server/migrations/0001_supabase_schema.sql");
    console.log("      3. Run server/migrations/0002_rls_policies.sql");
  }
  
  return allExist;
}

async function testTRPC() {
  console.log("\n🔍 Testing tRPC endpoints...");
  
  try {
    // Create context without auth (for public endpoint)
    const ctx = await createContext({
      req: {
        headers: {},
      } as any,
      res: {} as any,
    });
    
    // Test public endpoint
    const caller = appRouter.createCaller(ctx);
    const steps = await caller.steps.getAll({ program: "NA" });
    
    console.log(`  ✅ tRPC working! Found ${steps.length} steps`);
    return true;
  } catch (error: any) {
    console.log(`  ❌ tRPC test failed: ${error.message}`);
    console.log(`     ${error.stack?.split("\n")[0]}`);
    return false;
  }
}

async function checkSeedData() {
  console.log("\n🔍 Checking seed data...");
  
  try {
    const { data: steps, error } = await supabaseServer
      .from("steps")
      .select("id, step_number, program")
      .eq("program", "NA")
      .limit(5);
    
    if (error) {
      console.log("  ⚠️  Could not check steps (table might not exist)");
      return false;
    }
    
    if (steps && steps.length > 0) {
      console.log(`  ✅ Found ${steps.length} NA steps`);
      if (steps.length < 12) {
        console.log("  ⚠️  Expected 12 steps. Run: npm run seed:steps");
      }
    } else {
      console.log("  ⚠️  No steps found. Run: npm run seed:steps");
    }
    
    return steps && steps.length > 0;
  } catch (error: any) {
    console.log(`  ⚠️  Could not check seed data: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🧪 Verifying Setup\n");
  console.log("=".repeat(60));
  
  const envOk = await checkEnvironmentVariables();
  if (!envOk) {
    console.log("\n❌ Environment variables missing. Fix .env file first.");
    process.exit(1);
  }
  
  const { connected, tablesExist } = await testSupabaseConnection();
  if (!connected) {
    console.log("\n❌ Cannot connect to Supabase. Check your credentials.");
    process.exit(1);
  }
  
  let tablesOk = true;
  if (tablesExist) {
    tablesOk = await checkTables();
  } else {
    console.log("\n⚠️  Skipping table check (connection issue)");
  }
  
  const trpcOk = await testTRPC();
  const seedOk = await checkSeedData();
  
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Verification Summary:");
  console.log(`  Environment Variables: ${envOk ? "✅" : "❌"}`);
  console.log(`  Supabase Connection: ${connected ? "✅" : "❌"}`);
  console.log(`  Database Tables: ${tablesOk ? "✅" : "❌"}`);
  console.log(`  tRPC Endpoints: ${trpcOk ? "✅" : "❌"}`);
  console.log(`  Seed Data: ${seedOk ? "✅" : "⚠️"}`);
  
  const criticalOk = envOk && connected && tablesOk && trpcOk;
  
  if (criticalOk) {
    console.log("\n🎉 Setup verified! Everything is working.");
    console.log("\n📝 Next steps:");
    if (!seedOk) {
      console.log("  1. Seed steps: npm run seed:steps");
    }
    console.log("  2. Start dev server: npm run dev");
    console.log("  3. Test endpoints: http://localhost:5000/api/trpc/steps.getAll?input=%7B%22program%22%3A%22NA%22%7D");
  } else {
    console.log("\n⚠️  Some checks failed. Review errors above.");
    if (!tablesOk) {
      console.log("\n💡 To fix missing tables:");
      console.log("   1. Open Supabase Dashboard → SQL Editor");
      console.log("   2. Copy contents of server/migrations/0001_supabase_schema.sql");
      console.log("   3. Run it in SQL Editor");
      console.log("   4. Repeat for server/migrations/0002_rls_policies.sql");
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("\n❌ Verification script failed:", error);
  process.exit(1);
});

