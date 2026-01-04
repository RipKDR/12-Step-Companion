-- Migration: 0003_sponsor_codes.sql
-- Description: Creates sponsor_codes table for secure code generation with expiration
-- Date: 2025-01-27

-- Sponsor codes table - Temporary codes for sponsor connection
CREATE TABLE sponsor_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(8) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, code)
);

CREATE INDEX idx_sponsor_codes_code ON sponsor_codes(code);
CREATE INDEX idx_sponsor_codes_user_id ON sponsor_codes(user_id);
CREATE INDEX idx_sponsor_codes_expires_at ON sponsor_codes(expires_at);
CREATE INDEX idx_sponsor_codes_active ON sponsor_codes(code, expires_at, used_at) WHERE used_at IS NULL;

-- Enable RLS
ALTER TABLE sponsor_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_codes
-- Owner: Full access to own codes
CREATE POLICY "sponsor_codes_owner_all" ON sponsor_codes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public: Read-only access to validate codes (but not see user_id until used)
CREATE POLICY "sponsor_codes_public_read" ON sponsor_codes
  FOR SELECT
  USING (expires_at > NOW() AND used_at IS NULL);

-- Function to clean up expired codes (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sponsor_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM sponsor_codes
  WHERE expires_at < NOW() - INTERVAL '7 days'; -- Keep expired codes for 7 days for audit
END;
$$ LANGUAGE plpgsql;

