# Deployment Guide

**Last Updated:** 2025-01-27  
**Version:** 1.0.0

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase project configured
- Environment variables set

### 1. Pre-Deployment Checks

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm run check

# Build
pnpm run build
```

### 2. Database Migration

**IMPORTANT**: Apply migration `0003_sponsor_codes.sql` before deployment.

**Via Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Click "New Query"
5. Copy contents of `server/migrations/0003_sponsor_codes.sql`
6. Click "Run"

**Via Supabase CLI:**
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 3. Environment Variables

Set these in your hosting platform:

#### Required
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
PORT=5000
```

#### Optional
```env
DATABASE_URL=postgresql://...  # Direct PostgreSQL access
GEMINI_API_KEY=...             # AI Sponsor feature
BMLT_ROOT_URL=https://bmlt.app # Meeting finder
SENTRY_DSN=...                 # Error tracking
POSTHOG_API_KEY=...            # Analytics
```

### 4. Deploy

#### Railway
1. Connect GitHub repository
2. Railway auto-detects Node.js
3. Set environment variables
4. Deploys automatically

#### Render
1. Create new Web Service
2. Connect repository
3. Build command: `pnpm run build`
4. Start command: `pnpm start`
5. Set environment variables

#### Fly.io
```bash
fly launch
fly secrets set SUPABASE_URL=...
fly secrets set SUPABASE_SERVICE_ROLE_KEY=...
fly deploy
```

#### Vercel
1. Connect repository
2. Framework: Other
3. Build command: `pnpm run build`
4. Output directory: `dist`
5. Set environment variables

### 5. Post-Deployment

```bash
# Verify deployment
curl https://your-domain.com/api/health

# Check API version
curl -I https://your-domain.com/api/trpc/profiles.get | grep X-API-Version

# Verify rate limiting
curl -I https://your-domain.com/api/trpc/profiles.get | grep X-RateLimit
```

---

## Platform-Specific Notes

### Railway
- Auto-detects Node.js
- Sets `PORT` automatically
- Supports PostgreSQL addon
- Environment variables via dashboard

### Render
- Requires explicit build/start commands
- Supports PostgreSQL addon
- Environment variables via dashboard
- Auto-deploys on git push

### Fly.io
- Uses `fly.toml` for configuration
- Secrets via `fly secrets set`
- Supports PostgreSQL addon
- Global edge network

### Vercel
- Optimized for frontend
- Serverless functions supported
- Environment variables via dashboard
- Edge network

---

## Troubleshooting

### Build Fails
- Check Node.js version (20+)
- Verify all dependencies installed
- Check for TypeScript errors: `pnpm run check`

### Migration Fails
- Verify Supabase credentials
- Check SQL syntax in migration file
- Ensure RLS policies don't conflict

### Rate Limiting Not Working
- Verify middleware is applied
- Check response headers
- Verify in-memory store (single instance only)

### Sponsor Codes Not Working
- Verify migration applied
- Check `sponsor_codes` table exists
- Verify RLS policies enabled
- Check TypeScript types regenerated

---

## Monitoring

### Health Checks
- `/api/health` - Basic health check
- `/api/trpc/profiles.get` - API endpoint test

### Metrics to Monitor
- API response times
- Error rates
- Rate limit violations
- Database query performance
- Sponsor code generation/usage

### Logging
- Request logs: Console (dev) / External service (prod)
- Error logs: Sentry (if configured)
- Performance: Request duration in logs

---

## Rollback

If deployment fails:

1. **Revert Code**: Use git to revert to previous version
2. **Redeploy**: Trigger new deployment
3. **Database**: Migration is idempotent (safe to re-run)

---

## Support

- **Documentation**: `docs/` directory
- **API Reference**: `packages/api/API_REFERENCE.md`
- **Issues**: GitHub Issues

