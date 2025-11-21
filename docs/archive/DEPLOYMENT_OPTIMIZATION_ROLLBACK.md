# Deployment Optimization Rollback Plan

This document provides step-by-step instructions to rollback the deployment optimization changes if needed.

## Backup Files Created

The following backup files were created during optimization:

1. `apps/web/next.config.js.backup` - Original Next.js config
2. `vercel.json.backup` - Original Vercel config

## Rollback Steps

### 1. Restore Next.js Configuration

If Next.js build fails or has issues:

```bash
# Restore the backup
cd apps/web
copy next.config.js.backup next.config.js
# Or on Unix/Mac:
# cp next.config.js.backup next.config.js
```

### 2. Restore Vercel Configuration

If Vercel deployment fails:

```bash
# Restore the backup
copy vercel.json.backup vercel.json
# Or on Unix/Mac:
# cp vercel.json.backup vercel.json
```

### 3. Remove Package.json Files (Optional)

If package.json files cause issues, you can remove them:

```bash
# Remove package.json files from packages
rm packages/api/package.json
rm packages/types/package.json
rm packages/ui/package.json
```

**Note:** This will break pnpm workspace functionality but npm should still work with relative imports.

### 4. Revert pnpm-workspace.yaml

If pnpm workspace causes issues:

```yaml
onlyBuiltDependencies:
  - bufferutil
  - es5-ext
  - esbuild
```

Remove the `packages:` section.

### 5. Remove Turbo (Optional)

If Turbo causes build issues:

```bash
# Remove turbo.json
rm turbo.json

# Remove turbo from package.json devDependencies
# Edit package.json and remove "turbo": "^2.0.0" from devDependencies

# Remove turbo scripts from package.json
# Remove "build:turbo" and "dev:turbo" scripts
```

### 6. Remove .npmrc (Optional)

If .npmrc causes issues:

```bash
rm .npmrc
```

### 7. Revert Root package.json Scripts

Remove the added scripts from root `package.json`:

- Remove `build:web`
- Remove `build:client`
- Remove `build:pnpm`
- Remove `build:turbo`
- Remove `dev:web`
- Remove `dev:turbo`
- Remove `type-check`
- Remove `validate`
- Remove `prebuild`

### 8. Remove Validation Script

If validation script causes issues:

```bash
rm scripts/validate-build.ts
```

## Quick Full Rollback

To rollback everything quickly:

```bash
# Restore config backups
copy apps/web/next.config.js.backup apps/web/next.config.js
copy vercel.json.backup vercel.json

# Remove new files
rm turbo.json
rm .npmrc
rm scripts/validate-build.ts
rm packages/api/package.json
rm packages/types/package.json
rm packages/ui/package.json

# Revert pnpm-workspace.yaml to original
# (Edit manually to remove packages: section)

# Revert package.json scripts
# (Edit manually to remove added scripts)
```

## Verification After Rollback

After rollback, verify:

1. Build still works: `npm run build`
2. Next.js app builds: `cd apps/web && npm run build`
3. TypeScript compiles: `npm run check`
4. Imports still work in `apps/web/src/lib/trpc.ts`

## Git Rollback

If you've committed the changes and want to rollback via git:

```bash
# See what changed
git status

# Restore specific files
git checkout HEAD -- apps/web/next.config.js
git checkout HEAD -- vercel.json

# Or restore everything from a previous commit
git log  # Find the commit before optimizations
git checkout <commit-hash> -- .
```

## Partial Rollback Options

### Keep Turbo, Remove Package.json Files

If packages cause issues but Turbo works:

```bash
rm packages/api/package.json
rm packages/types/package.json
rm packages/ui/package.json
# Edit pnpm-workspace.yaml to remove packages: section
```

### Keep Package Structure, Remove Turbo

If Turbo causes issues:

```bash
rm turbo.json
# Remove turbo from package.json devDependencies
# Remove turbo scripts
```

### Keep Everything, Just Fix Configs

If only configs are problematic:

```bash
copy apps/web/next.config.js.backup apps/web/next.config.js
copy vercel.json.backup vercel.json
```

## Notes

- Backup files are safe to keep - they don't affect builds
- Removing package.json files won't break npm builds (uses relative imports)
- Turbo is optional - removing it won't break existing builds
- .npmrc only affects pnpm - npm will ignore it
- Validation script is optional - removing it won't break builds

## Support

If rollback doesn't resolve issues:

1. Check build logs for specific errors
2. Verify Node.js version compatibility
3. Check that all dependencies are installed: `npm install`
4. Clear caches: `rm -rf node_modules .next dist`
5. Reinstall: `npm install`

