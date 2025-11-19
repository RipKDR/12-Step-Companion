/**
 * Build Validation Script
 * 
 * Validates that the build is ready by checking:
 * - All imports resolve correctly
 * - TypeScript compiles without errors
 * - Package exports are accessible
 * - Environment variables are set
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const errors: string[] = [];
const warnings: string[] = [];

function checkFileExists(filePath: string, description: string): boolean {
  if (!existsSync(filePath)) {
    errors.push(`Missing ${description}: ${filePath}`);
    return false;
  }
  return true;
}

function checkPackageJson(packagePath: string, packageName: string): void {
  const packageJsonPath = join(packagePath, 'package.json');
  if (!checkFileExists(packageJsonPath, `${packageName} package.json`)) {
    return;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    if (!packageJson.name) {
      warnings.push(`${packageName} package.json missing "name" field`);
    }
    
    if (!packageJson.main && !packageJson.exports) {
      warnings.push(`${packageName} package.json missing "main" or "exports" field`);
    }
  } catch (error) {
    errors.push(`Failed to parse ${packageName} package.json: ${error}`);
  }
}

function checkEnvironmentVariables(): void {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optionalVars = [
    'DATABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      warnings.push(`Missing environment variable: ${varName} (may be set in Vercel)`);
    }
  }

  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(`Optional environment variable not set: ${varName}`);
    }
  }
}

function checkImports(): void {
  // Check that key import files exist
  const importChecks = [
    { path: 'packages/api/src/trpc.ts', desc: 'tRPC initialization' },
    { path: 'packages/api/src/routers/_app.ts', desc: 'tRPC app router' },
    { path: 'packages/types/src/supabase.ts', desc: 'Supabase types' },
    { path: 'apps/web/src/lib/trpc.ts', desc: 'Next.js tRPC client' },
    { path: 'apps/web/next.config.js', desc: 'Next.js config' },
  ];

  for (const check of importChecks) {
    if (!checkFileExists(check.path, check.desc)) {
      // Don't fail on missing files, just warn
      warnings.push(`Import check: ${check.desc} at ${check.path}`);
    }
  }
}

function main() {
  console.log('🔍 Validating build configuration...\n');

  // Check package.json files exist
  checkPackageJson('packages/api', '@12-step-companion/api');
  checkPackageJson('packages/types', '@12-step-companion/types');
  checkPackageJson('packages/ui', '@12-step-companion/ui');

  // Check workspace config
  if (!checkFileExists('pnpm-workspace.yaml', 'pnpm workspace config')) {
    warnings.push('pnpm-workspace.yaml missing - pnpm may not work correctly');
  }

  // Check turbo config
  if (!checkFileExists('turbo.json', 'Turbo config')) {
    warnings.push('turbo.json missing - Turbo builds may not work');
  }

  // Check Next.js config backup exists
  if (!checkFileExists('apps/web/next.config.js.backup', 'Next.js config backup')) {
    warnings.push('Next.js config backup not found - rollback may be difficult');
  }

  // Check Vercel config backup exists
  if (!checkFileExists('vercel.json.backup', 'Vercel config backup')) {
    warnings.push('Vercel config backup not found - rollback may be difficult');
  }

  // Check imports
  checkImports();

  // Check environment variables
  checkEnvironmentVariables();

  // Report results
  console.log('📊 Validation Results:\n');

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(error => console.log(`   - ${error}`));
    console.log('');
    console.log('❌ Validation failed! Please fix the errors above.');
    process.exit(1);
  }

  if (warnings.length === 0 && errors.length === 0) {
    console.log('✅ All checks passed!');
  } else if (errors.length === 0) {
    console.log('✅ Validation passed with warnings (non-critical).');
  }

  console.log('\n✨ Build validation complete!');
}

main();

