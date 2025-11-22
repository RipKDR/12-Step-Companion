#!/usr/bin/env tsx
/**
 * Cleanup Script - Remove Unnecessary Files
 *
 * Removes files not needed for iOS/Web/Android app builds:
 * 1. Nested 12-Step-Companion submodule folder
 * 2. Archived documentation
 * 3. Empty folders
 * 4. Implementation summary files (keeping essential docs)
 */

import { rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();

interface RemovalItem {
  path: string;
  reason: string;
  type: 'folder' | 'file';
}

const itemsToRemove: RemovalItem[] = [
  // Nested submodule folder
  {
    path: join(rootDir, '12-Step-Companion'),
    reason: 'Outdated Git submodule, not used by build scripts',
    type: 'folder'
  },

  // Archived documentation
  {
    path: join(rootDir, 'apps', 'docs', 'archive'),
    reason: 'Archived documentation, already backed up',
    type: 'folder'
  },

  // Empty folders
  {
    path: join(rootDir, 'markdowns from prompts'),
    reason: 'Empty folder',
    type: 'folder'
  },
];

// Root-level markdown files to remove (implementation summaries)
const rootMarkdownFilesToRemove = [
  'CODE_REVIEW_CLEANUP_SUMMARY.md',
  'TRANSFORMATION_SUMMARY.md',
  'WORKSPACE_CLEANUP_SUMMARY.md',
  'WORKSPACE_REVIEW.md',
  'COMPLETE.md',
  'CONFIGURATION_CHECK.md',
  'CHATGPT_RESEARCH_PROMPT.md',
  'IMPROVED_RESEARCH_PROMPT.md',
  'BRAINSTORMING_IMPROVEMENTS.md',
  'CRITICAL_RETENTION_FEATURES.md',
  'RESEARCH_BACKED_ENGAGEMENT_FEATURES.md',
  'STAYING_CLEAN_FEATURES.md',
  'UNIQUE_ENGAGEMENT_STRATEGIES.md',
  'RECOVERY_RHYTHM_IMPLEMENTATION.md',
  'PERFORMANCE_OPTIMIZATION_GUIDE.md',
  'QUICK_TEST.md',
  'RUN_MIGRATIONS.md',
];

// Keep these important docs
const keepDocs = [
  'README.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'ARCHITECTURE.md',
  'TECHNICAL_ARCHITECTURE.md',
  'DEPLOYMENT_CHECKLIST.md',
  'SECURITY_AUDIT.md',
  'PRODUCT_BRIEF.md',
  'QUICK_START.md',
  'CLEANUP_PLAN.md', // This file
];

function removeItem(item: RemovalItem): boolean {
  try {
    if (!existsSync(item.path)) {
      console.log(`  ⏭️  ${item.path} - Already removed or doesn't exist`);
      return true;
    }

    const stats = statSync(item.path);
    if (item.type === 'folder' && stats.isDirectory()) {
      rmSync(item.path, { recursive: true, force: true });
      console.log(`  ✅ Removed folder: ${item.path}`);
      return true;
    } else if (item.type === 'file' && stats.isFile()) {
      rmSync(item.path, { force: true });
      console.log(`  ✅ Removed file: ${item.path}`);
      return true;
    }

    console.log(`  ⚠️  ${item.path} - Type mismatch`);
    return false;
  } catch (error) {
    console.error(`  ❌ Error removing ${item.path}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

function main() {
  console.log('🧹 Starting cleanup of unnecessary files...\n');
  console.log('='.repeat(60));

  let removed = 0;
  let skipped = 0;
  let errors = 0;

  // Remove folders and files from itemsToRemove
  console.log('\n📁 Removing folders and files...');
  for (const item of itemsToRemove) {
    console.log(`\n${item.reason}:`);
    if (removeItem(item)) {
      removed++;
    } else {
      skipped++;
    }
  }

  // Remove root-level markdown files
  console.log('\n📄 Removing root-level implementation summary files...');
  for (const filename of rootMarkdownFilesToRemove) {
    const filePath = join(rootDir, filename);
    if (existsSync(filePath)) {
      const item: RemovalItem = {
        path: filePath,
        reason: 'Implementation summary file (historical, not needed for builds)',
        type: 'file'
      };
      console.log(`\n${item.reason}:`);
      if (removeItem(item)) {
        removed++;
      } else {
        errors++;
      }
    } else {
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Cleanup Summary:');
  console.log(`  ✅ Removed: ${removed} items`);
  console.log(`  ⏭️  Skipped: ${skipped} items (already removed or don't exist)`);
  console.log(`  ❌ Errors: ${errors} items`);

  console.log('\n📝 Kept important documentation:');
  keepDocs.forEach(doc => console.log(`  - ${doc}`));

  console.log('\n✅ Cleanup complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

