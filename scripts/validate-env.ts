#!/usr/bin/env tsx
/**
 * Environment Variable Validation Script
 * Validates required and optional environment variables for production builds
 */

import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  validate?: (value: string) => boolean | string;
}

const envVars: EnvVar[] = [
  // Web App (Next.js)
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    validate: (value) => {
      if (!value.startsWith('https://')) {
        return 'Must start with https://';
      }
      return true;
    },
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
    validate: (value) => {
      if (value.length < 20) {
        return 'Key seems too short';
      }
      return true;
    },
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'NextAuth.js secret for session encryption',
    validate: (value) => {
      if (value.length < 32) {
        return 'Secret should be at least 32 characters';
      }
      return true;
    },
  },
  {
    name: 'NEXTAUTH_URL',
    required: false,
    description: 'Base URL of the application',
    defaultValue: 'http://localhost:3000',
  },
  // Server
  {
    name: 'SUPABASE_URL',
    required: false,
    description: 'Supabase project URL (server-side)',
  },
  {
    name: 'SUPABASE_ANON_KEY',
    required: false,
    description: 'Supabase anonymous key (server-side)',
  },
  {
    name: 'DATABASE_URL',
    required: false,
    description: 'PostgreSQL connection string',
  },
  // Mobile App (Expo)
  {
    name: 'EXPO_PUBLIC_API_URL',
    required: false,
    description: 'API URL for mobile app',
    defaultValue: 'http://localhost:3000',
  },
  {
    name: 'EXPO_PUBLIC_SUPABASE_URL',
    required: false,
    description: 'Supabase URL for mobile app',
  },
  {
    name: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    required: false,
    description: 'Supabase anonymous key for mobile app',
  },
];

function loadEnvFile(): Record<string, string> {
  // Get current working directory with fallback
  const cwd = (() => {
    try {
      const dir = process.cwd();
      if (dir && typeof dir === 'string' && dir.length > 0) {
        return dir;
      }
    } catch (e) {
      // Ignore
    }
    // Fallback to current directory
    return '.';
  })();

  // Ensure cwd is a valid string before using pathJoin
  if (typeof cwd !== 'string' || cwd.length === 0) {
    throw new Error('Cannot determine current working directory');
  }

  const envPath = pathJoin(cwd, '.env');
  const envLocalPath = pathJoin(cwd, '.env.local');

  const env: Record<string, string> = {};

  // Load .env.local first (higher priority)
  try {
    const localContent = readFileSync(envLocalPath, 'utf-8');
    parseEnvContent(localContent, env);
  } catch {
    // .env.local doesn't exist, that's okay
  }

  // Load .env
  try {
    const content = readFileSync(envPath, 'utf-8');
    parseEnvContent(content, env);
  } catch {
    // .env doesn't exist, that's okay
  }

  // Merge with process.env (highest priority)
  return { ...env, ...process.env };
}

function parseEnvContent(content: string, env: Record<string, string>): void {
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  }
}

function validateEnvVar(envVar: EnvVar, value: string | undefined): { valid: boolean; error?: string } {
  if (!value) {
    if (envVar.required) {
      return { valid: false, error: 'Required but not set' };
    }
    if (envVar.defaultValue) {
      return { valid: true };
    }
    return { valid: true }; // Optional and no default
  }

  if (envVar.validate) {
    const result = envVar.validate(value);
    if (result !== true) {
      return { valid: false, error: typeof result === 'string' ? result : 'Validation failed' };
    }
  }

  return { valid: true };
}

function main() {
  const env = loadEnvFile();
  const errors: Array<{ name: string; error: string }> = [];
  const warnings: Array<{ name: string; message: string }> = [];

  console.log('🔍 Validating environment variables...\n');

  for (const envVar of envVars) {
    const value = env[envVar.name];
    const validation = validateEnvVar(envVar, value);

    if (!validation.valid) {
      if (envVar.required) {
        errors.push({ name: envVar.name, error: validation.error || 'Invalid' });
      } else {
        warnings.push({ name: envVar.name, message: validation.error || 'Invalid' });
      }
    } else if (!value && envVar.required) {
      errors.push({ name: envVar.name, error: 'Required but not set' });
    } else if (!value && envVar.defaultValue) {
      console.log(`  ⚠️  ${envVar.name}: Not set, will use default: ${envVar.defaultValue}`);
    } else if (value) {
      const displayValue = value.length > 50 ? `${value.substring(0, 47)}...` : value;
      console.log(`  ✅ ${envVar.name}: ${displayValue}`);
    }
  }

  console.log('');

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    for (const warning of warnings) {
      console.log(`  - ${warning.name}: ${warning.message}`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ Errors:');
    for (const error of errors) {
      console.log(`  - ${error.name}: ${error.error}`);
    }
    console.log('');
    console.log('Please set the required environment variables before building.');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

