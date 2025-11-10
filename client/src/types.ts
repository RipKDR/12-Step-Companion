import type { FeatureFlags } from '@/store/featureFlags';

export interface Profile {
  id: string;
  name: string;
  cleanDate: string; // ISO 8601
  timezone: string;
  hasPasscode: boolean;
  sponsorName?: string;
  sponsorPhone?: string;
}

export interface StepQuestion {
  id: string;
  prompt: string;
  help?: string;
  section?: string;
}

export interface StepContent {
  step: number;
  title: string;
  subtitle?: string;
  overviewLabels: string[];
  questions: StepQuestion[];
}

export interface StepAnswer {
  questionId: string;
  stepNumber: number;
  answer: string;
  tags?: string[];
  updatedAtISO: string;
}

export interface DailyCard {
  id: string;
  date: string; // YYYY-MM-DD
  morningIntent?: string;
  eveningReflection?: string;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  gratitudeItems?: string[];
  quickNotes?: string;
  updatedAtISO: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO 8601
  content: string;
  mood?: number; // 0-10
  tags: string[];
  isTrigger?: boolean;
  triggerType?: string;
  triggerIntensity?: number;
  copingActions?: string;
  updatedAtISO: string;
  audioData?: string; // V2: Base64 encoded audio (optional)
  audioDuration?: number; // V2: Duration in seconds
}

export interface WorksheetField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
  required?: boolean;
  help?: string;
}

export interface WorksheetTemplate {
  id: string;
  title: string;
  description: string;
  fields: WorksheetField[];
}

export interface WorksheetResponse {
  id: string;
  templateId: string;
  responses: Record<string, any>;
  createdAtISO: string;
  updatedAtISO: string;
}

export interface EmergencyAction {
  id: string;
  label: string;
  type: 'call' | 'timer' | 'exercise' | 'notes';
  data: string; // tel: number, timer duration, exercise name, or notes text
  icon: string;
}

export interface FellowshipContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  relationshipType: 'sponsor' | 'sponsee' | 'friend' | 'home-group' | 'other';
  isEmergencyContact: boolean;
  notes?: string;
  createdAtISO: string;
  updatedAtISO: string;
}

export interface RecoveryQuote {
  id: string;
  text: string;
  author?: string;
  source?: string;
  category: 'hope' | 'strength' | 'connection' | 'principles' | 'service' | 'gratitude';
}

export interface NotificationSettings {
  enabled: boolean;
  permission: 'granted' | 'denied' | 'default';

  morningCheckIn: {
    enabled: boolean;
    time: string; // HH:MM format (24-hour)
  };

  eveningReflection: {
    enabled: boolean;
    time: string; // HH:MM format
  };

  milestoneAlerts: boolean;
  streakReminders: boolean;
  challengeReminders: boolean;

  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export interface AnalyticsSettings {
  enabled: boolean;
  collectUsageData: boolean;
  collectPerformanceData: boolean;
  retentionDays: number; // How long to keep analytics data
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  cloudSync: boolean; // stub
  notifications: NotificationSettings;
  enableVoiceRecording: boolean; // V2: Enable audio recording in journal
  analytics: AnalyticsSettings; // V3: Privacy-first analytics
  featureFlags?: FeatureFlags; // Feature flags for gradual rollout
}

export interface Meeting {
  id: string;
  name: string;
  type: string;
  location: string;
  date: string;
  notes?: string;
  recurring?: boolean;
  recurrencePattern?: string;
  reminderEnabled?: boolean;
  createdAtISO: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate?: string;
  completed: boolean;
  progress: number;
  checkIns: GoalCheckIn[];
  createdAtISO: string;
  updatedAtISO: string;
}

export interface GoalCheckIn {
  id: string;
  date: string;
  notes: string;
  progress: number;
}

export interface StreakHistoryEntry {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface StreakData {
  type: 'journaling' | 'dailyCards' | 'meetings' | 'stepWork';
  current: number;
  longest: number;
  lastActivityDate: string; // ISO 8601
  startDate: string; // ISO 8601 - when current streak started
  history: StreakHistoryEntry[];
}

export interface Streaks {
  journaling: StreakData;
  dailyCards: StreakData;
  meetings: StreakData;
  stepWork: StreakData;
}

export interface CelebratedMilestone {
  id: string;
  type: 'sobriety' | 'streak' | 'achievement' | 'step';
  milestone: string; // e.g., "1d", "7d", "30d", "step-1"
  celebratedAtISO: string;
}

export interface AchievementCriteria {
  type: 'sobriety_days' | 'step_completed' | 'journal_count' | 'journal_streak' |
        'daily_card_count' | 'daily_card_streak' | 'gratitude_count' |
        'meeting_count' | 'has_sponsor' | 'contact_count' |
        'crisis_mode_used' | 'emergency_contact_used' |
        'morning_card_count' | 'evening_card_count' | 'meditation_count' | 'any_streak';
  target: number;
}

export interface Achievement {
  id: string;
  category: 'sobriety' | 'step-work' | 'community' | 'self-care' | 'crisis';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  title: string;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
}

export interface UnlockedAchievement {
  id: string;
  achievementId: string;
  unlockedAtISO: string;
  progress?: number; // For incremental achievements
}

export interface ChallengeTheme {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface DailyChallenge {
  id: string;
  theme: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  title: string;
  description: string;
  reason: string;
}

export interface ChallengeCompletion {
  id: string;
  challengeId: string;
  completedAtISO: string;
  notes?: string;
}

export type AnalyticsEventType =
  | 'app_opened'
  | 'profile_created'
  | 'journal_entry_created'
  | 'journal_entry_voice_used'
  | 'journal_entry_audio_recorded'
  | 'daily_card_morning_completed'
  | 'daily_card_evening_completed'
  | 'step_answer_saved'
  | 'meeting_logged'
  | 'goal_created'
  | 'goal_completed'
  | 'crisis_mode_activated'
  | 'emergency_contact_called'
  | 'achievement_unlocked'
  | 'milestone_celebrated'
  | 'daily_challenge_completed'
  | 'streak_extended'
  | 'toast_shown'
  | 'skeleton_loader_shown'
  | 'empty_state_viewed'
  | 'keyboard_shortcut_used'
  | 'performance_metric'
  | 'page_view'
  | 'feature_discovered';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string; // ISO 8601
  metadata?: Record<string, any>; // Non-PII metadata only
  sessionId?: string;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  eventsByType: Record<AnalyticsEventType, number>;
  activeStreaks: number;
  totalJournalEntries: number;
  totalMeetings: number;
  totalGoals: number;
  sobrietyDays: number;
  lastActivityDate: string;
}

export interface AppState {
  version: number;
  profile?: Profile;
  stepAnswers: Record<string, StepAnswer>; // questionId -> answer
  dailyCards: Record<string, DailyCard>; // date -> card
  journalEntries: Record<string, JournalEntry>; // id -> entry
  worksheetResponses: Record<string, WorksheetResponse>; // id -> response
  meetings?: Meeting[]; // meeting log
  goals?: Record<string, Goal>; // id -> goal
  emergencyActions: EmergencyAction[];
  fellowshipContacts: Record<string, FellowshipContact>; // id -> contact
  favoriteQuotes: string[]; // quote IDs
  settings: AppSettings;
  onboardingComplete: boolean;
  streaks: Streaks; // V2: Habit tracking
  celebratedMilestones?: Record<string, CelebratedMilestone>; // V2: Milestone celebrations
  unlockedAchievements?: Record<string, UnlockedAchievement>; // V2: Achievement system
  completedChallenges?: Record<string, ChallengeCompletion>; // V2: Daily challenges
  analyticsEvents?: Record<string, AnalyticsEvent>; // V3: Privacy-first analytics
}
