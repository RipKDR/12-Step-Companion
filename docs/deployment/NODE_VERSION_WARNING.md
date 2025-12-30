# Node.js Version Warning

## Issue

The build scripts may fail with the error:
```
The "path" argument must be of type string. Received undefined
```

This occurs when using Node.js v24.x, which is outside the supported version range.

## Supported Versions

- **Required**: Node.js 20.x (>=20.0.0 <21.0.0)
- **Recommended**: Node.js 20.x LTS

## Solution

### Option 1: Use Node Version Manager (Recommended)

**Windows (using nvm-windows):**
```powershell
nvm install 20
nvm use 20
```

**Mac/Linux (using nvm):**
```bash
nvm install 20
nvm use 20
```

### Option 2: Verify Node.js Version

Check your current Node.js version:

```bash
node --version  # Should show v20.x.x
```

If you're using a different version, switch to Node.js 20.x using nvm (see Option 1).

### Option 3: Use Docker

Use the Dockerfile which specifies Node.js 20:

```bash
docker build -t 12-step-companion .
```

## Verification

After switching to Node.js 20.x:

```bash
node --version  # Should show v20.x.x
pnpm run validate:env
pnpm run build:production
```

## CI/CD

Ensure your CI/CD pipelines use Node.js 20.x:

- **GitHub Actions**: Use `actions/setup-node@v4` with `node-version: '20'`
- **Vercel**: Configure in project settings (defaults to Node.js 20)
- **Railway**: Set `NODE_VERSION=20` environment variable
- **Docker**: Uses Node.js 20 Alpine image (already configured)

---

**Last Updated**: 2024-01-01

