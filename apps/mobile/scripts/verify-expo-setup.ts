#!/usr/bin/env tsx
/**
 * Expo Setup Verification Script
 * Verifies that all required packages, configurations, and environment variables are set up correctly
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Get project root - assume script is run from workspace root
// Usage: tsx apps/mobile/scripts/verify-expo-setup.ts (from workspace root)
//   or:   cd apps/mobile && tsx scripts/verify-expo-setup.ts
const cwd = process.cwd();
const isInMobileDir = cwd.includes('apps/mobile') || cwd.endsWith('mobile');
const projectRoot = isInMobileDir
  ? cwd
  : join(cwd, 'apps', 'mobile');
const workspaceRoot = isInMobileDir ? join(cwd, '../..') : cwd;

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const checks: CheckResult[] = [];

// Check 1: Verify required packages in package.json
function checkRequiredPackages(): void {
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) {
    checks.push({
      name: 'package.json exists',
      passed: false,
      message: 'package.json not found',
    });
    return;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredPackages = [
    { name: 'expo', version: '~52.0.0' },
    { name: 'expo-router', version: '^4.0.0' },
    { name: 'expo-location', version: '~18.0.0' },
    { name: 'expo-notifications', version: '~0.32.0' },
    { name: 'expo-secure-store', version: '~14.0.0' },
    { name: 'expo-sqlite', version: '~15.0.0' },
    { name: 'expo-task-manager', version: '~12.0.0' },
    { name: 'react-hook-form', version: '^7.66.0' },
    { name: '@hookform/resolvers', version: '^5.2.2' },
    { name: 'zod', version: '^3.25.76' },
  ];

  requiredPackages.forEach((pkg) => {
    const installed = dependencies[pkg.name];
    checks.push({
      name: `Package: ${pkg.name}`,
      passed: !!installed,
      message: installed
        ? `Installed (${installed})`
        : `Missing - expected ${pkg.version}`,
    });
  });
}

// Check 2: Verify Metro config exists
function checkMetroConfig(): void {
  const metroConfigPath = join(projectRoot, 'metro.config.js');
  const exists = existsSync(metroConfigPath);
  checks.push({
    name: 'Metro config exists',
    passed: exists,
    message: exists ? 'metro.config.js found' : 'metro.config.js not found',
  });

  if (exists) {
    const metroConfig = readFileSync(metroConfigPath, 'utf-8');
    const hasWorkspaceRoot = metroConfig.includes('workspaceRoot');
    const hasWatchFolders = metroConfig.includes('watchFolders');
    checks.push({
      name: 'Metro config: workspace support',
      passed: hasWorkspaceRoot || hasWatchFolders,
      message: hasWorkspaceRoot || hasWatchFolders
        ? 'Workspace resolution configured'
        : 'Missing workspace resolution configuration',
    });
  }
}

// Check 3: Verify app.json and app.config.js
function checkExpoConfig(): void {
  const appJsonPath = join(projectRoot, 'app.json');
  const appConfigPath = join(projectRoot, 'app.config.js');

  checks.push({
    name: 'app.json exists',
    passed: existsSync(appJsonPath),
    message: existsSync(appJsonPath) ? 'app.json found' : 'app.json not found',
  });

  checks.push({
    name: 'app.config.js exists',
    passed: existsSync(appConfigPath),
    message: existsSync(appConfigPath) ? 'app.config.js found' : 'app.config.js not found',
  });

  if (existsSync(appJsonPath)) {
    const appJson = JSON.parse(readFileSync(appJsonPath, 'utf-8'));
    const expo = appJson.expo || {};

    // Check plugins
    const hasLocationPlugin = expo.plugins?.some(
      (p: any) => Array.isArray(p) && p[0] === 'expo-location',
    );
    const hasNotificationsPlugin = expo.plugins?.some(
      (p: any) => Array.isArray(p) && p[0] === 'expo-notifications',
    );

    checks.push({
      name: 'app.json: expo-location plugin',
      passed: hasLocationPlugin,
      message: hasLocationPlugin
        ? 'expo-location plugin configured'
        : 'expo-location plugin missing',
    });

    checks.push({
      name: 'app.json: expo-notifications plugin',
      passed: hasNotificationsPlugin,
      message: hasNotificationsPlugin
        ? 'expo-notifications plugin configured'
        : 'expo-notifications plugin missing',
    });
  }
}

// Check 4: Verify TypeScript config
function checkTypeScriptConfig(): void {
  const tsConfigPath = join(projectRoot, 'tsconfig.json');
  checks.push({
    name: 'TypeScript config exists',
    passed: existsSync(tsConfigPath),
    message: existsSync(tsConfigPath) ? 'tsconfig.json found' : 'tsconfig.json not found',
  });

  if (existsSync(tsConfigPath)) {
    const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf-8'));
    const hasWorkspacePaths =
      tsConfig.compilerOptions?.paths?.['@12-step-companion/types'];
    checks.push({
      name: 'TypeScript: workspace paths',
      passed: !!hasWorkspacePaths,
      message: hasWorkspacePaths
        ? 'Workspace package paths configured'
        : 'Missing workspace package path aliases',
    });
  }
}

// Check 5: Verify workspace packages exist
function checkWorkspacePackages(): void {
  const typesPackagePath = join(workspaceRoot, 'packages/types/package.json');
  checks.push({
    name: 'Workspace: @12-step-companion/types',
    passed: existsSync(typesPackagePath),
    message: existsSync(typesPackagePath)
      ? 'Types package found'
      : 'Types package not found in workspace',
  });
}

// Check 6: Verify .env.example exists
function checkEnvExample(): void {
  const envExamplePath = join(projectRoot, '.env.example');
  checks.push({
    name: '.env.example exists',
    passed: existsSync(envExamplePath),
    message: existsSync(envExamplePath)
      ? '.env.example found'
      : '.env.example not found',
  });
}

// Check 7: Verify Android build configuration (JDK, SDK, Gradle, Kotlin)
function checkAndroidBuildConfig(): void {
  const buildGradlePath = join(projectRoot, 'android', 'build.gradle');
  const appBuildGradlePath = join(projectRoot, 'android', 'app', 'build.gradle');
  const gradlePropertiesPath = join(projectRoot, 'android', 'gradle.properties');
  const gradleWrapperPath = join(projectRoot, 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');

  // Check build.gradle exists
  if (!existsSync(buildGradlePath)) {
    checks.push({
      name: 'Android: build.gradle exists',
      passed: false,
      message: 'android/build.gradle not found',
    });
    return;
  }

  const buildGradle = readFileSync(buildGradlePath, 'utf-8');
  const appBuildGradle = existsSync(appBuildGradlePath)
    ? readFileSync(appBuildGradlePath, 'utf-8')
    : '';
  const gradleProperties = existsSync(gradlePropertiesPath)
    ? readFileSync(gradlePropertiesPath, 'utf-8')
    : '';

  // Check JDK 17 configuration
  const hasJdk17Config =
    buildGradle.includes('JavaVersion.VERSION_17') ||
    appBuildGradle.includes('JavaVersion.VERSION_17') ||
    appBuildGradle.includes("jvmTarget = '17'");
  checks.push({
    name: 'Android: JDK 17 configured',
    passed: hasJdk17Config,
    message: hasJdk17Config
      ? 'JDK 17 configuration found'
      : 'JDK 17 configuration missing (required for Expo SDK 52)',
  });

  // Check Kotlin version (should be 2.0.21 or compatible)
  const kotlinVersionMatch = buildGradle.match(/kotlinVersion.*?:.*?['"]([\d.]+)['"]/);
  const kotlinVersion = kotlinVersionMatch ? kotlinVersionMatch[1] : null;
  const kotlinVersionOk = kotlinVersion && parseFloat(kotlinVersion) >= 2.0;
  checks.push({
    name: 'Android: Kotlin version',
    passed: !!kotlinVersionOk,
    message: kotlinVersion
      ? `Kotlin ${kotlinVersion} ${kotlinVersionOk ? '(compatible)' : '(should be 2.0.21+)'}`
      : 'Kotlin version not found',
  });

  // Check Android SDK versions
  const compileSdkMatch = buildGradle.match(/compileSdkVersion.*?:.*?(\d+)/);
  const compileSdk = compileSdkMatch ? parseInt(compileSdkMatch[1]) : null;
  const compileSdkOk = compileSdk && compileSdk >= 34;
  checks.push({
    name: 'Android: compileSdkVersion',
    passed: !!compileSdkOk,
    message: compileSdk
      ? `compileSdkVersion ${compileSdk} ${compileSdkOk ? '(compatible)' : '(should be 34+)'}`
      : 'compileSdkVersion not found',
  });

  // Check Gradle wrapper version
  if (existsSync(gradleWrapperPath)) {
    const gradleWrapper = readFileSync(gradleWrapperPath, 'utf-8');
    const gradleVersionMatch = gradleWrapper.match(/gradle-([\d.]+)-/);
    const gradleVersion = gradleVersionMatch ? gradleVersionMatch[1] : null;
    const gradleVersionOk = gradleVersion && parseFloat(gradleVersion) >= 8.0;
    checks.push({
      name: 'Android: Gradle version',
      passed: !!gradleVersionOk,
      message: gradleVersion
        ? `Gradle ${gradleVersion} ${gradleVersionOk ? '(compatible)' : '(should be 8.0+)'}`
        : 'Gradle version not found',
    });
  } else {
    checks.push({
      name: 'Android: Gradle wrapper',
      passed: false,
      message: 'gradle-wrapper.properties not found',
    });
  }
}

// Run all checks
checkRequiredPackages();
checkMetroConfig();
checkExpoConfig();
checkTypeScriptConfig();
checkWorkspacePackages();
checkEnvExample();
checkAndroidBuildConfig();

// Print results
console.log('\n📱 Expo Setup Verification\n');
console.log('='.repeat(60));

const passed = checks.filter((c) => c.passed).length;
const total = checks.length;

checks.forEach((check) => {
  const icon = check.passed ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  console.log(`   ${check.message}`);
});

console.log('='.repeat(60));
console.log(`\nResults: ${passed}/${total} checks passed\n`);

if (passed === total) {
  console.log('✅ All checks passed! Expo setup is complete.\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the issues above.\n');
  process.exit(1);
}

