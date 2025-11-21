# 12-Step Recovery Companion

A privacy-first Progressive Web Application (PWA) designed to support individuals in 12-step recovery programs. Track sobriety, complete step work, maintain a journal, and access emergency support tools—all with offline-first functionality and optional cloud sync.

## Features

- **Sobriety Counter**: Track clean time with timezone support and DST awareness
- **Step Work Tracker**: Complete all 12 steps with guided questions
- **Daily Journal**: Mood tracking, tags, and reflection entries
- **Emergency Support**: Crisis hotlines, breathing exercises, and grounding techniques
- **Worksheets**: HALT check-ins, triggers, gratitude lists, and more
- **Meeting Tracker**: Log attendance and track statistics
- **Milestone Celebrations**: Celebrate recovery milestones
- **Offline-First**: Full PWA functionality with service worker caching
- **Data Export/Import**: JSON export and encrypted backup support
- **AI Sponsor Chat**: Optional AI-powered sponsor companion (requires Gemini API key)

## Tech Stack

- **Web Frontend**: Next.js 16, React 19, TypeScript, Turbopack, NextAuth, TanStack Query
- **Mobile App**: Expo SDK 52, React Native 0.76, Expo Router, TypeScript
- **Backend**: Express.js + tRPC 11, PostgreSQL (Supabase), Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components (web), React Native components (mobile)
- **Build Tools**: pnpm workspaces (monorepo), Turbo, Vitest
- **Deployment**: Vercel (web), EAS Build (mobile), Railway/Docker (backend)

## Prerequisites

- **Node.js 20+** (check with `node --version`)
- **pnpm 8+** (check with `pnpm --version`)
- PostgreSQL database (optional, for cloud sync/auth)
- Google Gemini API key (optional, for AI Sponsor feature)

**Verify installation:**
```bash
node --version  # Should show v20.x.x or higher
pnpm --version  # Should show 8.x.x or higher
```

**Install pnpm if needed:**
```bash
npm install -g pnpm
```

## Project Structure

```
12-Step-Companion/
├── apps/
│   ├── mobile/          # Expo React Native mobile app (iOS/Android)
│   └── web/             # Next.js 16 web app (sponsor portal)
├── packages/
│   ├── api/             # tRPC routers (shared type-safe API)
│   ├── types/           # Shared TypeScript types & Supabase types
│   └── ui/              # Shared UI components (minimal)
├── docs/                # 📚 All documentation (organized by category)
│   ├── architecture/    # System architecture & technical design
│   ├── features/        # Product features & specifications
│   ├── guides/          # Setup, deployment, and operational guides
│   ├── research/        # Research prompts & brainstorming
│   └── status/          # Status updates & historical logs
├── server/              # Express backend (legacy, coexists with tRPC)
├── shared/              # Shared schemas (Drizzle ORM) and utilities
└── migrations/          # Database migrations
```

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd 12-Step-Companion
pnpm install
```

**Note**: This is a pnpm workspace monorepo. Use `pnpm` for all package management commands. Installation may take a few minutes and show deprecation warnings. This is normal - the app will work fine. You can ignore warnings about deprecated packages.

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Windows CMD
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: Google Gemini API Key for AI Sponsor Chat
GEMINI_API_KEY=your_key_here

# Optional: Database for cloud sync/auth
DATABASE_URL=postgresql://user:password@host/database

# Optional: Session secret for authentication
SESSION_SECRET=generate_with_openssl_rand_base64_32
```

**Note**: For local development, you can leave `DATABASE_URL` and `SESSION_SECRET` empty. The app will run in local-only mode without authentication.

### 3. Database Setup (Optional)

If you want to use cloud sync or authentication:

1. Create a free PostgreSQL database at [Neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL` in `.env`
3. Run database migrations:

```bash
npm run db:push
```

### 4. Run Development Servers

**Web App (Next.js):**
```bash
pnpm run dev:web
# or
pnpm --filter 12-step-companion-web dev
```
Opens at `http://localhost:3000`

**Mobile App (Expo):**
```bash
pnpm run mobile:dev
# or
cd apps/mobile && pnpm start
```

**Backend Server (Express + tRPC):**
```bash
pnpm run dev
```
Runs on `http://localhost:5000`

### Mobile App Development

See [apps/mobile/README.md](./apps/mobile/README.md) for complete mobile app setup.

**Quick Start:**
```bash
# Install dependencies
npm install

# Start Expo development server
npm run mobile:dev
# or
cd apps/mobile && npm start

# Run on iOS simulator (Mac only)
npm run mobile:ios

# Run on Android emulator
npm run mobile:android
```

**Environment Variables:**
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `EXPO_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000)

### 5. Build for Production

**Web App:**
```bash
pnpm run build:web
# or
pnpm --filter 12-step-companion-web build
```

**Mobile App (iOS/Android):**
```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

**Backend:**
```bash
pnpm run build
pnpm start
```

## 📚 Documentation

All documentation has been organized in the [`docs/`](./docs/) directory:

- **[Getting Started](./docs/guides/QUICK_START.md)** - Quick setup guide
- **[Architecture](./docs/architecture/ARCHITECTURE.md)** - System architecture overview
- **[Deployment](./docs/guides/DEPLOYMENT_CHECKLIST.md)** - Production deployment guide
- **[Code Review Summary](./docs/guides/CODE_REVIEW_CLEANUP_SUMMARY.md)** - Latest cleanup & improvements
- **[Features](./docs/features/)** - Product features & specifications
- **[Technical Details](./docs/architecture/TECHNICAL_ARCHITECTURE.md)** - In-depth technical documentation

## Available Scripts

**Development:**
- `pnpm run dev:web` - Start Next.js web app
- `pnpm run mobile:dev` - Start Expo mobile app
- `pnpm run dev` - Start Express backend server
- `pnpm run dev:turbo` - Start all services with Turbo

**Build:**
- `pnpm run build:web` - Build web app for production
- `pnpm run build:turbo` - Build all packages with Turbo
- `pnpm run build` - Build Express backend

**Database:**
- `pnpm run db:push` - Push database schema changes
- `pnpm run db:generate` - Generate database migrations
- `pnpm run db:migrate` - Run database migrations

**Testing:**
- `pnpm run test` - Run Vitest tests
- `pnpm run type-check` - TypeScript type checking

## Deployment

### Web App (Vercel)

The web app is configured for Vercel deployment with `vercel.json`:

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

**Required Environment Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXTAUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL

See [docs/guides/DEPLOYMENT_CHECKLIST.md](./docs/guides/DEPLOYMENT_CHECKLIST.md) for complete deployment guide.

### Mobile App (EAS Build)

Build and submit to app stores using EAS:

```bash
# Build for iOS
eas build --platform ios --profile production
eas submit --platform ios

# Build for Android (AAB for Play Store)
eas build --platform android --profile production
eas submit --platform android
```

**Required:**
- Apple Developer Account (iOS)
- Google Play Console Account (Android)
- EAS credentials configured

### Backend (Railway / Docker)

The backend can be deployed to Railway, Render, or any Docker-compatible platform:

**Railway:**
1. Connect GitHub repository
2. Set environment variables
3. Auto-deploys on push

**Docker:**
```bash
docker build -t 12-step-companion .
docker run -p 5000:5000 --env-file .env 12-step-companion
```

## Authentication

Authentication is **optional** and disabled by default for local development. To enable:

1. Set `REPL_ID` and `SESSION_SECRET` in `.env`
2. Configure Replit Auth (or replace with your own auth provider)
3. The app will require login for protected routes

**Note**: The app works fully offline without authentication. All user data is stored locally in the browser by default.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI Sponsor |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `SESSION_SECRET` | No | Secret for session encryption |
| `REPL_ID` | No | Replit Auth client ID (optional) |
| `ISSUER_URL` | No | OIDC issuer URL (default: Replit) |

## Troubleshooting

> 💡 **Quick Help**: See [docs/guides/CONFIGURATION_CHECK.md](./docs/guides/CONFIGURATION_CHECK.md) for configuration reference.

### pnpm install Shows Warnings

**This is normal!** You may see warnings like:
- Deprecated packages (inflight, glob, etc.)
- Peer dependency warnings for React 19
- Unsupported engine warnings

**These are safe to ignore** - they're warnings about transitive dependencies and don't affect functionality. The app will work perfectly fine.

**If installation completes successfully**, you're good to go!

### Port Already in Use

Change the port in `.env`:

```env
PORT=3000
```

### pnpm install Issues

**If pnpm install fails or hangs:**

1. **Clear pnpm cache:**
   ```bash
   pnpm store prune
   ```

2. **Delete lock files and reinstall:**
   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml -ErrorAction SilentlyContinue
   pnpm install

   # Mac/Linux
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Try with different registry (if behind firewall):**
   ```bash
   pnpm install --registry https://registry.npmjs.org/
   ```

**Common warnings (safe to ignore):**
- Deprecation warnings - these are transitive dependencies
- Peer dependency warnings for React 19 - packages will be updated over time
- These warnings don't prevent the app from running

### Build Fails

1. Clear `node_modules` and reinstall:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
pnpm install

# Mac/Linux
rm -rf node_modules
pnpm install
```

2. Clear Next.js build cache:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force apps/web/.next -ErrorAction SilentlyContinue
pnpm run build:web

# Mac/Linux
rm -rf apps/web/.next
pnpm run build:web
```

### Database Connection Issues

- Verify `DATABASE_URL` format: `postgresql://user:password@host/database?sslmode=require`
- Check database is accessible from your IP
- Ensure SSL is enabled (`sslmode=require`)

### Auth Not Working

- Auth is disabled by default. Check console for "Auth disabled" message
- To enable: set `REPL_ID` and `SESSION_SECRET` in `.env`
- For local dev, auth is not required—app works offline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Submit a pull request

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Privacy Note**: This app is designed with privacy in mind. All data is stored locally by default. Cloud sync and authentication are optional features.
