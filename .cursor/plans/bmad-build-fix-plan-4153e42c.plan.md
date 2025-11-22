<!-- 4153e42c-eb41-4baf-8772-d81783ba3183 80d0996c-fed5-4259-85be-d7eedc3f7a26 -->
# BMAD Production Deployment Readiness Plan - 12-Step Companion Monorepo

## Overview

Comprehensive plan to fix all configuration issues, ensure production build readiness, and validate deployment configurations for web app (Next.js), mobile app (Expo), and server (Express/tRPC) across all deployment platforms (Vercel, Railway, Docker).

## Critical Issues Identified

1. **Package Name Mismatch** - Root scripts use wrong filter name for mobile app
2. **TypeScript Configuration Gaps** - Mobile app excluded from type checking
3. **Build Script Issues** - Incomplete type-checking before builds
4. **Tailwind Config Duplication** - Multiple config files causing confusion
5. **Turbo Configuration** - Mobile app may not be in build pipeline
6. **Deployment Configurations** - Vercel, Railway, Docker need validation
7. **Environment Variables** - Missing validation and documentation
8. **Database Migrations** - Need to ensure migrations run in production
9. **Mobile Build Configuration** - EAS build config needs verification
10. **Production Build Scripts** - Need comprehensive build validation

## Success Criteria

- All apps build successfully for production
- All deployment platforms configured correctly
- Environment variables validated and documented
- Database migrations run automatically in production
- Mobile app builds successfully via EAS
- No TypeScript errors in any app
- All workspace packages resolve correctly
- Production builds are optimized and secure

### To-dos

- [ ] CRITICAL: Verify mobile package name in apps/mobile/package.json. Update root package.json scripts to use correct filter name (12-step-companion-mobile) OR rename mobile package to mobile for consistency. Test all mobile scripts: mobile:dev, mobile:ios, mobile:android, mobile:web
- [ ] Add apps/mobile/src/**/* to root tsconfig.json includes array. Verify mobile tsconfig.json extends root config correctly. Ensure path aliases (@12-step-companion/*) work for mobile app imports. Verify no TypeScript errors in mobile app
- [ ] Create comprehensive type-check script that validates all apps: web (apps/web), mobile (apps/mobile), server (server), and packages (packages/*). Update prebuild hook to use comprehensive type-check. Add script: type-check:web, type-check:mobile, type-check:server, type-check:all
- [ ] Review turbo.json pipeline configuration. Add mobile app to build pipeline if missing. Configure proper build dependencies between apps (packages must build before apps). Ensure outputs are correctly specified. Test: pnpm run build:turbo should build all apps in correct order
- [ ] Review root tailwind.config.ts vs apps/web/tailwind.config.js. Determine which config is authoritative (web app's config should be primary). Remove duplicate root config OR document why both exist. Ensure web app uses correct Tailwind config. Verify Tailwind builds correctly in production
- [ ] Review apps/mobile/metro.config.js workspace resolution. Ensure @12-step-companion/types and @12-step-companion/api resolve correctly from workspace. Test mobile app can import from workspace packages. Verify Metro bundler works with monorepo structure
- [ ] Verify all workspace packages have correct dependencies: @12-step-companion/api, @12-step-companion/types, @12-step-companion/ui. Check for missing peer dependencies. Ensure version consistency across workspace. Verify pnpm workspace hoisting works correctly
- [ ] Review vercel.json configuration. Verify buildCommand uses correct filter: pnpm --filter 12-step-companion-web build. Ensure outputDirectory points to apps/web/.next. Verify installCommand uses pnpm. Test Vercel build locally with vercel build. Check API route rewrites are correct
- [ ] Review railway.json and Dockerfile. Verify startCommand uses correct path: cd apps/web && pnpm start. Ensure Dockerfile copies all necessary files for Next.js build. Verify pnpm-lock.yaml is included. Test Docker build locally. Ensure PORT environment variable is respected
- [ ] Review Dockerfile multi-stage build. Verify all workspace packages are copied correctly. Ensure Next.js build includes all dependencies. Verify production stage only includes necessary files. Test Docker build: docker build -t 12-step-companion . Test Docker run: docker run -p 3000:3000 12-step-companion
- [ ] Create environment variable validation script. Validate required vars: SUPABASE_URL, SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL. Validate optional vars with defaults. Create .env.production.example. Add validation to build scripts
- [ ] Review apps/web/next.config.js. Verify transpilePackages includes all workspace packages. Ensure Turbopack root path is correct. Verify image optimization settings. Check experimental features are compatible with Next.js 16. Test production build: pnpm --filter 12-step-companion-web build
- [ ] Review database migration scripts. Ensure migrations can run in production environment. Verify DATABASE_URL or SUPABASE_URL is available. Create migration script that runs automatically on deploy. Test migration execution: pnpm run db:migrate. Document migration process for production
- [ ] Review apps/mobile/eas.json build profiles. Verify development, preview, and production builds are configured correctly. Ensure environment variables (EXPO_PUBLIC_*) are set for EAS builds. Test EAS build locally: eas build --profile development --platform ios. Document EAS secret setup
- [ ] Review apps/mobile/app.config.js. Verify environment variables are loaded correctly. Ensure API URL defaults are correct. Test app.config.js exports correct values. Verify Expo extra config is accessible in app
- [ ] Create comprehensive production build script that: 1) Runs type-check for all apps, 2) Builds packages first, 3) Builds web app, 4) Validates environment variables, 5) Runs database migrations (optional), 6) Creates build artifacts. Add script: build:production. Test end-to-end build process
- [ ] Add health check endpoints for deployment platforms. Create /api/health endpoint that returns 200 OK. Create /api/ready endpoint that checks database connectivity. Add to server routes. Document for Railway/Vercel health checks
- [ ] Ensure pnpm-lock.yaml is committed and up-to-date. Verify lockfile includes all workspace packages. Test: pnpm install --frozen-lockfile should work. Document lockfile requirements for CI/CD. Add lockfile validation to CI
- [ ] Investigate 12-Step-Companion/12-Step-Companion/ nested directory structure. Determine if it is duplicate or serves a purpose. Document purpose OR remove if duplicate. Update any path references if structure changes. Ensure no build scripts reference nested paths
- [ ] Test all build scripts: build, build:web, build:turbo, build:production. Test all dev scripts: dev, dev:web, dev:turbo, mobile:dev. Verify no script conflicts. Ensure all scripts use correct package names and filters. Document script usage
- [ ] Create build validation script that checks: 1) All TypeScript compiles, 2) All apps build successfully, 3) No missing dependencies, 4) Environment variables are set, 5) Build artifacts exist. Add to CI/CD pipeline. Run before deployment
- [ ] Run comprehensive production build tests: 1) pnpm run build:production, 2) Test Vercel build locally, 3) Test Docker build, 4) Test Railway build command, 5) Verify all build outputs exist. Document any build failures and fixes
- [ ] Test mobile app builds: 1) EAS development build, 2) EAS preview build, 3) Local Expo build. Verify environment variables are bundled correctly. Test app runs with production API URL. Document mobile deployment process
- [ ] Create comprehensive deployment documentation: 1) Vercel deployment steps, 2) Railway deployment steps, 3) Docker deployment steps, 4) Mobile EAS deployment steps, 5) Environment variable setup, 6) Database migration process, 7) Troubleshooting guide
- [ ] Final comprehensive check: 1) All TypeScript errors resolved, 2) All builds succeed, 3) All deployment configs validated, 4) Environment variables documented, 5) Database migrations tested, 6) Mobile builds work, 7) Health checks implemented, 8) Documentation complete. Create production readiness checklist