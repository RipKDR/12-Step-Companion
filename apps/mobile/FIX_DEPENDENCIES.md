# Fixing Dependency Issues

## Problem Summary

You tried to install Expo 54, but this project uses Expo SDK 52. Additionally, there are React version conflicts between the root (React 19) and mobile app (React 18).

## Solution Steps

### 1. Stay on Expo SDK 52

**DO NOT** upgrade to Expo 54. The project is configured for SDK 52. If you need SDK 54, you'll need to upgrade the entire project following Expo's migration guide.

### 2. Fix Dependencies in Mobile App

Run these commands **from the mobile app directory**:

```bash
cd apps/mobile

# Use npm instead of pnpm to avoid pnpm installation issues
npm install

# Fix Expo dependencies (this will use npm automatically)
npx expo install --fix

# Verify React versions are correct
npm list react react-dom @types/react @types/react-dom
```

Expected versions:
- `react@18.3.1`
- `react-dom@18.3.1`
- `@types/react@~18.3.12`
- `@types/react-dom@~18.3.1`

### 3. If Using pnpm (Recommended for Monorepo)

If you want to use pnpm (which is better for monorepos), first install it properly:

```bash
# Install pnpm globally
npm install -g pnpm@8.15.0

# Verify installation
pnpm --version

# Then from project root
pnpm install

# Then from mobile app directory
cd apps/mobile
pnpm install
npx expo install --fix
```

### 4. Fix React Version Conflicts

The root `package.json` has React 19, but the mobile app needs React 18. This is fine in a monorepo - each workspace can have different versions. However, npm might complain.

**Option A: Use npm with --legacy-peer-deps (Quick Fix)**

```bash
cd apps/mobile
npm install --legacy-peer-deps
npx expo install --fix --legacy-peer-deps
```

**Option B: Use pnpm (Better for Monorepos)**

pnpm handles peer dependencies better in monorepos:

```bash
# From project root
pnpm install

# From mobile app
cd apps/mobile
pnpm install
npx expo install --fix
```

### 5. Verify Setup

```bash
cd apps/mobile
npm run verify
```

This will check:
- ✅ Required packages installed
- ✅ JDK 17 configured
- ✅ Android SDK versions
- ✅ Gradle/Kotlin versions

### 6. Test Build

```bash
cd apps/mobile
npx expo run:android
```

## Common Issues

### "pnpm CLI is missing"

**Solution**: Install pnpm globally or use npm:
```bash
npm install -g pnpm@8.15.0
```

Or use npm instead:
```bash
cd apps/mobile
npm install --legacy-peer-deps
```

### "React version mismatch"

**Solution**: The mobile app correctly uses React 18.3.1. The root uses React 19, which is fine. Use `--legacy-peer-deps` with npm or use pnpm.

### "react-native-webview peer dependency"

**Solution**: If you need react-native-webview in the mobile app, install it:
```bash
cd apps/mobile
npx expo install react-native-webview
```

## Notes

- The mobile app's `package.json` already has the correct React 18.3.1 versions
- Expo SDK 52 requires React 18, not React 19
- The root package.json can have React 19 (for web app) while mobile has React 18
- Use pnpm for better monorepo dependency management, or npm with `--legacy-peer-deps`

