# Railway Deployment Guide

This project is configured to deploy to Railway using Docker.

## Quick Deploy

1. **Connect your repository to Railway**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select this repository

2. **Railway will automatically detect:**
   - `Dockerfile` for building
   - `railway.json` for configuration
   - Node.js 20 (from `.nvmrc`)

3. **Set Environment Variables** (in Railway dashboard):
   ```
   NODE_ENV=production
   PORT=3000 (auto-set by Railway, but can override)
   ```
   
   Optional variables (if using Supabase):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=your_database_url
   ```

4. **Deploy!**
   - Railway will automatically build and deploy
   - The build process:
     1. Installs pnpm and dependencies
     2. Builds the Next.js app (`apps/web`)
     3. Starts the production server

## Build Process

The Dockerfile uses a multi-stage build:

1. **Base stage**: Installs all dependencies and builds the Next.js app
2. **Production stage**: Copies only necessary files and starts the server

## Troubleshooting

### Build fails with "ERR_PNPM_OUTDATED_LOCKFILE"
- The Dockerfile uses `--no-frozen-lockfile` to allow lockfile updates during build
- **Recommended**: Update your lockfile locally by running `pnpm install` and committing `pnpm-lock.yaml`
- This ensures reproducible builds and faster CI/CD

### Build fails with "pnpm not found"
- Railway should auto-detect pnpm from `pnpm-lock.yaml`
- If not, ensure `pnpm-workspace.yaml` exists

### Port binding errors
- Railway sets `PORT` automatically
- Next.js will use `process.env.PORT` or default to 3000

### Module not found errors
- Ensure all workspace packages are copied in Dockerfile
- Check that `packages/api` and `packages/types` are included

### Build timeout
- Railway has a 30-minute build timeout
- For large builds, consider optimizing dependencies

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build locally
docker build -t 12-step-companion .

# Run locally
docker run -p 3000:3000 -e NODE_ENV=production 12-step-companion
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Port to run on (Railway sets automatically) |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anonymous key |
| `DATABASE_URL` | Optional | PostgreSQL connection string |

## Notes

- The Dockerfile builds the Next.js app in `apps/web`
- Shared packages (`packages/api`, `packages/types`) are copied as TypeScript source
- Next.js will transpile these packages at runtime
- All dependencies are installed via pnpm workspace

