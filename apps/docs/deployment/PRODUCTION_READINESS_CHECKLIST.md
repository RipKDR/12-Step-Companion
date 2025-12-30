# Production Readiness Checklist

Complete checklist for verifying production deployment readiness.

## Pre-Deployment Checks

### Configuration

- [ ] **Mobile Package Name**: Verified scripts use `12-step-companion-mobile` filter
- [ ] **TypeScript Config**: Mobile app included in root `tsconfig.json`
- [ ] **Type-Check Scripts**: All apps have type-check scripts (web, mobile, server, packages)
- [ ] **Turbo Config**: Mobile app included in build pipeline
- [ ] **Tailwind Config**: Web app uses comprehensive config (root config is authoritative)
- [ ] **Vercel Config**: Uses correct package filter (`12-step-companion-web`)
- [ ] **Railway Config**: Start command uses correct path (`cd apps/web && pnpm start`)
- [ ] **Dockerfile**: Multi-stage build configured correctly
- [ ] **Metro Config**: Workspace packages resolve correctly (`@12-step-companion/types`, `@12-step-companion/api`)

### Environment Variables

- [ ] **Required Variables Set**:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXTAUTH_SECRET` (min 32 characters)
  - [ ] `NEXTAUTH_URL`
- [ ] **Optional Variables** (if needed):
  - [ ] `SUPABASE_URL` (server-side)
  - [ ] `SUPABASE_ANON_KEY` (server-side)
  - [ ] `DATABASE_URL`
  - [ ] `EXPO_PUBLIC_API_URL`
  - [ ] `EXPO_PUBLIC_SUPABASE_URL`
  - [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **Environment Validation**: Run `pnpm run validate:env` - all checks pass

### Type Checking

- [ ] **Web App**: `pnpm run type-check:web` - no errors
- [ ] **Mobile App**: `pnpm run type-check:mobile` - no errors
- [ ] **Server**: `pnpm run type-check:server` - no errors
- [ ] **Packages**: `pnpm run type-check:packages` - no errors
- [ ] **All Apps**: `pnpm run type-check:all` - all pass

### Build Validation

- [ ] **Production Build**: `pnpm run build:production` - completes successfully
- [ ] **Build Validation**: `pnpm run validate` - all checks pass
- [ ] **Build Artifacts Present**:
  - [ ] `apps/web/.next` exists
  - [ ] `packages/api/dist` exists (if package builds)
  - [ ] `packages/types/dist` exists (if package builds)
  - [ ] `packages/ui/dist` exists (if package builds)

### Dependencies

- [ ] **Lockfile**: `pnpm-lock.yaml` is committed and up-to-date
- [ ] **Workspace Packages**: All packages resolve correctly
- [ ] **No Missing Dependencies**: `pnpm install --frozen-lockfile` works
- [ ] **Peer Dependencies**: All peer dependencies satisfied

### Database

- [ ] **Migrations**: All migrations in `server/migrations/` are applied
- [ ] **RLS Policies**: Row Level Security policies are configured
- [ ] **Connection**: Database connection tested and working
- [ ] **Backup**: Database backup strategy in place

### Health Checks

- [ ] **Health Endpoint**: `/api/health` returns 200 OK
- [ ] **Ready Endpoint**: `/api/ready` returns 200 OK (checks database)
- [ ] **Health Check Config**: Deployment platform health checks configured

## Deployment Platform Specific

### Vercel

- [ ] **Project Linked**: `vercel link` completed
- [ ] **Environment Variables**: All set in Vercel dashboard
- [ ] **Build Command**: `pnpm --filter 12-step-companion-web build` (verified)
- [ ] **Output Directory**: `apps/web/.next` (verified)
- [ ] **Framework**: Next.js (verified)
- [ ] **Custom Domain**: Configured (if applicable)
- [ ] **Preview Deployments**: Tested and working

### Railway

- [ ] **Project Initialized**: `railway init` completed
- [ ] **Environment Variables**: All set in Railway dashboard
- [ ] **Dockerfile**: Present and builds successfully
- [ ] **Start Command**: `cd apps/web && pnpm start` (verified)
- [ ] **Restart Policy**: Configured (ON_FAILURE, max 10 retries)
- [ ] **Health Checks**: Configured in Railway dashboard

### Docker

- [ ] **Dockerfile**: Builds successfully (`docker build -t 12-step-companion .`)
- [ ] **Image Size**: Reasonable (check with `docker images`)
- [ ] **Multi-stage Build**: Working correctly
- [ ] **Runtime**: Container runs successfully (`docker run -p 3000:3000 12-step-companion`)
- [ ] **Environment Variables**: Passed correctly to container
- [ ] **Health Check**: Configured in docker-compose.yml (if used)

### Mobile (EAS)

- [ ] **EAS CLI**: Installed and logged in
- [ ] **EAS Config**: `apps/mobile/eas.json` configured correctly
- [ ] **Environment Secrets**: Set via `eas secret:create`
- [ ] **Development Build**: Tested (`eas build --profile development`)
- [ ] **Preview Build**: Tested (`eas build --profile preview`)
- [ ] **Production Build**: Ready (`eas build --profile production`)
- [ ] **App Store**: Credentials configured (iOS/Android)

## Post-Deployment Verification

### Functionality

- [ ] **Web App**: Loads correctly at deployment URL
- [ ] **API Routes**: All API routes respond correctly
- [ ] **Health Checks**: `/api/health` and `/api/ready` return 200
- [ ] **Database**: Connection working, queries succeed
- [ ] **Authentication**: NextAuth working (if configured)
- [ ] **Mobile App**: Connects to production API (if deployed)

### Performance

- [ ] **Page Load**: First Contentful Paint < 2s
- [ ] **Time to Interactive**: < 3s
- [ ] **API Response Time**: < 500ms (p95)
- [ ] **Build Size**: Reasonable (check Next.js build output)

### Security

- [ ] **HTTPS**: SSL/TLS configured and working
- [ ] **Environment Variables**: No secrets exposed in client code
- [ ] **RLS Policies**: Database RLS policies enforced
- [ ] **CORS**: Configured correctly (if needed)
- [ ] **Rate Limiting**: Configured (if applicable)

### Monitoring

- [ ] **Error Tracking**: Sentry configured (if used)
- [ ] **Analytics**: PostHog configured (if used, opt-in only)
- [ ] **Logging**: Application logs accessible
- [ ] **Alerts**: Monitoring alerts configured
- [ ] **Uptime**: Service uptime monitoring active

## Documentation

- [ ] **Deployment Guide**: `docs/deployment/PRODUCTION_DEPLOYMENT.md` complete
- [ ] **Environment Variables**: Documented in deployment guide
- [ ] **Troubleshooting**: Common issues documented
- [ ] **Runbooks**: Operational runbooks created (if applicable)

## Final Verification

- [ ] **All Checks Pass**: Every item above is checked
- [ ] **Smoke Tests**: Critical user flows tested in production
- [ ] **Rollback Plan**: Rollback procedure documented and tested
- [ ] **Team Notification**: Team notified of deployment

## Sign-Off

- [ ] **Developer**: Verified all technical checks
- [ ] **QA**: Verified functionality and performance
- [ ] **DevOps**: Verified deployment configuration
- [ ] **Product**: Verified feature completeness

---

## Quick Commands

```bash
# Validate environment
pnpm run validate:env

# Type-check all apps
pnpm run type-check:all

# Production build
pnpm run build:production

# Validate build
pnpm run validate

# Test health endpoints (after deployment)
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/ready
```

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0

