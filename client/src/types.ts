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
  
  // Recovery Rhythm fields
  // Morning: "Set the Tone"
  morningIntention?: "stay-clean" | "stay-connected" | "be-gentle" | "custom";
  morningIntentionCustom?: string; // if custom
  morningReminder?: string; // "If today gets hard, remember..."
  
  // Midday: "Pulse Check"
  middayPulseCheck?: {
    mood: number; // 1-5 (low -> great)
    craving: number; // 0-10 (none -> intense)
    context: string[]; // ["Alone", "With people", "Bored", "Stressed", "Hungry"]
    timestampISO: string;
  };
  middayCompleted: boolean;
  
  // Night: "Tiny Inventory"
  eveningStayedClean?: "yes" | "no" | "close-call";
  eveningStayedConnected?: {
    meetings: boolean;
    sponsor: boolean;
    recoveryFriends: boolean;
  };
  eveningGratitude?: string; // Single item for rhythm (separate from gratitudeItems)
  eveningImprovement?: string; // "One thing I'd like to do differently tomorrow"
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
  type: "text" | "textarea" | "select" | "number";
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
  type: "call" | "timer" | "exercise" | "notes";
  data: string; // tel: number, timer duration, exercise name, or notes text
  icon: string;
}

export interface FellowshipContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  relationshipType: "sponsor" | "sponsee" | "friend" | "home-group" | "other";
  isEmergencyContact: boolean;
  notes?: string;
  createdAtISO: string;
  updatedAtISO: string;
}

// Recovery Scenes - Situation-specific playbooks for high-risk moments
export interface SceneAction {
  id: string;
  type: "call" | "text" | "tool" | "reminder" | "custom" | "meeting" | "safety-plan";
  label: string; // "Call Sarah", "Do breathing exercise", "Go to meeting"
  data: string; // phone number, tool name, custom text, meeting ID
  contactId?: string; // If type is "call" or "text", reference FellowshipContact
  order: number; // Display order (1, 2, 3)
}

export interface RecoveryScene {
  id: string;
  label: string; // "Home alone after 10pm", "Day after payday"
  description?: string;
  
  // Triggers & Context
  triggers: string[]; // ["loneliness", "boredom", "stress", "financial stress"]
  earlyWarningSigns: string[]; // ["tight chest", "racing thoughts", "fantasizing", "restlessness"]
  
  // Actions & Replacements
  actions: SceneAction[]; // Ordered list of actions to take
  messageFromSoberMe: string; // "Remember: This feeling is temporary..."
  
  // Metadata
  createdAtISO: string;
  updatedAtISO: string;
  lastUsedISO?: string;
  usageCount: number;
  active: boolean;
  
  // Optional: Time Triggers
  timeTriggers?: {
    dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    timeRange?: { start: string; end: string }; // "20:00" - "23:00" (24-hour format)
  };
  
  // Optional: Location Trigger (future, opt-in)
  locationTrigger?: {
    lat: number;
    lng: number;
    radiusM: number; // meters
    label: string; // "Home", "Work", "Dealer's area"
  };
}

export interface SceneUsage {
  id: string;
  sceneId: string;
  activatedAtISO: string;
  activationType: "manual" | "time-trigger" | "location-trigger";
  actionsCompleted: string[]; // SceneAction IDs
  outcome?: "helped" | "partial" | "didnt-help";
  notes?: string;
}

export interface RecoveryQuote {
  id: string;
  text: string;
  author?: string;
  source?: string;
  category:
    | "hope"
    | "strength"
    | "connection"
    | "principles"
    | "service"
    | "gratitude";
}

export interface NotificationSettings {
  enabled: boolean;
  permission: "granted" | "denied" | "default";

  morningCheckIn: {
    enabled: boolean;
    time: string; // HH:MM format (24-hour)
  };

  eveningReflection: {
    enabled: boolean;
    time: string; // HH:MM format
  };

  middayPulseCheck: {
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

  jitaiNotifications: {
    enabled: boolean;
    respectQuietHours: boolean;
    maxPerDay: number; // Limit notifications
  };

  meetingReminders: {
    enabled: boolean;
    minutesBefore: number[]; // [15, 30, 60]
    respectQuietHours: boolean;
  };
}

export interface AnalyticsSettings {
  enabled: boolean;
  collectUsageData: boolean;
  collectPerformanceData: boolean;
  retentionDays: number; // How long to keep analytics data
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  highContrast: boolean;
  reducedMotion: boolean;
  cloudSync: boolean; // stub
  notifications: NotificationSettings;
  enableVoiceRecording: boolean; // V2: Enable audio recording in journal
  analytics: AnalyticsSettings; // V3: Privacy-first analytics
}

export interface Meeting {
  id: string;
  name: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  time: string; // HH:MM format (24-hour)
  format: "in-person" | "online" | "hybrid";
  type: "open" | "closed" | "speaker" | "discussion" | "step-study" | "other";
  location?: {
    name: string;
    address: string;
    city: string;
    state?: string;
    zip?: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  onlineDetails?: {
    platform: "zoom" | "webex" | "teams" | "other";
    link?: string;
    phone?: string;
    accessCode?: string;
  };
  notes?: string;
  program: "NA" | "AA";
  source: "bmlt" | "meeting-guide" | "manual";
  sourceId?: string; // ID from source system
  distanceKm?: number; // Distance from user
  isFavorite: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number; // e.g., 30 minutes before
  
  // Legacy fields for backward compatibility with existing meeting log entries
  date?: string; // Legacy: kept for existing meetings (YYYY-MM-DD or ISO string)
  recurring?: boolean;
  recurrencePattern?: string;
  
  createdAtISO: string;
  updatedAtISO: string;
}

export interface MeetingSearchFilters {
  program?: "NA" | "AA" | "both";
  dayOfWeek?: number[];
  timeRange?: { start: string; end: string }; // HH:MM format
  format?: ("in-person" | "online" | "hybrid")[];
  type?: string[];
  maxDistanceKm?: number;
  startsSoon?: boolean; // Starts ≤60 minutes
  favoritesOnly?: boolean;
}

export interface MeetingCache {
  meetings: Meeting[];
  cachedAtISO: string;
  expiresAtISO: string;
  location: { lat: number; lng: number };
  radiusKm: number;
}

export interface BMLTConfig {
  apiRoot: string; // User-provided BMLT root URL
  apiKey?: string; // Optional API key if required
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
  type: "journaling" | "dailyCards" | "meetings" | "stepWork" | "recoveryRhythm";
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
  recoveryRhythm: StreakData; // Complete rhythm (all 3 check-ins)
}

export interface CelebratedMilestone {
  id: string;
  type: "sobriety" | "streak" | "achievement" | "step";
  milestone: string; // e.g., "1d", "7d", "30d", "step-1"
  celebratedAtISO: string;
}

export interface AchievementCriteria {
  type:
    | "sobriety_days"
    | "step_completed"
    | "journal_count"
    | "journal_streak"
    | "daily_card_count"
    | "daily_card_streak"
    | "gratitude_count"
    | "meeting_count"
    | "has_sponsor"
    | "contact_count"
    | "crisis_mode_used"
    | "emergency_contact_used"
    | "morning_card_count"
    | "evening_card_count"
    | "meditation_count"
    | "any_streak";
  target: number;
}

export interface RecoveryPointAwardConfig {
  amount: number;
  behavior: string;
  trigger?: "unlock" | "streak" | "completion";
  notes?: string;
}

export type RecoveryPointSource =
  | "achievement"
  | "streak"
  | "daily_card"
  | "journal"
  | "meeting"
  | "meditation"
  | "manual"
  | "redemption";

export interface RecoveryPointTransaction {
  id: string;
  type: "award" | "redeem";
  amount: number;
  reason: string;
  source: RecoveryPointSource;
  relatedId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RecoveryPointReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "content" | "coaching" | "community" | "support";
  available: boolean;
  tags?: string[];
}

export interface RecoveryPointRedemption {
  id: string;
  rewardId: string;
  redeemedAtISO: string;
  notes?: string;
  transactionId: string;
}

export interface RecoveryPointBalance {
  current: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
}

export interface RecoveryPointLedger {
  balance: RecoveryPointBalance;
  transactions: Record<string, RecoveryPointTransaction>;
  rewards: Record<string, RecoveryPointReward>;
  redemptions: Record<string, RecoveryPointRedemption>;
}

export interface RecoveryPointSummary {
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  transactionCount: number;
  awardsBySource: Partial<Record<RecoveryPointSource, number>>;
  lastAwardedAt?: string;
  lastRedeemedAt?: string;
}

export interface RecoveryPointAwardPayload {
  amount: number;
  reason: string;
  source: RecoveryPointSource;
  relatedId?: string;
  metadata?: Record<string, any>;
}

export interface Achievement {
  id: string;
  category: "sobriety" | "step-work" | "community" | "self-care" | "crisis";
  rarity: "common" | "uncommon" | "rare" | "epic";
  title: string;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
  recoveryPoints?: RecoveryPointAwardConfig;
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
  theme:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
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

export interface AISponsorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO 8601
}

export interface CopilotContext {
  recentStepWork?: string[]; // Last 5 step entries summaries
  recentJournals?: string[]; // Last 5 journal summaries
  activeScenes?: string[]; // Active Recovery Scenes
  currentStreaks?: Record<string, number>; // Streak data
  recentMoodTrend?: number[]; // Last 7 days mood
  recentCravingsTrend?: number[]; // Last 7 days cravings
}

export interface WeeklyDigest {
  generatedAtISO: string;
  themes: string[];
  summary: string;
  readyToShare: boolean;
  insights?: string[];
  suggestions?: string[];
}

export interface Pattern {
  id: string;
  type: "phrase" | "theme" | "mood" | "trigger" | "behavior";
  description: string;
  frequency: number;
  examples: string[];
  detectedAtISO: string;
  relatedEntries?: string[]; // IDs of related journal/step entries
}

export interface SponsorSummary {
  id: string;
  periodStartISO: string;
  periodEndISO: string;
  summary: string;
  themes: string[];
  questions?: string[];
  concerns?: string[];
  generatedAtISO: string;
  editedByUser: boolean;
}

export interface CopilotPrompt {
  id: string;
  type: "chat" | "digest" | "summary" | "meeting-prep" | "pattern-detection";
  userMessage: string;
  context: Record<string, any>; // What data is included
  response?: string;
  createdAtISO: string;
}

export interface CopilotSettings {
  includeStepWork: boolean;
  includeJournals: boolean;
  includeScenes: boolean;
  includeDailyCards: boolean;
  autoGenerateDigest: boolean; // Weekly digest
}

export interface AISponsorChatState {
  messages: Record<string, AISponsorMessage>; // id -> message
  isTyping: boolean;
  lastMessageTimestamp?: string;
  
  // NEW: Context window
  contextWindow?: CopilotContext;
  
  // NEW: Agentic features
  weeklyDigest?: WeeklyDigest;
  detectedPatterns?: Pattern[];
  
  // NEW: Settings
  settings: CopilotSettings;
}

export type AnalyticsEventType =
  | "app_opened"
  | "profile_created"
  | "journal_entry_created"
  | "journal_entry_voice_used"
  | "journal_entry_audio_recorded"
  | "daily_card_morning_completed"
  | "daily_card_evening_completed"
  | "morning_intention_set"
  | "midday_pulse_check_completed"
  | "evening_inventory_completed"
  | "recovery_rhythm_streak_milestone"
  | "step_answer_saved"
  | "meeting_logged"
  | "goal_created"
  | "goal_completed"
  | "crisis_mode_activated"
  | "emergency_contact_called"
  | "achievement_unlocked"
  | "milestone_celebrated"
  | "daily_challenge_completed"
  | "streak_extended"
  | "recovery_points_awarded"
  | "recovery_reward_redeemed"
  | "recovery_points_summary_exported"
  | "ai_sponsor_chat_opened"
  | "ai_sponsor_message_sent"
  | "ai_sponsor_message_received"
  | "ai_sponsor_feedback_positive"
  | "ai_sponsor_feedback_negative"
  | "tool_used"
  | "tool_outcome_recorded"
  | "tool_recommendation_shown"
  | "tool_recommendation_used"
  | "experiment_started"
  | "experiment_completed";

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

export interface ResetPlan {
  id: string;
  createdAtISO: string;
  updatedAtISO: string;
  checkInActions: string[];
  groundingActions: string[];
  growthCommitments: string[];
  implementationIntentionTemplate: string;
  selfCompassionReminder: string;
}

// Sponsor Connection Types
export interface SponsorRelationship {
  id: string;
  sponsorId: string; // Sponsor's user ID (if they have account)
  sponsorCode: string; // 6-digit code for connection
  sponseeId?: string; // This user's ID (if they're sponsee)
  role: "sponsor" | "sponsee"; // User's role in this relationship
  status: "pending" | "active" | "revoked";
  createdAtISO: string;
  acceptedAtISO?: string;
  revokedAtISO?: string;
  sponsorName?: string; // Display name
  sponsorPhone?: string; // For "call sponsor" action
  sponseeName?: string; // Display name (for sponsor view)
}

export interface SharedItem {
  id: string;
  itemType: "step-entry" | "daily-entry" | "journal-entry" | "scene" | "safety-plan";
  itemId: string; // ID of the actual item
  relationshipId: string; // SponsorRelationship ID
  sharedAtISO: string;
  revokedAtISO?: string;
  lastViewedAtISO?: string; // When sponsor last viewed
  version?: number; // For versioned items (step entries)
}

export interface SponsorMessage {
  id: string;
  threadId: string; // Conversation thread ID
  relationshipId: string; // SponsorRelationship ID
  senderId: string; // User ID or "sponsor"
  recipientId: string;
  contentCiphertext: string; // Encrypted message
  nonce: string; // For decryption
  createdAtISO: string;
  readAtISO?: string;
}

export interface SponsorSummary {
  id: string;
  relationshipId: string;
  periodStartISO: string;
  periodEndISO: string;
  summary: string; // AI-generated or user-written
  sharedAtISO: string;
  viewedAtISO?: string;
}

// JITAI (Just-in-Time Adaptive Intervention) Types
export interface RiskSignal {
  id: string;
  type: "high-cravings" | "low-mood" | "skipped-meetings" | "isolation" | "trigger-scene" | "custom";
  severity: number; // 0-100
  detectedAtISO: string;
  inputs: Record<string, any>; // What triggered this signal
  suggestedActions: string[]; // Action IDs or tool names
  dismissedAtISO?: string;
  actedUponAtISO?: string;
  outcome?: "helped" | "partial" | "didnt-help";
}

export interface JITAIRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: {
    type: "craving-threshold" | "mood-trend" | "meeting-gap" | "scene-usage" | "custom";
    threshold: number;
    windowDays: number; // Look back window
    operator: "greater-than" | "less-than" | "equals" | "trending-down" | "trending-up";
  };
  action: {
    type: "show-safety-plan" | "suggest-meeting" | "open-scene" | "suggest-tool" | "send-message" | "custom";
    data: string; // Scene ID, tool name, message text, etc.
    priority: number; // 1-5, higher = more urgent
  };
  explanation: string; // Shown to user: "I suggested this because..."
  createdAtISO: string;
  lastTriggeredAtISO?: string;
  triggerCount: number;
  effectivenessScore?: number; // Based on user feedback
}

export interface InterventionFeedback {
  id: string;
  signalId: string;
  ruleId: string;
  interventionType: string;
  helpful: boolean;
  notes?: string;
  timestampISO: string;
}

// Coping Tool Usage Tracking
export interface CopingToolUsage {
  id: string;
  toolName: string; // "breathing", "TIPP", "urge-surfing", "grounding", "walk", "call", "timer", etc.
  usedAtISO: string;
  context: {
    mood?: number; // 1-5 or 0-10
    craving?: number; // 0-10
    sceneId?: string; // If used in a Recovery Scene
    triggerType?: string; // "stress", "loneliness", "boredom", etc.
  };
  outcome?: {
    checkedAtISO: string; // When user checked outcome (10-15 min later)
    result: "better" | "same" | "worse";
    notes?: string;
    cravingChange?: number; // Change in craving (e.g., 8 -> 4 = -4)
    moodChange?: number; // Change in mood (e.g., 2 -> 4 = +2)
  };
}

// Effectiveness Calculation
export interface CopingToolEffectiveness {
  toolName: string;
  totalUses: number;
  betterCount: number;
  sameCount: number;
  worseCount: number;
  effectivenessScore: number; // Calculated: (better * 2 + same * 1) / totalUses, 0-2 scale
  averageCravingChange?: number; // Average change in craving
  averageMoodChange?: number; // Average change in mood
  bestContext: {
    mood?: number[]; // Mood ranges where tool works best
    craving?: number[]; // Craving ranges where tool works best
    scenes?: string[]; // Scenes where tool works best
    triggerTypes?: string[]; // Trigger types where tool works best
  };
  confidenceScore: number; // 0-1, based on sample size
  lastUpdatedISO: string;
}

// Personalized Recommendations
export interface CopingToolRecommendation {
  toolName: string;
  reason: string; // "This has helped you before when cravings are 7+ at night"
  confidence: "high" | "medium" | "low";
  contextMatch: boolean; // Does current context match tool's best context?
}

// Safety Plan Types
export interface SafetyPlanContact {
  id: string;
  name: string;
  phone?: string;
  relationship: "sponsor" | "recovery-friend" | "family" | "crisis-line" | "other";
  order: number; // Display order (1, 2, 3)
}

export interface SafetyPlanAction {
  id: string;
  label: string; // "Go for a walk", "Take a shower", "Go to a meeting"
  type: "call" | "text" | "tool" | "meeting" | "custom";
  data?: string; // Phone number, tool name, meeting finder, custom text
  order: number; // Display order (1, 2, 3)
}

export interface CrisisResource {
  id: string;
  name: string; // "Crisis Text Line", "988 Suicide & Crisis Lifeline"
  phone?: string;
  text?: string; // Text line number
  website?: string;
  description?: string;
  region?: string; // "US", "AU", "UK", etc.
}

export interface SafetyPlan {
  id: string;
  version: number;
  
  // People to Contact
  contacts: SafetyPlanContact[]; // Up to 3
  crisisHotline?: string; // Regional crisis hotline
  
  // Reasons Not to Use
  reasonsNotToUse: string[]; // Up to 3, user's own words
  
  // Actions Before Using
  actionsBeforeUsing: SafetyPlanAction[]; // Up to 3
  
  // Personal Message
  messageFromSoberMe: string; // User's message to struggling self
  
  // Crisis Resources
  crisisResources: CrisisResource[]; // Regional resources
  
  // Metadata
  createdAtISO: string;
  updatedAtISO: string;
  lastUsedISO?: string;
  usageCount: number;
  active: boolean;
}

export interface SafetyPlanUsage {
  id: string;
  planId: string;
  activatedAtISO: string;
  activationType: "manual" | "jitai" | "scene";
  actionsCompleted: string[]; // Action IDs completed
  contactedPerson?: string; // Contact ID if contacted someone
  outcome?: "helped" | "partial" | "didnt-help";
  notes?: string;
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
  recoveryPoints: RecoveryPointLedger;
  aiSponsorChat?: AISponsorChatState; // V4: AI Sponsor chat
  recoveryScenes?: Record<string, RecoveryScene>; // id -> scene
  sceneUsages?: Record<string, SceneUsage>; // id -> usage
  sponsorRelationships?: Record<string, SponsorRelationship>; // id -> relationship
  sharedItems?: Record<string, SharedItem>; // id -> shared item
  sponsorMessages?: Record<string, SponsorMessage>; // id -> message
  sponsorSummaries?: Record<string, SponsorSummary>; // id -> summary
  riskSignals?: Record<string, RiskSignal>; // id -> signal
  jitaiRules?: Record<string, JITAIRule>; // id -> rule
  interventionFeedback?: Record<string, InterventionFeedback>; // id -> feedback
  copingToolUsage?: Record<string, CopingToolUsage>; // id -> usage
  copingToolEffectiveness?: Record<string, CopingToolEffectiveness>; // toolName -> effectiveness
  safetyPlan?: SafetyPlan; // Current active safety plan
  safetyPlanUsages?: Record<string, SafetyPlanUsage>; // id -> usage history
  meetingCache?: MeetingCache;
  meetingSearchFilters: MeetingSearchFilters;
  bmltApiKey?: string; // User-provided API key
  bmltApiRoot?: string; // User-provided BMLT root URL
}
