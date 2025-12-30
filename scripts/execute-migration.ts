/**
 * Execute Migration Script
 *
 * Directly executes SQL migration using PostgreSQL client
 */

/* eslint-disable no-console */
import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

interface PostgresError extends Error {
  code?: string;
  message: string;
}

async function executeMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ Missing DATABASE_URL in environment");
    console.error("Please set DATABASE_URL in your .env file");
    process.exit(1);
  }

  // Read migration file
  const migrationPath = join(
    process.cwd(),
    "server/migrations/0003_sponsor_codes.sql"
  );
  let migrationSQL: string;

  try {
    migrationSQL = readFileSync(migrationPath, "utf-8");
  } catch (error) {
    console.error(`❌ Failed to read migration file: ${migrationPath}`);
    console.error(error);
    process.exit(1);
  }

  console.log("📄 Migration file loaded: 0003_sponsor_codes.sql");
  console.log("🚀 Executing migration...\n");

  try {
    // Use pg client for raw SQL execution
    const { Client } = await import("pg");
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    console.log("✅ Connected to database using pg client\n");

    // Execute the migration SQL
    // Split into statements and execute one by one
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => {
        const trimmed = s.trim();
        return (
          trimmed.length > 0 &&
          !trimmed.startsWith("--") &&
          !trimmed.startsWith("/*") &&
          trimmed !== "$$" &&
          trimmed !== "BEGIN" &&
          trimmed !== "END"
        );
      });

    // Handle function definition specially (it contains semicolons)
    const functionStart = migrationSQL.indexOf("CREATE OR REPLACE FUNCTION");
    if (functionStart !== -1) {
      // Extract function separately
      const functionSQL = migrationSQL.substring(functionStart);
      const otherStatements = migrationSQL
        .substring(0, functionStart)
        .split(";")
        .map((s) => s.trim())
        .filter((s) => {
          const trimmed = s.trim();
          return (
            trimmed.length > 0 &&
            !trimmed.startsWith("--") &&
            !trimmed.startsWith("/*")
          );
        });

      // Execute other statements first
      for (let i = 0; i < otherStatements.length; i++) {
        const statement = otherStatements[i];
        if (!statement || statement.length < 10) continue;

        console.log(
          `Executing statement ${i + 1}/${otherStatements.length}...`
        );
        try {
          await client.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully\n`);
        } catch (error: unknown) {
          const pgError = error as PostgresError;
          // Check if it's a "already exists" error (idempotent)
          if (
            pgError.message?.includes("already exists") ||
            pgError.message?.includes("duplicate") ||
            pgError.code === "42P07" || // duplicate_table
            pgError.code === "42710"
          ) {
            // duplicate_object
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)\n`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`);
            console.error(`   ${pgError.message}\n`);
            throw error;
          }
        }
      }

      // Execute function
      console.log("Executing function definition...");
      try {
        await client.query(functionSQL);
        console.log("✅ Function created successfully\n");
      } catch (error: unknown) {
        const pgError = error as PostgresError;
        if (pgError.message?.includes("already exists")) {
          console.log("⚠️  Function already exists (updated)\n");
        } else {
          console.error(`❌ Error creating function: ${pgError.message}\n`);
          throw error;
        }
      }
    } else {
      // Execute all statements normally
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement || statement.length < 10) continue;

        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          await client.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully\n`);
        } catch (error: unknown) {
          const pgError = error as PostgresError;
          // Check if it's a "already exists" error (idempotent)
          if (
            pgError.message?.includes("already exists") ||
            pgError.message?.includes("duplicate") ||
            pgError.code === "42P07" || // duplicate_table
            pgError.code === "42710"
          ) {
            // duplicate_object
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)\n`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`);
            console.error(`   ${pgError.message}\n`);
            throw error;
          }
        }
      }
    }

    // Close connection
    await client.end();

    console.log("=".repeat(70));
    console.log("✅ Migration completed successfully!");
    console.log("=".repeat(70));
    console.log("\n📋 Created:");
    console.log("   - sponsor_codes table");
    console.log("   - Indexes (code, user_id, expires_at, active)");
    console.log("   - RLS policies (owner_all, public_read)");
    console.log("   - cleanup_expired_sponsor_codes() function");
    console.log("\n✨ Your database is now ready for sponsor code expiration!");
  } catch (error: unknown) {
    const pgError = error as PostgresError;
    console.error("\n❌ Migration failed:");
    console.error(pgError.message);
    if (pgError.stack) {
      console.error("\nStack trace:");
      console.error(pgError.stack);
    }
    process.exit(1);
  }
}

executeMigration().catch(console.error);
