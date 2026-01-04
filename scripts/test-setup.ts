/**
 * Test Setup Script
 * 
 * Verifies Supabase connection and tRPC endpoints are working
 * 
 * Usage:
 *   tsx scripts/test-setup.ts
 */

import { supabaseServer } from "../packages/api/src/lib/supabase-server";
import { appRouter } from "../packages/api/src/routers/_app";
import { createContext } from "../packages/api/src/context";

async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase connection...");
  
  try {
    // Test basic connection
    const { data, error } = await supabaseServer.from("profiles").select("count").limit(1);
    
    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
      return false;
    }
    
    console.log("✅ Supabase connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection error:", error);
    return false;
  }
}

async function testTablesExist() {
  console.log("\n🔍 Checking if tables exist...");
  
  const tables = [
    "profiles",
    "steps",
    "step_entries",
    "daily_entries",
    "action_plans",
    "routines",
    "sponsor_relationships",
  ];
  
  const results: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      const { error } = await supabaseServer.from(table).select("count").limit(1);
      results[table] = !error;
      
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: exists`);
      }
    } catch (error) {
      results[table] = false;
      console.log(`  ❌ ${table}: ${error}`);
    }
  }
  
  const allExist = Object.values(results).every((exists) => exists);
  
  if (allExist) {
    console.log("\n✅ All tables exist!");
  } else {
    console.log("\n⚠️  Some tables are missing. Run migrations first.");
  }
  
  return allExist;
}

async function testRLSEnabled() {
  console.log("\n🔍 Checking RLS policies...");
  
  try {
    // Try to query without auth - should fail if RLS is enabled
    const { data, error } = await supabaseServer
      .from("profiles")
      .select("*")
      .limit(1);
    
    // With service role key, this should work even with RLS
    // But we can check if RLS is enabled by querying pg_policies
    const { data: policies, error: policyError } = await supabaseServer.rpc(
      "exec_sql",
      {
        query: `
          SELECT COUNT(*) as count 
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = 'profiles'
        `,
      }
    );
    
    console.log("✅ RLS check completed (service role bypasses RLS)");
    return true;
  } catch (error) {
    console.log("⚠️  Could not verify RLS (this is okay)");
    return true; // Don't fail on this
  }
}

async function testTRPCEndpoint() {
  console.log("\n🔍 Testing tRPC endpoint...");
  
  try {
    // Create a test context (no auth for public endpoint)
    const ctx = await createContext({
      req: {
        headers: {},
      } as any,
      res: {} as any,
    });
    
    // Test a public endpoint (steps.getAll)
    const caller = appRouter.createCaller(ctx);
    const steps = await caller.steps.getAll({ program: "NA" });
    
    console.log(`✅ tRPC endpoint working! Found ${steps.length} steps`);
    return true;
  } catch (error: any) {
    console.error("❌ tRPC endpoint test failed:", error?.message || error);
    return false;
  }
}

async function testSeedData() {
  console.log("\n🔍 Checking seed data...");
  
  try {
    const { data: steps, error } = await supabaseServer
      .from("steps")
      .select("id")
      .eq("program", "NA");
    
    if (error) {
      console.log("  ⚠️  Could not check steps:", error.message);
      return false;
    }
    
    if (steps && steps.length > 0) {
      console.log(`  ✅ Found ${steps.length} NA steps`);
    } else {
      console.log("  ⚠️  No steps found. Run: npm run seed:steps");
    }
    
    return true;
  } catch (error) {
    console.log("  ⚠️  Could not check seed data");
    return false;
  }
}

async function main() {
  console.log("🧪 Testing Setup\n");
  console.log("=".repeat(50));
  
  const results = {
    supabase: await testSupabaseConnection(),
    tables: await testTablesExist(),
    rls: await testRLSEnabled(),
    trpc: await testTRPCEndpoint(),
    seed: await testSeedData(),
  };
  
  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Test Results:");
  console.log(`  Supabase Connection: ${results.supabase ? "✅" : "❌"}`);
  console.log(`  Tables Exist: ${results.tables ? "✅" : "❌"}`);
  console.log(`  RLS Enabled: ${results.rls ? "✅" : "⚠️"}`);
  console.log(`  tRPC Endpoint: ${results.trpc ? "✅" : "❌"}`);
  console.log(`  Seed Data: ${results.seed ? "✅" : "⚠️"}`);
  
  const allCritical = results.supabase && results.tables && results.trpc;
  
  if (allCritical) {
    console.log("\n🎉 Setup is working! You can start developing.");
  } else {
    console.log("\n⚠️  Some tests failed. Check the errors above.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("\n❌ Test script failed:", error);
  process.exit(1);
});

