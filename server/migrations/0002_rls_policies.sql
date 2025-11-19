-- Migration: 0002_rls_policies.sql
-- Description: Creates Row Level Security (RLS) policies for all tables
-- Date: 2025-01-27
-- 
-- RLS Policy Pattern:
-- 1. Owner: Full CRUD access to own rows
-- 2. Sponsor: Read-only access to rows where is_shared_with_sponsor = true AND relationship is active
-- 3. Public: No access (except profiles: read handle/avatar for sponsor lookup)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE craving_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sobriety_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own profile
CREATE POLICY "profiles_owner_all" ON profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public: Read handle and avatar for sponsor lookup (no sensitive data)
CREATE POLICY "profiles_public_read_handle" ON profiles
  FOR SELECT
  USING (true); -- Allow reading handle/avatar for sponsor code lookup

-- ============================================================================
-- STEPS TABLE POLICIES
-- ============================================================================

-- Public: Read-only access to step definitions (they're not user-specific)
CREATE POLICY "steps_public_read" ON steps
  FOR SELECT
  USING (true);

-- ============================================================================
-- STEP ENTRIES TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own step entries
CREATE POLICY "step_entries_owner_all" ON step_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sponsor: Read-only access to shared step entries where relationship is active
CREATE POLICY "step_entries_sponsor_read" ON step_entries
  FOR SELECT
  USING (
    is_shared_with_sponsor = true
    AND EXISTS (
      SELECT 1 FROM sponsor_relationships
      WHERE sponsor_id = auth.uid()
        AND sponsee_id = step_entries.user_id
        AND status = 'active'
    )
  );

-- ============================================================================
-- DAILY ENTRIES TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own daily entries
CREATE POLICY "daily_entries_owner_all" ON daily_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sponsor: Read-only access to shared daily entries where relationship is active
CREATE POLICY "daily_entries_sponsor_read" ON daily_entries
  FOR SELECT
  USING (
    share_with_sponsor = true
    AND EXISTS (
      SELECT 1 FROM sponsor_relationships
      WHERE sponsor_id = auth.uid()
        AND sponsee_id = daily_entries.user_id
        AND status = 'active'
    )
  );

-- ============================================================================
-- CRAVING EVENTS TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own craving events
CREATE POLICY "craving_events_owner_all" ON craving_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ACTION PLANS TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own action plans
CREATE POLICY "action_plans_owner_all" ON action_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sponsor: Read-only access to shared action plans where relationship is active
CREATE POLICY "action_plans_sponsor_read" ON action_plans
  FOR SELECT
  USING (
    is_shared_with_sponsor = true
    AND EXISTS (
      SELECT 1 FROM sponsor_relationships
      WHERE sponsor_id = auth.uid()
        AND sponsee_id = action_plans.user_id
        AND status = 'active'
    )
  );

-- ============================================================================
-- ROUTINES TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own routines
CREATE POLICY "routines_owner_all" ON routines
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ROUTINE LOGS TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own routine logs
CREATE POLICY "routine_logs_owner_all" ON routine_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SOBRIETY STREAKS TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own sobriety streaks
CREATE POLICY "sobriety_streaks_owner_all" ON sobriety_streaks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SPONSOR RELATIONSHIPS TABLE POLICIES
-- ============================================================================

-- Sponsor: Full access to relationships where user is the sponsor
CREATE POLICY "sponsor_relationships_sponsor_all" ON sponsor_relationships
  FOR ALL
  USING (auth.uid() = sponsor_id)
  WITH CHECK (auth.uid() = sponsor_id);

-- Sponsee: Full access to relationships where user is the sponsee
CREATE POLICY "sponsor_relationships_sponsee_all" ON sponsor_relationships
  FOR ALL
  USING (auth.uid() = sponsee_id)
  WITH CHECK (auth.uid() = sponsee_id);

-- ============================================================================
-- TRIGGER LOCATIONS TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own trigger locations
CREATE POLICY "trigger_locations_owner_all" ON trigger_locations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Sender: Full access to messages they sent
CREATE POLICY "messages_sender_all" ON messages
  FOR ALL
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Recipient: Read access to messages they received
CREATE POLICY "messages_recipient_read" ON messages
  FOR SELECT
  USING (auth.uid() = recipient_id);

-- ============================================================================
-- NOTIFICATION TOKENS TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own notification tokens
CREATE POLICY "notification_tokens_owner_all" ON notification_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RISK SIGNALS TABLE POLICIES
-- ============================================================================

-- Owner: Full access to own risk signals
CREATE POLICY "risk_signals_owner_all" ON risk_signals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- AUDIT LOG TABLE POLICIES
-- ============================================================================

-- Owner: Read-only access to own audit log entries
CREATE POLICY "audit_log_owner_read" ON audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- System: Full access (for service role operations)
-- Note: Service role key bypasses RLS, so no policy needed for writes

-- ============================================================================
-- HELPER FUNCTION: Check if user is sponsor of another user
-- ============================================================================

CREATE OR REPLACE FUNCTION is_sponsor_of(sponsee_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sponsor_relationships
    WHERE sponsor_id = auth.uid()
      AND sponsee_id = sponsee_user_id
      AND status = 'active'
  );
END;
$$;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. All policies use auth.uid() to get the current user's ID from Supabase Auth
-- 2. Sponsor policies check both is_shared_with_sponsor flag AND active relationship
-- 3. Service role key bypasses RLS - use with extreme caution
-- 4. Policies are restrictive by default - only allow what's explicitly needed
-- 5. Test all policies with different user contexts before production deployment

