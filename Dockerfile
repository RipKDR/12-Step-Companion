# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy all package.json files for dependency resolution
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/api/package.json ./packages/api/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies
# Use --no-frozen-lockfile to allow lockfile updates if needed
# In production, you should commit an up-to-date pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the Next.js web app (primary deployment target)
RUN cd apps/web && pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests required for pnpm runtime
COPY --from=base /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy built Next.js app
COPY --from=base /app/apps/web/.next ./apps/web/.next
COPY --from=base /app/apps/web/public ./apps/web/public

# Copy Next.js source files (needed for SSR and API routes)
COPY --from=base /app/apps/web/src ./apps/web/src
COPY --from=base /app/apps/web/next.config.js ./apps/web/
COPY --from=base /app/apps/web/tsconfig.json ./apps/web/
COPY --from=base /app/apps/web/tailwind.config.js ./apps/web/
COPY --from=base /app/apps/web/postcss.config.js ./apps/web/
COPY --from=base /app/apps/web/package.json ./apps/web/

# Copy shared packages source (TypeScript files, Next.js will transpile)
COPY --from=base /app/packages ./packages

# Copy all node_modules from build stage (pnpm hoists to root)
COPY --from=base /app/node_modules ./node_modules

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Set working directory to web app
WORKDIR /app/apps/web

# Start the Next.js application
CMD ["pnpm", "start"]

