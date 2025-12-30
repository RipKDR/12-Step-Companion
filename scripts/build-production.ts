#!/usr/bin/env tsx
/**
 * Comprehensive Production Build Script
 *
 * This script orchestrates the complete production build process:
 * 1. Validates environment variables
 * 2. Runs type-checking for all apps
 * 3. Builds packages first (dependencies)
 * 4. Builds web app
 * 5. Validates build artifacts
 * 6. Optionally runs database migrations
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join as pathJoin } from "path";

interface BuildStep {
  name: string;
  command: string;
  required: boolean;
  description: string;
}

const buildSteps: BuildStep[] = [
  {
    name: "Environment Validation",
    command: "pnpm run validate:env",
    required: true,
    description: "Validate all required environment variables",
  },
  {
    name: "Type Check - All Apps",
    command: "pnpm run type-check:all",
    required: true,
    description: "Type-check web, mobile, server, and packages",
  },
  {
    name: "Build Packages",
    command: 'pnpm --filter "./packages/*" build',
    required: true,
    description: "Build workspace packages (api, types, ui)",
  },
  {
    name: "Build Web App",
    command: "pnpm run build:web",
    required: true,
    description: "Build Next.js web application",
  },
];

const buildArtifacts = [
  "apps/web/.next",
  "packages/api/dist",
  "packages/types/dist",
  "packages/ui/dist",
];

function runStep(step: BuildStep): boolean {
  console.log(`\n📦 ${step.name}`);
  console.log(`   ${step.description}`);
  console.log(`   Running: ${step.command}\n`);

  try {
    execSync(step.command, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    });
    console.log(`✅ ${step.name} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${step.name} failed\n`);
    if (step.required) {
      console.error("This step is required. Build aborted.");
      return false;
    } else {
      console.warn("This step is optional. Continuing...\n");
      return true;
    }
  }
}

function validateArtifacts(): boolean {
  console.log("\n🔍 Validating build artifacts...\n");

  const cwd = process.cwd() || ".";
  let allPresent = true;
  for (const artifact of buildArtifacts) {
    try {
      const artifactPath = pathJoin(cwd, artifact);
      if (existsSync(artifactPath)) {
        console.log(`  ✅ ${artifact}`);
      } else {
        console.log(`  ❌ ${artifact} - Missing!`);
        allPresent = false;
      }
    } catch (error) {
      console.error(
        `  ❌ Error checking ${artifact}: ${error instanceof Error ? error.message : String(error)}`
      );
      allPresent = false;
    }
  }

  return allPresent;
}

function main() {
  console.log("🚀 Starting Production Build Process\n");
  console.log("=".repeat(60));

  try {
    const cwd = process.cwd() || ".";
    console.log(`📁 Working directory: ${cwd}\n`);

    // Check if we're in the right directory
    const packageJsonPath = pathJoin(cwd, "package.json");
    const workspacePath = pathJoin(cwd, "pnpm-workspace.yaml");

    if (!existsSync(packageJsonPath) || !existsSync(workspacePath)) {
      console.error("❌ Error: Must run from monorepo root");
      console.error(`   Current directory: ${cwd}`);
      console.error(`   Looking for: package.json and pnpm-workspace.yaml`);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      `❌ Error determining working directory: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }

  // Run all build steps
  for (const step of buildSteps) {
    const success = runStep(step);
    if (!success && step.required) {
      console.error("\n❌ Build failed. Aborting.");
      process.exit(1);
    }
  }

  // Validate artifacts
  const artifactsValid = validateArtifacts();
  if (!artifactsValid) {
    console.error(
      "\n❌ Some build artifacts are missing. Build may be incomplete."
    );
    process.exit(1);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Production build completed successfully!");
  console.log("\nNext steps:");
  console.log("  - Test the build locally: pnpm run start");
  console.log("  - Deploy to Vercel: vercel deploy --prod");
  console.log("  - Deploy to Railway: railway up");
  console.log("  - Build Docker image: docker build -t 12-step-companion .\n");
}

// Always run when script is executed
main();
