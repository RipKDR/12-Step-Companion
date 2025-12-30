-- Migration: 0001_supabase_schema.sql
-- Description: Creates all tables, enums, and indexes for Recovery Companion app
-- Date: 2025-01-27

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE program AS ENUM ('NA', 'AA');
CREATE TYPE sponsor_status AS ENUM ('pending', 'active', 'revoked');
CREATE TYPE routine_status AS ENUM ('completed', 'skipped', 'failed');

-- Profiles table - User profiles linked to Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  handle VARCHAR(50) UNIQUE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  avatar_url VARCHAR(255),
  clean_date TIMESTAMP,
  program program,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_handle ON profiles(handle);

-- Steps table - Step definitions for NA/AA programs
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program program NOT NULL,
  step_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(program, step_number)
);

CREATE INDEX idx_steps_program_step ON steps(program, step_number);

-- Step entries table - User's step work entries
CREATE TABLE step_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  content JSONB NOT NULL,
  is_shared_with_sponsor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_entries_user_id ON step_entries(user_id);
CREATE INDEX idx_step_entries_step_id ON step_entries(step_id);
CREATE INDEX idx_step_entries_user_step ON step_entries(user_id, step_id);

-- Daily entries table - Daily recovery logs
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date TIMESTAMP NOT NULL DEFAULT NOW(),
  cravings_intensity INTEGER CHECK (cravings_intensity >= 0 AND cravings_intensity <= 10),
  feelings JSONB DEFAULT '[]'::jsonb,
  triggers JSONB DEFAULT '[]'::jsonb,
  coping_actions JSONB DEFAULT '[]'::jsonb,
  gratitude TEXT,
  notes TEXT,
  share_with_sponsor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

CREATE INDEX idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX idx_daily_entries_entry_date ON daily_entries(entry_date);
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, entry_date);

-- Craving events table - Individual craving tracking events
CREATE TABLE craving_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
  intensity INTEGER NOT NULL CHECK (intensity >= 0 AND intensity <= 10),
  trigger_type VARCHAR(100),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  notes TEXT,
  response_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_craving_events_user_id ON craving_events(user_id);
CREATE INDEX idx_craving_events_occurred_at ON craving_events(occurred_at);

-- Action plans table - If-then plans for crisis situations
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  situation TEXT,
  if_then JSONB DEFAULT '[]'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  is_shared_with_sponsor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_action_plans_user_id ON action_plans(user_id);

-- Routines table - Daily/weekly routines with schedules
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  schedule JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_active ON routines(active);

-- Routine logs table - Completion logs for routines
CREATE TABLE routine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status routine_status NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_routine_logs_routine_id ON routine_logs(routine_id);
CREATE INDEX idx_routine_logs_user_id ON routine_logs(user_id);
CREATE INDEX idx_routine_logs_run_at ON routine_logs(run_at);

-- Sobriety streaks table - Track sobriety streaks
CREATE TABLE sobriety_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  relapse_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sobriety_streaks_user_id ON sobriety_streaks(user_id);
CREATE INDEX idx_sobriety_streaks_start_date ON sobriety_streaks(start_date);

-- Sponsor relationships table - Connections between sponsors and sponsees
CREATE TABLE sponsor_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status sponsor_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(sponsor_id, sponsee_id)
);

CREATE INDEX idx_sponsor_relationships_sponsor_id ON sponsor_relationships(sponsor_id);
CREATE INDEX idx_sponsor_relationships_sponsee_id ON sponsor_relationships(sponsee_id);
CREATE INDEX idx_sponsor_relationships_status ON sponsor_relationships(status);

-- Trigger locations table - Geofenced trigger locations
CREATE TABLE trigger_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_m INTEGER NOT NULL DEFAULT 50 CHECK (radius_m >= 50),
  on_enter JSONB DEFAULT '[]'::jsonb,
  on_exit JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trigger_locations_user_id ON trigger_locations(user_id);
CREATE INDEX idx_trigger_locations_active ON trigger_locations(active);

-- Messages table - Encrypted messages between users
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_ciphertext TEXT NOT NULL,
  nonce VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Notification tokens table - Push notification tokens
CREATE TABLE notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  platform VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_tokens_user_id ON notification_tokens(user_id);
CREATE INDEX idx_notification_tokens_token ON notification_tokens(token);

-- Risk signals table - Risk scoring for early intervention
CREATE TABLE risk_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scored_at TIMESTAMP NOT NULL DEFAULT NOW(),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  inputs JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_risk_signals_user_id ON risk_signals(user_id);
CREATE INDEX idx_risk_signals_scored_at ON risk_signals(scored_at);

-- Audit log table - Audit trail for sensitive operations
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step_entries_updated_at BEFORE UPDATE ON step_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON action_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sobriety_streaks_updated_at BEFORE UPDATE ON sobriety_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_relationships_updated_at BEFORE UPDATE ON sponsor_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trigger_locations_updated_at BEFORE UPDATE ON trigger_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_tokens_updated_at BEFORE UPDATE ON notification_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

