/**
 * Notification Settings Migration
 *
 * Creates notification_settings table for user notification preferences
 * Note: Settings are primarily stored client-side in SecureStore for privacy.
 * This table is optional and can be used for cross-device sync if needed.
 */

-- Notification settings table (optional - for cross-device sync)
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Core settings
  notifications_enabled BOOLEAN DEFAULT TRUE,
  permission TEXT DEFAULT 'default', -- 'granted', 'denied', 'default'

  -- Category toggles (stored as JSONB for flexibility)
  categories JSONB DEFAULT '{
    "crisis": true,
    "routine": true,
    "milestone": true,
    "reminder": true,
    "challenge": true,
    "checkIn": true,
    "riskAlert": true
  }'::jsonb,

  -- Scheduled notifications
  morning_check_in JSONB DEFAULT '{"enabled": false, "time": "09:00"}'::jsonb,
  evening_reflection JSONB DEFAULT '{"enabled": false, "time": "20:00"}'::jsonb,
  daily_challenge JSONB DEFAULT '{"enabled": true, "time": "08:00"}'::jsonb,

  -- Quiet hours
  quiet_hours JSONB DEFAULT '{
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }'::jsonb,

  -- Additional settings
  streak_reminders BOOLEAN DEFAULT TRUE,
  milestone_alerts BOOLEAN DEFAULT TRUE,
  risk_alerts BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id
  ON notification_settings(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

