# EAS Build Guide

Complete guide for building and deploying the 12-Step Recovery Companion mobile app using Expo Application Services (EAS).

## Prerequisites

1. **Expo Account**: Sign up at [expo.dev](https://expo.dev)
2. **EAS CLI**: `npm install -g eas-cli`
3. **Login**: `eas login`

## Build Profiles

The app uses three build profiles defined in `eas.json`:

### 1. Development

**Purpose**: Testing with Expo Development Client

**Features**:
- Includes development tools
- Can connect to local development server
- Faster builds
- Not for App Store/Play Store

**Build Command**:
```bash
cd apps/mobile
eas build --platform ios --profile development
eas build --platform android --profile development
```

### 2. Preview

**Purpose**: Internal testing and distribution

**Features**:
- Production-like build
- Can be installed via TestFlight (iOS) or direct APK (Android)
- Good for beta testing
- Not submitted to stores

**Build Command**:
```bash
cd apps/mobile
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### 3. Production

**Purpose**: App Store and Play Store releases

**Features**:
- Optimized for production
- Signed with production certificates
- Ready for store submission

**Build Command**:
```bash
cd apps/mobile
eas build --platform ios --profile production
eas build --platform android --profile production
# Or build both:
eas build --platform all --profile production
```

## Environment Variables

### Setting Secrets in EAS

**Recommended**: Use EAS secrets for sensitive values:

```bash
# Set Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co

# Set Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-anon-key-here

# Set API URL
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.yourdomain.com
```

**List secrets**:
```bash
eas secret:list
```

**Delete secret**:
```bash
eas secret:delete --name EXPO_PUBLIC_SUPABASE_URL
```

### Alternative: Environment Variables in eas.json

You can also set environment variables directly in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
        "EXPO_PUBLIC_API_URL": "https://api.yourdomain.com"
      }
    }
  }
}
```

**Note**: Secrets are more secure and don't require committing values to git.

## iOS Builds

### Requirements

- **Apple Developer Account**: $99/year (required for production)
- **Xcode**: Latest version (for local builds only)
- **EAS**: Handles certificates and provisioning profiles automatically

### First-Time Setup

1. **Configure Apple Developer Account**:
   ```bash
   eas build:configure
   ```
   This will prompt you to:
   - Link your Apple Developer account
   - Set up certificates
   - Configure app identifiers

2. **Build**:
   ```bash
   eas build --platform ios --profile production
   ```

### Build Options

**Simulator Build** (for testing):
```bash
eas build --platform ios --profile development --simulator
```

**Device Build**:
```bash
eas build --platform ios --profile production
```

### App Store Submission

**Automatic Submission**:
```bash
eas submit --platform ios
```

**Manual Submission**:
1. Download IPA from EAS dashboard
2. Upload to App Store Connect via Transporter or Xcode

## Android Builds

### Requirements

- **Google Play Console Account**: $25 one-time fee
- **Keystore**: EAS generates automatically (or use your own)

### First-Time Setup

1. **Configure Android**:
   ```bash
   eas build:configure
   ```

2. **Build**:
   ```bash
   eas build --platform android --profile production
   ```

### Build Types

**APK** (for direct installation):
```bash
eas build --platform android --profile preview --type apk
```

**AAB** (for Play Store):
```bash
eas build --platform android --profile production --type app-bundle
```

### Play Store Submission

**Automatic Submission**:
```bash
eas submit --platform android
```

**Manual Submission**:
1. Download AAB from EAS dashboard
2. Upload to Play Console

## Build Status

### Check Build Status

```bash
eas build:list
```

### View Build Logs

```bash
eas build:view [BUILD_ID]
```

Or click the build URL in the terminal output.

### Cancel Build

```bash
eas build:cancel [BUILD_ID]
```

## Local Builds (Advanced)

### Prerequisites

- **iOS**: Xcode, CocoaPods
- **Android**: Android Studio, JDK

### Build Locally

```bash
# iOS
eas build --platform ios --local

# Android
eas build --platform android --local
```

**Note**: Local builds require more setup but are faster and don't count against EAS build limits.

## Build Optimization

### Reduce Build Time

1. **Use Build Cache**: EAS caches dependencies automatically
2. **Incremental Builds**: Only rebuilds changed parts
3. **Parallel Builds**: Build iOS and Android simultaneously

### Reduce Build Size

1. **Optimize Assets**: Compress images, remove unused assets
2. **Code Splitting**: Use dynamic imports where possible
3. **Remove Dev Dependencies**: Ensure they're not bundled

## Troubleshooting

### Build Fails: Missing Environment Variables

**Solution**: Set all required secrets:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value ...
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value ...
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value ...
```

### Build Fails: Invalid app.json

**Solution**: 
1. Check `app.json` syntax: `npx expo config --type public`
2. Verify `app.config.js` exports correctly
3. Check for missing required fields

### Build Fails: Certificate Issues (iOS)

**Solution**:
```bash
# Reset certificates
eas credentials

# Or let EAS regenerate
eas build --platform ios --clear-cache
```

### Build Fails: Keystore Issues (Android)

**Solution**:
```bash
# Reset keystore
eas credentials

# Or use existing keystore
eas credentials --platform android
```

### Build Takes Too Long

**Solutions**:
1. Use local builds: `eas build --local`
2. Check EAS status: [status.expo.dev](https://status.expo.dev)
3. Try building at off-peak times
4. Use build cache (automatic)

## Continuous Integration

### GitHub Actions Example

```yaml
name: Build Mobile App

on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm install -g eas-cli
      - run: eas login --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --profile production --non-interactive
```

**Get Expo Token**:
1. Go to [expo.dev/accounts/[account]/settings/access-tokens](https://expo.dev)
2. Create new token
3. Add to GitHub Secrets as `EXPO_TOKEN`

## Best Practices

1. **Use Secrets**: Never commit API keys or secrets
2. **Test Preview Builds**: Always test preview builds before production
3. **Version Management**: Use semantic versioning in `app.json`
4. **Build Regularly**: Don't let certificates expire
5. **Monitor Builds**: Check build status and logs regularly
6. **Keep Dependencies Updated**: Regular `npm update` to avoid build issues

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS CLI Reference](https://docs.expo.dev/eas-cli/)
- [Expo Status](https://status.expo.dev)

---

**Last Updated**: 2025-01-19

