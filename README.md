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

- **Frontend**: React 18 + TypeScript, Vite, Wouter, Zustand, TanStack Query
- **Backend**: Express.js, PostgreSQL (Neon), Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **PWA**: Service Worker, Web Manifest, offline support

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (optional, for cloud sync/auth)
- Google Gemini API key (optional, for AI Sponsor feature)

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd 12-Step-Companion
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
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

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

- Frontend: Served via Vite with HMR
- Backend API: Available at `/api/*`
- Static files: Served from `client/public`

### 5. Build for Production

```bash
npm run build
npm start
```

The production build will:

- Build the React frontend to `dist/public`
- Bundle the Express server to `dist/index.js`
- Serve both from a single Node.js process

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type-check TypeScript files
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations

## Project Structure

```
12-Step-Companion/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── routes/      # Page components
│   │   ├── lib/         # Utilities
│   │   └── store/       # Zustand state management
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── replitAuth.ts   # Optional auth (disabled by default)
│   └── vite.ts         # Vite dev server integration
├── shared/              # Shared TypeScript types
│   └── schema.ts       # Database schema
├── dist/                # Build output (generated)
└── package.json         # Dependencies and scripts
```

## Deployment

### Recommended: Railway / Render / Fly.io

These platforms support full-stack Node.js apps with Express:

**Railway:**

1. Connect your GitHub repository
2. Set environment variables
3. Railway auto-detects Node.js and runs `npm start`

**Render:**

1. Create a new Web Service
2. Connect your repository
3. Build command: `npm run build`
4. Start command: `npm start`
5. Set environment variables

**Fly.io:**

1. Install Fly CLI: `npm install -g @fly/cli`
2. Run: `fly launch`
3. Set secrets: `fly secrets set KEY=value`
4. Deploy: `fly deploy`

### Vercel (Frontend Only)

Vercel is optimized for frontend apps. For full API support:

1. Deploy frontend to Vercel (uses `vercel.json`)
2. Deploy backend separately to Railway/Render
3. Update frontend API URLs to point to backend

Or use Vercel Serverless Functions (requires refactoring API routes).

### Netlify

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist/public`
4. For API: Use Netlify Functions or deploy backend separately

### Environment Variables

Set these in your hosting platform:

- `PORT` (usually auto-set by platform)
- `NODE_ENV=production`
- `GEMINI_API_KEY` (optional)
- `DATABASE_URL` (optional, for cloud sync)
- `SESSION_SECRET` (optional, for auth)

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

### Port Already in Use

Change the port in `.env`:

```env
PORT=3000
```

### Build Fails

1. Clear `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear build cache:

```bash
rm -rf dist
npm run build
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
