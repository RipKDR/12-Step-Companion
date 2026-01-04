/**
 * Daily Challenges Migration
 *
 * Creates tables for daily recovery challenges with contextual selection
 */

-- Daily challenge templates
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program TEXT NOT NULL CHECK (program IN ('NA', 'AA')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gratitude', 'reflection', 'action', 'connection', 'self-care', 'sponsor', 'meeting')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  min_clean_days INTEGER DEFAULT 0, -- Minimum clean days to see this challenge
  max_clean_days INTEGER, -- Maximum clean days (NULL = no limit)
  points INTEGER DEFAULT 10, -- Points awarded for completion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge completions
CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT, -- Optional user notes about completion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, DATE(completed_at)) -- One completion per challenge per day
);

-- Challenge streaks (for tracking consecutive completions)
CREATE TABLE IF NOT EXISTS challenge_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_challenges_program_day ON daily_challenges(program, day_of_week);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_date ON challenge_completions(user_id, DATE(completed_at));
CREATE INDEX IF NOT EXISTS idx_challenge_streaks_user ON challenge_streaks(user_id);

-- RLS Policies
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_streaks ENABLE ROW LEVEL SECURITY;

-- Daily challenges are public (read-only for all authenticated users)
CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  USING (true);

-- Users can only view their own completions
CREATE POLICY "Users can view own challenge completions"
  ON challenge_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert own challenge completions"
  ON challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own completions
CREATE POLICY "Users can update own challenge completions"
  ON challenge_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only view their own streaks
CREATE POLICY "Users can view own challenge streaks"
  ON challenge_streaks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert/update their own streaks
CREATE POLICY "Users can manage own challenge streaks"
  ON challenge_streaks FOR ALL
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_daily_challenges_updated_at
  BEFORE UPDATE ON daily_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_streaks_updated_at
  BEFORE UPDATE ON challenge_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data: 7 challenges per program (one for each day of week)
-- NA Challenges
INSERT INTO daily_challenges (program, day_of_week, title, description, category, difficulty, min_clean_days, points) VALUES
('NA', 0, 'Sunday Reflection', 'Take 10 minutes to reflect on your recovery journey this week. What are you grateful for?', 'reflection', 'easy', 0, 10),
('NA', 1, 'Monday Motivation', 'Reach out to a fellow member today. Share your experience, strength, and hope.', 'connection', 'easy', 0, 10),
('NA', 2, 'Tuesday Gratitude', 'Write down three things you''re grateful for in your recovery today.', 'gratitude', 'easy', 0, 10),
('NA', 3, 'Wednesday Wellness', 'Do one act of self-care today: exercise, meditation, or a healthy meal.', 'self-care', 'medium', 7, 15),
('NA', 4, 'Thursday Step Work', 'Spend 30 minutes on your current step work. Write or reflect on the prompts.', 'action', 'medium', 0, 15),
('NA', 5, 'Friday Sponsor Check-in', 'Call or message your sponsor. Share how your week has been.', 'sponsor', 'easy', 0, 10),
('NA', 6, 'Saturday Meeting', 'Attend a meeting today, either in-person or online.', 'meeting', 'easy', 0, 15);

-- AA Challenges
INSERT INTO daily_challenges (program, day_of_week, title, description, category, difficulty, min_clean_days, points) VALUES
('AA', 0, 'Sunday Serenity', 'Take 10 minutes for quiet reflection. Read a page from your daily meditation book.', 'reflection', 'easy', 0, 10),
('AA', 1, 'Monday Connection', 'Call another member today. Ask how they''re doing and share your own experience.', 'connection', 'easy', 0, 10),
('AA', 2, 'Tuesday Gratitude List', 'Write down five things you''re grateful for today, big or small.', 'gratitude', 'easy', 0, 10),
('AA', 3, 'Wednesday Wellness', 'Take care of your physical health: exercise, eat well, or get enough rest.', 'self-care', 'medium', 7, 15),
('AA', 4, 'Thursday Step Work', 'Work on your current step for 30 minutes. Write about your progress.', 'action', 'medium', 0, 15),
('AA', 5, 'Friday Sponsor Contact', 'Reach out to your sponsor. Share your week and ask for guidance if needed.', 'sponsor', 'easy', 0, 10),
('AA', 6, 'Saturday Meeting', 'Attend a meeting this weekend. Connect with your fellowship.', 'meeting', 'easy', 0, 15);

