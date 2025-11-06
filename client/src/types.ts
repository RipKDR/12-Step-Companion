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

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  cloudSync: boolean; // stub
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
  settings: AppSettings;
  onboardingComplete: boolean;
}
