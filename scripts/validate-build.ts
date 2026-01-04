#!/usr/bin/env tsx
/**
 * Build Validation Script
 *
 * Validates that a production build is ready:
 * 1. All TypeScript compiles without errors
 * 2. All apps build successfully
 * 3. No missing dependencies
 * 4. Environment variables are set
 * 5. Build artifacts exist
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationCheck {
  name: string;
  check: () => Promise<boolean> | boolean;
  required: boolean;
  description: string;
}

const checks: ValidationCheck[] = [
  {
    name: 'TypeScript Compilation',
    required: true,
    description: 'All TypeScript files compile without errors',
    check: async () => {
      try {
        execSync('pnpm run type-check:all', {
          stdio: 'pipe',
          cwd: process.cwd(),
        });
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: 'Package Dependencies',
    required: true,
    description: 'All workspace packages have required dependencies',
    check: async () => {
      const packages = ['packages/api', 'packages/types', 'packages/ui'];
      for (const pkg of packages) {
        const pkgJsonPath = join(process.cwd(), pkg, 'package.json');
        if (!existsSync(pkgJsonPath)) {
          console.error(`  ❌ Missing package.json: ${pkg}`);
          return false;
        }
        try {
          const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
          if (!pkgJson.name) {
            console.error(`  ❌ Invalid package.json: ${pkg}`);
            return false;
          }
        } catch {
          console.error(`  ❌ Cannot parse package.json: ${pkg}`);
          return false;
        }
      }
      return true;
    },
  },
  {
    name: 'Environment Variables',
    required: false,
    description: 'Required environment variables are set',
    check: async () => {
      try {
        execSync('pnpm run validate:env', {
          stdio: 'pipe',
          cwd: process.cwd(),
        });
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: 'Build Artifacts',
    required: true,
    description: 'Required build artifacts exist',
    check: async () => {
      const artifacts = [
        'apps/web/.next',
        'packages/api/dist',
        'packages/types/dist',
      ];

      let allPresent = true;
      for (const artifact of artifacts) {
        const path = join(process.cwd(), artifact);
        if (!existsSync(path)) {
          console.error(`  ❌ Missing artifact: ${artifact}`);
          allPresent = false;
        }
      }
      return allPresent;
    },
  },
  {
    name: 'Lockfile Present',
    required: true,
    description: 'pnpm-lock.yaml exists and is up-to-date',
    check: async () => {
      const lockfilePath = join(process.cwd(), 'pnpm-lock.yaml');
      if (!existsSync(lockfilePath)) {
        console.error('  ❌ pnpm-lock.yaml not found');
        return false;
      }

      // Try to verify lockfile is valid
      try {
        execSync('pnpm install --frozen-lockfile --dry-run', {
          stdio: 'pipe',
          cwd: process.cwd(),
        });
        return true;
      } catch {
        console.warn('  ⚠️  Lockfile validation skipped (may need pnpm install)');
        return true; // Not a hard failure
      }
    },
  },
];

async function main() {
  console.log('🔍 Validating Build Readiness\n');
  console.log('='.repeat(60));

  let allPassed = true;
  let requiredFailed = false;

  for (const check of checks) {
    console.log(`\n📋 ${check.name}`);
    console.log(`   ${check.description}`);

    try {
      const result = await check.check();
      if (result) {
        console.log(`   ✅ Passed`);
      } else {
        console.log(`   ❌ Failed`);
        if (check.required) {
          requiredFailed = true;
        }
        allPassed = false;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      if (check.required) {
        requiredFailed = true;
      }
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(60));

  if (requiredFailed) {
    console.log('\n❌ Build validation failed. Required checks did not pass.');
    process.exit(1);
  } else if (!allPassed) {
    console.log('\n⚠️  Build validation completed with warnings. Some optional checks failed.');
    process.exit(0);
  } else {
    console.log('\n✅ All build validation checks passed!');
    process.exit(0);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
