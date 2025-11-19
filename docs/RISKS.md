# Infrastructure Migration Risks & Mitigations

**Date**: 2025-01-27  
**Project**: 12-Step Recovery Companion - Supabase/tRPC Migration

## Overview

This document outlines identified risks and their mitigations for migrating the 12-Step Recovery Companion app to use Supabase, tRPC, and full infrastructure. All risks are categorized by severity and include specific mitigation strategies.

---

## Critical Risks

### 1. Supabase Migration Breaking Existing Neon Data

**Risk**: Migrating from Neon to Supabase could result in data loss or corruption if not handled carefully.

**Impact**: 
- Loss of user data (sessions, users table)
- Service disruption
- Data inconsistency between Neon and Supabase

**Mitigation**:
- Keep Neon database running alongside Supabase during transition period
- Create data migration scripts that copy data from Neon to Supabase
- Run migrations in staging environment first
- Implement dual-write pattern initially (write to both databases)
- Add data validation checks to ensure consistency
- Create rollback plan to revert to Neon if issues occur
- Document migration process in `server/migrations/README.md`

**Status**: Mitigated via dual-database approach

---

### 2. RLS Policies Being Too Restrictive/Permissive

**Risk**: Row Level Security (RLS) policies could be incorrectly configured, either blocking legitimate access or allowing unauthorized access.

**Impact**:
- Users unable to access their own data
- Sponsors unable to view shared items
- Unauthorized access to sensitive recovery data
- Privacy violations

**Mitigation**:
- Start with restrictive policies, test thoroughly, then relax as needed
- Document each RLS policy with clear explanation of access patterns
- Create test suite that validates RLS policies:
  - Owner can access own rows
  - Sponsor can only access rows where `is_shared_with_sponsor = true` AND relationship is active
  - Public cannot access private data
- Use Supabase's RLS policy testing tools
- Implement audit logging to track access patterns
- Review policies with security team before production deployment
- Create policy documentation in `server/migrations/0002_rls_policies.sql`

**Status**: Mitigated via comprehensive testing strategy

---

### 3. Service Role Key Exposure to Client

**Risk**: Supabase service role key could be accidentally exposed to client-side code, allowing full database access.

**Impact**:
- Complete database compromise
- Unauthorized data access/modification
- Privacy violations
- Compliance issues (HIPAA, GDPR)

**Mitigation**:
- Never import server-side Supabase client in client code
- Use environment variable checks: `if (typeof window !== 'undefined') throw new Error('Server-only code')`
- Separate client and server Supabase clients into different files:
  - `packages/api/src/lib/supabase.ts` (client, anon key only)
  - `packages/api/src/lib/supabase-server.ts` (server, service role key)
- Add ESLint rule to prevent importing server files in client code
- Use TypeScript path aliases to make imports explicit
- Add pre-commit hook to scan for service role key in client code
- Document security practices in code comments
- Use Supabase's anon key for all client-side operations

**Status**: Mitigated via strict code organization and environment checks

---

## High Priority Risks

### 4. tRPC Setup Conflicts with Express Routes

**Risk**: Mounting tRPC at `/api/trpc` could conflict with existing Express routes at `/api/*`.

**Impact**:
- Route conflicts causing 404 errors
- Broken API endpoints
- Client-side errors
- Service disruption

**Mitigation**:
- Mount tRPC at specific path: `/api/trpc/*`
- Keep Express routes at `/api/*` (non-trpc paths)
- Use Express middleware to route `/api/trpc` requests to tRPC handler
- Test all existing Express routes after tRPC integration
- Document route structure in `server/routes.ts`
- Add route conflict detection in tests
- Use Express route ordering (specific routes before wildcard)

**Status**: Mitigated via careful route mounting strategy

---

### 5. Mobile Location Tracking Battery Drain

**Risk**: Background location tracking could drain device battery excessively.

**Impact**:
- Poor user experience
- App uninstalls
- Negative reviews
- Reduced engagement

**Mitigation**:
- Use Expo TaskManager with "significant location changes" mode (not continuous)
- Implement geofencing with minimum radius (50m) to reduce update frequency
- Respect quiet hours (user-configurable)
- Make location tracking opt-in only
- Provide clear battery impact information to users
- Use efficient location update intervals (not more than once per minute)
- Allow users to disable location tracking anytime
- Monitor battery usage in testing
- Document battery optimization in `apps/mobile/src/lib/geofencing.ts`

**Status**: Mitigated via efficient location tracking strategy

---

### 6. Geofencing False Positives

**Risk**: Geofencing triggers could fire incorrectly, causing action plans to open unnecessarily.

**Impact**:
- User frustration
- Reduced trust in app
- Disruption to user workflow
- Potential privacy concerns

**Mitigation**:
- Require minimum geofence radius (50m) to reduce sensitivity
- Implement debouncing: only trigger if location detected for N seconds
- Add user confirmation before opening action plan (optional)
- Log all geofence triggers for debugging
- Allow users to disable geofencing per location
- Test geofencing in various environments (urban, rural, indoors)
- Implement geofence exit detection to prevent re-triggering
- Document geofencing behavior in user-facing documentation

**Status**: Mitigated via debouncing and minimum radius requirements

---

## Medium Priority Risks

### 7. Database Schema Migration Failures

**Risk**: Database migrations could fail mid-execution, leaving database in inconsistent state.

**Impact**:
- Database corruption
- Service downtime
- Data loss
- Rollback complexity

**Mitigation**:
- Use Supabase migration system (transactional migrations)
- Test migrations on staging database first
- Create migration rollback scripts
- Backup database before running migrations
- Run migrations during low-traffic periods
- Monitor migration execution
- Document migration process in `server/migrations/README.md`

**Status**: Mitigated via transactional migrations and testing

---

### 8. TypeScript Type Generation Issues

**Risk**: Generated TypeScript types from Supabase schema could be incorrect or out of sync.

**Impact**:
- Type errors in code
- Runtime errors
- Developer confusion
- Reduced type safety

**Mitigation**:
- Regenerate types after every schema change
- Add type generation to CI/CD pipeline
- Validate types match schema before deployment
- Use `supabase gen types typescript` command consistently
- Document type generation process
- Add type checking to pre-commit hooks

**Status**: Mitigated via automated type generation

---

### 9. Offline Cache Sync Conflicts

**Risk**: Mobile app's SQLite cache could conflict with Supabase data during sync.

**Impact**:
- Data loss
- Inconsistent state
- User confusion
- Sync failures

**Mitigation**:
- Implement conflict resolution strategy (last-write-wins or user choice)
- Use timestamps for conflict detection
- Queue mutations when offline, apply in order when online
- Test offline/online transitions thoroughly
- Document sync behavior
- Add sync status indicators in UI

**Status**: Mitigated via conflict resolution strategy

---

### 10. Sponsor Code Security

**Risk**: Sponsor connection codes could be guessed or brute-forced.

**Impact**:
- Unauthorized sponsor access
- Privacy violations
- Trust issues

**Mitigation**:
- Use cryptographically secure random codes (minimum 8 characters, alphanumeric)
- Implement rate limiting on code entry attempts
- Add expiration to codes (e.g., 24 hours)
- Require mutual confirmation (sponsor and sponsee both confirm)
- Log all code generation and usage
- Use one-time codes where possible

**Status**: Mitigated via secure code generation and rate limiting

---

## Low Priority Risks

### 11. Notification Delivery Failures

**Risk**: Push notifications might not be delivered reliably.

**Impact**:
- Missed routine reminders
- Reduced engagement
- User frustration

**Mitigation**:
- Use Expo's notification system (reliable delivery)
- Implement fallback to in-app notifications
- Allow users to configure notification preferences
- Test notifications on multiple devices/platforms
- Monitor notification delivery rates

**Status**: Mitigated via Expo notification system

---

### 12. Performance Degradation

**Risk**: Adding Supabase and tRPC layers could slow down API responses.

**Impact**:
- Poor user experience
- Increased server costs
- Reduced engagement

**Mitigation**:
- Implement caching at multiple levels (React Query, Supabase)
- Use connection pooling
- Optimize database queries
- Monitor performance metrics
- Load test before production deployment
- Use Supabase's built-in performance optimizations

**Status**: Mitigated via caching and optimization

---

## Risk Monitoring

### Ongoing Monitoring

- **Error Tracking**: Use Sentry to monitor errors in production
- **Performance Monitoring**: Track API response times and database query performance
- **Security Audits**: Regular security reviews of RLS policies and access patterns
- **User Feedback**: Monitor user reports for issues related to migration

### Review Schedule

- **Weekly**: Review error logs and performance metrics
- **Monthly**: Security audit of RLS policies
- **Quarterly**: Comprehensive risk assessment review

---

## Conclusion

All identified risks have mitigation strategies in place. The migration will proceed incrementally with thorough testing at each phase. Critical risks (data loss, security) are addressed with multiple layers of protection.

**Next Steps**:
1. Implement Supabase integration (A1)
2. Create database schema with RLS policies (A2)
3. Setup tRPC with proper context (A3)
4. Test each phase thoroughly before proceeding

---

**Document Owner**: Engineering Team  
**Last Updated**: 2025-01-27  
**Review Date**: 2025-02-27

