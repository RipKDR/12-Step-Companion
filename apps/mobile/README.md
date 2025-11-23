# 12-Step Recovery Companion - Mobile App

Privacy-first mobile companion app built with Expo and React Native for iOS and Android.

## Features

- **Offline-First**: Core features work without internet connection
- **Secure Storage**: Uses Expo SecureStore for sensitive data
- **Location Services**: Geofenced triggers and meeting finder
- **Push Notifications**: Daily reminders and routine nudges
- **Sponsor Sharing**: Secure code-based sharing with sponsors
- **Step Work**: Complete all 12 steps with guided prompts
- **Daily Journaling**: Track cravings, feelings, triggers, and gratitude
- **Sobriety Counter**: Track clean time with timezone support

## Prerequisites

- **Node.js 20+** and npm
- **JDK 17** (required for Expo SDK 52 and Android builds)
  - Download from [Oracle JDK](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [OpenJDK](https://adoptium.net/temurin/releases/?version=17)
  - Verify installation: `java -version` (should show version 17.x.x)
  - Set `JAVA_HOME` environment variable to JDK 17 installation path
- **Android SDK** (for Android development)
  - Android SDK Platform 35 (compileSdkVersion)
  - Android SDK Build-Tools 35.0.0
  - Android SDK Platform-Tools
  - Set `ANDROID_HOME` environment variable to Android SDK path
- **Expo CLI**: `npm install -g expo-cli` or use `npx expo`
- **Expo Go** app (for development) - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **EAS CLI** (for builds): `npm install -g eas-cli`

## Quick Start

### 1. Install Dependencies

From the project root:

```bash
npm install
```

Or from the mobile app directory:

```bash
cd apps/mobile
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

```env
# Expo Public Variables (REQUIRED for mobile app)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://localhost:5000
```

**Important**: 
- These variables must start with `EXPO_PUBLIC_` to be accessible in the app
- Never expose `SUPABASE_SERVICE_ROLE_KEY` - it's server-side only
- Get your Supabase credentials from: Supabase Dashboard → Settings → API

### 3. Start Development Server

From the project root:

```bash
npm run mobile:dev
```

Or from the mobile app directory:

```bash
cd apps/mobile
npm start
```

This will:
- Start the Expo development server
- Show a QR code in your terminal
- Open Expo DevTools in your browser

### 4. Run on Device

**Option A: Expo Go (Recommended for Development)**
1. Install Expo Go on your phone
2. Scan the QR code from the terminal
3. The app will load on your device

**Option B: iOS Simulator (Mac only)**
```bash
npm run mobile:ios
# or
cd apps/mobile && npm run ios
```

**Option C: Android Emulator**
```bash
npm run mobile:android
# or
cd apps/mobile && npm run android
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (safe for client) |
| `EXPO_PUBLIC_API_URL` | Yes | Backend API URL (tRPC endpoint) |

**Security Note**: Only variables prefixed with `EXPO_PUBLIC_` are accessible in the app. Never expose service role keys or secrets.

## Project Structure

```
apps/mobile/
├── src/
│   ├── app/              # Expo Router pages
│   │   ├── (auth)/       # Authentication screens
│   │   └── (tabs)/       # Main app tabs
│   ├── components/       # React Native components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and services
│       ├── supabase.ts  # Supabase client
│       ├── trpc.ts      # tRPC client
│       ├── sqlite.ts    # Local database
│       └── secure-store.ts # Secure storage
├── app.json             # Expo static config
├── app.config.js        # Expo dynamic config (merges with app.json)
├── eas.json            # EAS Build configuration
└── package.json        # Dependencies
```

## Building for Production

### Prerequisites

1. **EAS Account**: Sign up at [expo.dev](https://expo.dev)
2. **EAS CLI**: `npm install -g eas-cli`
3. **Login**: `eas login`

### Build Configuration

The app uses EAS Build with configurations in `eas.json`:

- **Development**: For testing with development client
- **Preview**: Internal distribution builds
- **Production**: App Store and Play Store builds

### Build Commands

**iOS Preview Build:**
```bash
cd apps/mobile
eas build --platform ios --profile preview
```

**Android Preview Build:**
```bash
cd apps/mobile
eas build --platform android --profile preview
```

**Production Build:**
```bash
cd apps/mobile
eas build --platform all --profile production
```

### Environment Variables for Builds

Set environment variables in EAS:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-anon-key
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.yourdomain.com
```

Or configure in `eas.json`:

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

## Testing

### Run Tests

```bash
cd apps/mobile
npm test
```

### Type Checking

```bash
cd apps/mobile
npx tsc --noEmit
```

## Troubleshooting

### JDK and Android SDK Issues

**JDK Version Error:**
- **Problem**: Build fails with "Unsupported Java version" or "Java 17 required"
- **Solution**: 
  1. Install JDK 17 from [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [Adoptium](https://adoptium.net/temurin/releases/?version=17)
  2. Set `JAVA_HOME` environment variable: `set JAVA_HOME=C:\Program Files\Java\jdk-17` (Windows) or `export JAVA_HOME=/usr/lib/jvm/java-17-openjdk` (Linux/Mac)
  3. Verify: `java -version` should show version 17.x.x
  4. If using Android Studio, configure JDK 17 in File → Project Structure → SDK Location

**Android SDK Not Found:**
- **Problem**: "SDK location not found" or "Android SDK not installed"
- **Solution**:
  1. Install Android Studio or standalone Android SDK
  2. Set `ANDROID_HOME` environment variable: `set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk` (Windows) or `export ANDROID_HOME=$HOME/Library/Android/sdk` (Mac)
  3. Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools`
  4. Install required SDK components via Android Studio SDK Manager or `sdkmanager` CLI

**Gradle Build Failures:**
- **Problem**: Gradle sync fails or build errors
- **Solution**:
  1. Verify Gradle version: Check `android/gradle/wrapper/gradle-wrapper.properties` (should be 8.10.2+)
  2. Clear Gradle cache: `cd android && ./gradlew clean` (or `gradlew.bat clean` on Windows)
  3. Delete `.gradle` folder in `android/` directory
  4. Verify Kotlin version in `android/build.gradle` (should be 2.0.21+)

### Environment Variables Not Loading

1. **Restart Expo**: Stop and restart `expo start`
2. **Clear Cache**: `expo start -c`
3. **Check Prefix**: Variables must start with `EXPO_PUBLIC_`
4. **Verify File**: Ensure `.env` is in project root

### Supabase Connection Issues

1. **Check Credentials**: Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. **Network**: Ensure device/simulator can reach Supabase
3. **RLS Policies**: Check Row Level Security policies in Supabase

### Build Failures

1. **Check EAS Status**: `eas build:list`
2. **View Logs**: Click build URL in terminal
3. **Common Issues**:
   - Missing environment variables
   - Invalid app.json/app.config.js
   - Asset files missing (icon.png, splash.png)
   - JDK version mismatch (must be JDK 17)
   - Android SDK version mismatch (compileSdkVersion should be 35)

### Dependency Installation Issues

**React Version Conflicts:**
- The mobile app uses React 18.3.1 (required for Expo SDK 52)
- The root workspace may use React 19 (for web app) - this is fine in a monorepo
- If npm complains about peer dependencies, use `--legacy-peer-deps`:
  ```bash
  cd apps/mobile
  npm install --legacy-peer-deps
  npx expo install --fix --legacy-peer-deps
  ```

**pnpm Installation Issues:**
- If pnpm is not installed: `npm install -g pnpm@8.15.0`
- Or use npm instead: `npm install --legacy-peer-deps`
- pnpm is recommended for monorepos but npm works fine

**Expo SDK Version:**
- This project uses Expo SDK 52 (`expo@~52.0.47`)
- Do NOT upgrade to Expo 54 without following the migration guide
- Run `npx expo install --fix` to ensure all dependencies match SDK 52

### Metro Bundler Issues

```bash
# Clear Metro cache
cd apps/mobile
npx expo start -c

# Reset watchman (if installed)
watchman watch-del-all
```

## Privacy & Security

### Data Storage

- **SecureStore**: Authentication tokens and sensitive data
- **SQLite**: Local cache (offline-first)
- **Supabase**: Encrypted cloud sync (opt-in)

### Permissions

The app requests:
- **Location**: For meeting finder and geofenced triggers (optional)
- **Notifications**: For daily reminders and routine nudges (optional)

All permissions are requested with clear explanations and can be denied.

### Data Sharing

- **Sponsor Sharing**: Opt-in, per-item granularity
- **No Analytics**: No tracking by default (PostHog opt-in only)
- **Export/Delete**: Users can export or delete all data anytime

## Deployment

### App Store (iOS)

1. **Build**: `eas build --platform ios --profile production`
2. **Submit**: `eas submit --platform ios`
3. **Or**: Download IPA and submit manually via App Store Connect

### Play Store (Android)

1. **Build**: `eas build --platform android --profile production`
2. **Submit**: `eas submit --platform android`
3. **Or**: Download APK/AAB and upload to Play Console

## Development Tips

### Hot Reload

- Shake device → "Reload" (or press `r` in terminal)
- Changes to `app.config.js` require restart: `expo start`

### Debugging

- **React Native Debugger**: Install standalone app
- **Flipper**: For advanced debugging
- **Console Logs**: View in terminal or Expo DevTools

### Testing on Physical Devices

- **iOS**: Requires Apple Developer account ($99/year)
- **Android**: Can test with APK on any device
- **Expo Go**: Free, but limited to Expo SDK features

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Supabase Mobile Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md)
2. Review [Expo Forums](https://forums.expo.dev)
3. Open an issue on GitHub

---

**Privacy Note**: This app is designed with privacy in mind. All sensitive data is stored securely, and cloud sync is optional. Users have full control over their data.

