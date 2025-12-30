# Fixing bufferutil Installation Issue

## Problem

The `bufferutil` package (an optional dependency) is failing to install due to a node-gyp-build path issue. This is **not critical** - bufferutil is only used for WebSocket performance improvements and is optional.

## Solutions

### Option 1: Ignore It (Recommended)

Since `bufferutil` is in `optionalDependencies`, the app will work fine without it. The error can be safely ignored.

### Option 2: Fix the Installation

If you want to fix it, try these steps:

```bash
# From project root
cd C:\Users\H\12-Step-Companion

# Remove node_modules and reinstall
rm -rf node_modules
# Or on Windows PowerShell:
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Clear pnpm store
pnpm store prune

# Reinstall
pnpm install
```

### Option 3: Remove bufferutil (If Not Needed)

If you don't need WebSocket performance optimizations:

```bash
# From project root
cd C:\Users\H\12-Step-Companion

# Remove from package.json optionalDependencies
# Then:
pnpm install
```

## Verify Mobile App Works

The important thing is that the mobile app dependencies are correct:

```bash
cd apps/mobile

# Check Expo dependencies
npx expo install --fix

# Verify setup
npm run verify

# Test build
npx expo run:android
```

The bufferutil error won't prevent the mobile app from working.

