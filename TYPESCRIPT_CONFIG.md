# TypeScript Configuration Documentation

This document explains the TypeScript configuration differences across the monorepo and why they exist.

## Overview

The monorepo uses three TypeScript configurations:
1. **Root** (`tsconfig.json`) - General TypeScript config for shared code
2. **Web** (`apps/web/tsconfig.json`) - Next.js-specific configuration
3. **Mobile** (`apps/mobile/tsconfig.json`) - Expo/React Native-specific configuration

## Root Configuration (`tsconfig.json`)

**Purpose**: General TypeScript configuration for shared code (client, server, shared utilities)

**Key Settings**:
- **Target**: `ES2022` - Modern Node.js/server code
- **Module Resolution**: `bundler` - For Vite/build tools
- **JSX**: `react-jsx` - React 17+ JSX transform
- **Strict**: `true` - Full type checking enabled
- **Skip Lib Check**: `true` - Faster compilation

**Includes**:
- `client/src/**/*`
- `shared/**/*`
- `server/**/*`

**Why ES2022?**: Server-side code runs on Node.js 20+, which supports ES2022 features.

---

## Web Configuration (`apps/web/tsconfig.json`)

**Purpose**: Next.js 16 App Router configuration

**Key Settings**:
- **Extends**: Root `tsconfig.json` (inherits base settings)
- **Target**: `ES2017` - Next.js compatibility requirement
- **Module Resolution**: `bundler` - Next.js uses bundler resolution
- **JSX**: `preserve` - Next.js handles JSX transformation
- **Strict**: `true` - Inherited from root
- **Skip Lib Check**: `true` - Inherited from root

**Why ES2017?**: Next.js requires ES2017 target for optimal compatibility with its build system and runtime.

**Next.js Specific**:
- `jsx: "preserve"` - Next.js handles JSX compilation
- Next.js plugin enabled for App Router support
- Includes `.next/types/**/*.ts` for Next.js generated types

---

## Mobile Configuration (`apps/mobile/tsconfig.json`)

**Purpose**: Expo/React Native configuration

**Key Settings**:
- **Extends**: `expo/tsconfig.base` - Expo's base configuration
- **Module Resolution**: `node` - Required for React Native/Expo compatibility
- **JSX**: `react-native` - React Native JSX transform
- **Strict**: `true` - Full type checking enabled
- **Skip Lib Check**: `true` - Faster compilation
- **Isolated Modules**: `true` - Required for Metro bundler

**Why `node` Module Resolution?**: Expo/Metro bundler requires Node.js-style module resolution, not bundler resolution. This is a React Native requirement.

**Expo Specific**:
- Extends Expo's base config for React Native compatibility
- Includes `.expo/types/**/*.ts` for Expo generated types
- Uses `react-native` JSX transform (different from web React)

---

## Shared Settings

All configurations share these important settings:

### Type Safety
- ✅ `strict: true` - Full strict mode enabled
- ✅ `skipLibCheck: true` - Faster compilation (skip checking .d.ts files)
- ✅ `esModuleInterop: true` - Interoperability between CommonJS and ES modules
- ✅ `allowSyntheticDefaultImports: true` - Allow default imports from modules with no default export

### Path Aliases
Each config defines its own path aliases:
- **Root**: `@/*`, `@shared/*`, `@packages/*`
- **Web**: `@/*`, `@/components/*`, `@/lib/*`, `@/app/*`, `@12-step-companion/*`
- **Mobile**: `@/*`, `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/app/*`, `@12-step-companion/*`

---

## Why Different Configs?

### 1. Different Runtimes
- **Root/Server**: Node.js 20+ (ES2022)
- **Web**: Browser + Next.js runtime (ES2017)
- **Mobile**: React Native/Metro bundler (Node-style resolution)

### 2. Different Build Tools
- **Root**: Vite/esbuild (bundler resolution)
- **Web**: Next.js (bundler resolution, but ES2017 target)
- **Mobile**: Metro bundler (node resolution)

### 3. Different JSX Transforms
- **Root/Web**: `react-jsx` or `preserve` (web React)
- **Mobile**: `react-native` (React Native)

### 4. Framework Requirements
- **Next.js**: Requires ES2017 target and preserve JSX
- **Expo**: Requires node module resolution and react-native JSX

---

## Best Practices

1. **Don't Change Targets Arbitrarily**: Each target is set for compatibility reasons
2. **Keep Strict Mode**: All configs use `strict: true` - maintain this
3. **Use Path Aliases**: Use `@12-step-companion/*` for cross-package imports
4. **Extend Base Config**: Web extends root, Mobile extends Expo base
5. **Platform-Specific Types**: Each config includes platform-specific generated types

---

## Troubleshooting

### "Cannot find module" errors
- Check if the module resolution matches your build tool
- Verify path aliases are correctly configured
- Ensure `include` arrays cover your source files

### Type errors in one app but not another
- Check if `strict` mode is enabled in both configs
- Verify TypeScript versions match
- Check if platform-specific types are included

### Build tool compatibility issues
- Web: Ensure target is ES2017 (Next.js requirement)
- Mobile: Ensure moduleResolution is `node` (Expo requirement)
- Root: Can use `bundler` resolution (Vite/esbuild)

---

## Summary

| Config | Target | Module Resolution | JSX | Use Case |
|--------|--------|-------------------|-----|----------|
| Root | ES2022 | bundler | react-jsx | Server/shared code |
| Web | ES2017 | bundler | preserve | Next.js web app |
| Mobile | (Expo) | node | react-native | Expo mobile app |

All configs maintain:
- ✅ Strict mode enabled
- ✅ Skip lib check enabled
- ✅ ES module interop enabled
- ✅ Consistent type safety

---

**Last Updated**: 2025-01-27  
**TypeScript Version**: 5.7.2

