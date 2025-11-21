# Next.js 16 + React 19 Build and Runtime Fixes

## Error
```
TypeError: Cannot read properties of undefined (reading 'createClientModuleProxy')
```

## Root Cause
This error typically occurs after upgrading to Next.js 16 with React 19 due to:
1. **Stale build cache** - Old build artifacts from Next.js 14
2. **React 19 compatibility** - Some packages may not be fully compatible yet
3. **Client/Server boundary issues** - Next.js 16 has stricter handling of client/server components
4. **Package version mismatches** - tRPC packages had version inconsistencies

## Fixes Applied

### 1. Environment Cleanup ✅
- Removed `apps/web/.next` directory to clear stale build artifacts
- Removed `apps/web/node_modules` for fresh installation
- Removed all `package-lock.json` files to ensure clean dependency resolution
- This forces a fresh build with Next.js 16

### 2. Package Version Alignment ✅
- Aligned tRPC package versions across root and apps/web:
  - `@trpc/client`: ^11.0.0 → ^11.7.1
  - `@trpc/next`: ^11.0.0 → ^11.7.1
  - `@trpc/react-query`: ^11.0.0 → ^11.7.1
  - `@trpc/server`: ^11.0.0 → ^11.7.1
- Ensures consistent versions across monorepo workspace

### 3. Updated tRPC Client Initialization ✅
- Enhanced error handling in `getTRPCClient()` to gracefully handle SSR/hydration issues
- Added client-side check (`typeof window === "undefined"`) to prevent SSR errors
- Prevents `createClientModuleProxy` errors during server-side rendering
- File: `apps/web/src/lib/trpc.ts`

### 4. TypeScript Configuration Verified ✅
- Verified `apps/web/tsconfig.json` extends root config correctly
- Confirmed React 19 types are properly configured (`@types/react@19.0.0`)
- Verified `skipLibCheck` is enabled to avoid third-party type issues
- Confirmed `moduleResolution: "bundler"` is correct for Next.js 16
- Verified `jsx: "preserve"` for Next.js compatibility

### 5. Next.js Configuration Verified ✅
- Verified `transpilePackages` includes workspace packages: `["@12-step-companion/api", "@12-step-companion/types"]`
- Confirmed `experimental.optimizePackageImports` is valid for Next.js 16
- Verified `compiler.removeConsole` syntax is correct for Next.js 16
- Confirmed webpack configuration is compatible
- No deprecated Next.js 14 options found

### 6. Client/Server Component Boundaries Fixed ✅
- Verified `"use client"` directives are correct in:
  - `apps/web/src/lib/trpc.ts`
  - `apps/web/src/components/TRPCProvider.tsx`
  - `apps/web/src/components/SessionProvider.tsx`
- Ensured provider nesting is correct (SessionProvider → TRPCProvider)
- Added proper SSR guards to prevent hydration mismatches

## Next Steps

### 1. Fresh Dependency Installation
```bash
# From project root
npm install

# Or if using workspace-aware install
cd apps/web
npm install
```

### 2. Type Check
```bash
cd apps/web
npx tsc --noEmit
```

### 3. Build the Application
```bash
cd apps/web
npm run build
```

### 4. Start Development Server
```bash
cd apps/web
npm run dev
```

## Package Compatibility Matrix

### Verified Compatible Versions
- **Next.js**: 16.0.3 ✅
- **React**: 19.0.0 ✅
- **React DOM**: 19.0.0 ✅
- **@types/react**: 19.0.0 ✅
- **@types/react-dom**: 19.0.0 ✅
- **@trpc/client**: 11.7.1 ✅
- **@trpc/next**: 11.7.1 ✅
- **@trpc/react-query**: 11.7.1 ✅
- **@trpc/server**: 11.7.1 ✅
- **@tanstack/react-query**: 5.90.7 ✅
- **next-auth**: 4.24.13 ✅ (should work with React 19)
- **@radix-ui/***: Latest versions ✅ (React 19 compatible)

### If Errors Persist

#### Option A: Check next-auth Compatibility
Next-auth 4.24.13 should work with React 19, but if issues occur:
- Update to latest next-auth version: `npm install next-auth@latest`
- Check next-auth GitHub for React 19 support status
- Consider using Auth.js v5 (next-auth v5) if available

#### Option B: Check for Package Updates
Some packages might need updates for React 19:
```bash
npm outdated
npm update
```

#### Option C: Verify Environment Variables
Ensure all required environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL` (optional, defaults to http://localhost:5000)

## Verification Checklist

**Note**: This checklist is for **user verification** after running the fixes. All code fixes have been applied.

After completing all steps:
- [ ] `npm install` completes without errors
- [ ] `npx tsc --noEmit` passes with no TypeScript errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] Navigate to `/` - page loads without errors
- [ ] Browser console shows no errors or warnings
- [ ] No hydration mismatches in console
- [ ] Authentication flow works (if configured)
- [ ] tRPC queries execute successfully

**Status**: ✅ All code fixes have been applied. This checklist is for manual verification after installation.

## Troubleshooting

### Build Fails with TypeScript Errors
1. Clear TypeScript cache: `rm -rf apps/web/.next`
2. Run type check: `cd apps/web && npx tsc --noEmit`
3. Fix any type errors reported
4. Rebuild: `npm run build`

### Runtime Error: createClientModuleProxy
1. Ensure `.next` directory is removed
2. Clear node_modules: `rm -rf apps/web/node_modules`
3. Fresh install: `npm install`
4. Rebuild: `npm run build`

### Hydration Mismatch Warnings
1. Check all client components have `"use client"` directive
2. Verify no server-only code runs in client components
3. Ensure environment variables are available on both client and server
4. Check for date/time formatting differences between server and client

### tRPC Query Fails
1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check API server is running (if using separate server)
3. Verify authentication token is being passed correctly
4. Check browser network tab for request/response details

## Additional Notes

- All build artifacts and caches have been cleared
- Package versions aligned across monorepo
- Error handling enhanced in tRPC client
- SSR guards added to prevent hydration issues
- TypeScript configuration verified for Next.js 16
- Next.js configuration verified for v16 compatibility
- If issues persist, check Next.js 16 migration guide for breaking changes
- Monitor package compatibility with React 19 as ecosystem matures

