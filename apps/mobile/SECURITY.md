# Mobile App Security & Privacy Guide

This document outlines security and privacy measures implemented in the 12-Step Recovery Companion mobile app.

## Privacy-First Architecture

### Data Storage Layers

1. **SecureStore (Expo)**
   - **Purpose**: Authentication tokens, refresh tokens
   - **Encryption**: Hardware-backed keychain (iOS) / Keystore (Android)
   - **Access**: App-only, requires device authentication
   - **Data**: Never synced to cloud, device-specific

2. **SQLite (Local)**
   - **Purpose**: Offline cache, local data storage
   - **Location**: App sandbox directory
   - **Encryption**: Device-level encryption (iOS/Android)
   - **Access**: App-only, not accessible by other apps
   - **Sync**: Manual sync to Supabase (opt-in)

3. **Supabase (Cloud)**
   - **Purpose**: Optional cloud sync, sponsor sharing
   - **Encryption**: TLS in transit, encrypted at rest
   - **Access**: Row Level Security (RLS) policies
   - **Control**: User can export/delete all data

## Security Measures

### Authentication

- **Supabase Auth**: Industry-standard JWT tokens
- **Token Storage**: SecureStore (hardware-backed)
- **Token Refresh**: Automatic, transparent to user
- **Session Management**: Secure, HTTP-only cookies (web), SecureStore (mobile)

### Data Protection

#### Row Level Security (RLS)

All Supabase tables have RLS policies enforcing:

1. **Owner Access**: Users can only access their own data
2. **Sponsor Access**: Sponsors can only read explicitly shared items
3. **Relationship Validation**: Sponsor access requires active relationship
4. **No Service Role Exposure**: Service role key never exposed to client

#### Encryption

- **In Transit**: TLS 1.3 for all API calls
- **At Rest**: 
  - Device storage: Hardware-backed encryption
  - Supabase: AES-256 encryption
- **Sensitive Messages**: Optional client-side encryption (libsodium) for sponsor messages

### Permissions

The app requests minimal permissions:

1. **Location** (Optional)
   - **When**: Only when user enables geofencing
   - **Purpose**: Meeting finder, trigger locations
   - **Privacy**: Can be denied, app works without it
   - **Background**: Only for geofenced triggers (user-enabled)

2. **Notifications** (Optional)
   - **When**: Only when user enables reminders
   - **Purpose**: Daily check-ins, routine nudges
   - **Privacy**: Can be denied, app works without it
   - **Control**: User can disable per-routine

### Network Security

- **API Calls**: All requests use HTTPS
- **Certificate Pinning**: Not implemented (relies on OS trust)
- **CORS**: Configured for specific origins only
- **Rate Limiting**: Backend enforces rate limits

## Privacy Controls

### User Data Rights

1. **Export**: Users can export all data (JSON, PDF)
2. **Delete**: Users can delete all data (local + cloud)
3. **Sharing Control**: Per-item granularity for sponsor sharing
4. **Opt-Out**: Can disable cloud sync entirely

### Data Minimization

- **No Analytics**: No tracking by default
- **Optional Analytics**: PostHog (opt-in only, anonymous)
- **No Third-Party SDKs**: Except Supabase (privacy-respecting)
- **No Ad Networks**: Zero advertising or tracking

### Sponsor Sharing

- **Granular Control**: Share individual items, not entire account
- **Revocable**: Can revoke sharing anytime
- **Time-Limited**: Relationships can be ended
- **Audit Log**: All sharing actions logged

## Security Best Practices

### For Developers

1. **Never Log Sensitive Data**
   ```typescript
   // ❌ BAD
   console.log("Token:", token);
   
   // ✅ GOOD
   console.log("Token stored successfully");
   ```

2. **Validate All Inputs**
   ```typescript
   // ✅ Use Zod schemas
   const schema = z.object({
     email: z.string().email(),
     password: z.string().min(8),
   });
   ```

3. **Use SecureStore for Tokens**
   ```typescript
   // ✅ GOOD
   await SecureStore.setItemAsync("token", token);
   
   // ❌ BAD - Never use AsyncStorage for tokens
   await AsyncStorage.setItem("token", token);
   ```

4. **Handle Errors Securely**
   ```typescript
   // ✅ GOOD - Generic error message
   catch (error) {
     console.error("Auth failed:", error);
     showError("Authentication failed. Please try again.");
   }
   
   // ❌ BAD - Exposing details
   catch (error) {
     showError(error.message); // May expose sensitive info
   }
   ```

### Environment Variables

- **Never Commit**: `.env` files are gitignored
- **Public Prefix**: Only `EXPO_PUBLIC_*` variables are accessible
- **No Secrets**: Never put secrets in `EXPO_PUBLIC_*` variables
- **EAS Secrets**: Use EAS secrets for production builds

## Compliance

### GDPR

- ✅ Right to access (export data)
- ✅ Right to deletion (delete all data)
- ✅ Data portability (JSON export)
- ✅ Privacy by design (offline-first, opt-in sync)

### HIPAA

- ⚠️ **Not HIPAA Compliant**: This is a consumer app, not a medical device
- ✅ Privacy-respecting design
- ✅ Secure data storage
- ⚠️ Users should not store PHI (Protected Health Information)

### Recovery Program Privacy

- ✅ Respects anonymity traditions
- ✅ No forced sharing
- ✅ User controls all data
- ✅ No tracking or analytics by default

## Threat Model

### Threats Mitigated

1. **Data Breach**: RLS policies, encrypted storage
2. **Token Theft**: SecureStore, hardware-backed encryption
3. **Man-in-the-Middle**: TLS, certificate validation
4. **Unauthorized Access**: RLS, authentication required
5. **Data Loss**: Local backup, export functionality

### Threats Not Mitigated

1. **Physical Device Access**: Device-level security (user responsibility)
2. **Malware**: Relies on OS security
3. **Supply Chain Attacks**: Regular dependency updates recommended

## Security Checklist

Before deploying to production:

- [ ] All environment variables set in EAS secrets
- [ ] RLS policies verified in Supabase
- [ ] No service role keys in client code
- [ ] Certificate pinning considered (if needed)
- [ ] Error messages don't expose sensitive info
- [ ] All API endpoints require authentication
- [ ] Rate limiting enabled on backend
- [ ] SecureStore used for all tokens
- [ ] No sensitive data in logs
- [ ] Privacy policy updated
- [ ] Security audit completed

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email: [security@yourdomain.com] (update with your email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours.

## Resources

- [Expo Security Best Practices](https://docs.expo.dev/guides/security/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [React Native Security](https://reactnative.dev/docs/security)

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0

