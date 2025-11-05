import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AppState, 
  Profile, 
  StepAnswer, 
  DailyCard, 
  JournalEntry, 
  WorksheetResponse,
  EmergencyAction,
  AppSettings 
} from '@/types';
import { storageManager } from '@/lib/storage';
import { migrateState, CURRENT_VERSION } from './migrations';
import { defaultFeatureFlags } from './featureFlags';

const defaultEmergencyActions: EmergencyAction[] = [
  {
    id: 'call-sponsor',
    label: 'Call My Sponsor',
    type: 'call',
    data: 'tel:+61400000000',
    icon: 'phone',
  },
  {
    id: 'breathing',
    label: 'Breathing Exercise',
    type: 'exercise',
    data: 'breathing',
    icon: 'heart',
  },
  {
    id: 'timer',
    label: '5 Minute Timer',
    type: 'timer',
    data: '300',
    icon: 'clock',
  },
  {
    id: 'coping-notes',
    label: 'Coping Notes',
    type: 'notes',
    data: 'Remember: This feeling is temporary. You are strong. Call someone if needed.',
    icon: 'file-text',
  },
];

const initialState: AppState = {
  version: CURRENT_VERSION,
  profile: undefined,
  stepAnswers: {},
  dailyCards: {},
  journalEntries: {},
  worksheetResponses: {},
  emergencyActions: defaultEmergencyActions,
  settings: {
    theme: 'system',
    highContrast: false,
    reducedMotion: false,
    cloudSync: false,
  },
  onboardingComplete: false,
};

interface AppStore extends AppState {
  // Profile
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  
  // Onboarding
  completeOnboarding: () => void;
  
  // Step Answers
  saveStepAnswer: (answer: StepAnswer) => void;
  getStepAnswers: (stepNumber: number) => StepAnswer[];
  
  // Daily Cards
  getDailyCard: (date: string) => DailyCard | undefined;
  updateDailyCard: (date: string, updates: Partial<Omit<DailyCard, 'id' | 'date'>>) => void;
  
  // Journal
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'updatedAtISO'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  getJournalEntries: () => JournalEntry[];
  
  // Worksheets
  saveWorksheetResponse: (response: Omit<WorksheetResponse, 'id' | 'createdAtISO' | 'updatedAtISO'>) => void;
  updateWorksheetResponse: (id: string, responses: Record<string, any>) => void;
  getWorksheetResponses: (templateId: string) => WorksheetResponse[];
  
  // Emergency Actions
  updateEmergencyAction: (id: string, updates: Partial<EmergencyAction>) => void;
  
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Data Management
  exportData: () => AppState;
  importData: (data: Partial<AppState>) => void;
  clearAllData: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Profile
      setProfile: (profile) => set({ profile }),
      
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : undefined,
      })),
      
      // Onboarding
      completeOnboarding: () => set({ onboardingComplete: true }),
      
      // Step Answers
      saveStepAnswer: (answer) => set((state) => ({
        stepAnswers: {
          ...state.stepAnswers,
          [answer.questionId]: answer,
        },
      })),
      
      getStepAnswers: (stepNumber) => {
        const state = get();
        return Object.values(state.stepAnswers).filter(
          (answer) => answer.stepNumber === stepNumber
        );
      },
      
      // Daily Cards
      getDailyCard: (date) => get().dailyCards[date],
      
      updateDailyCard: (date, updates) => set((state) => {
        const existing = state.dailyCards[date];
        const card: DailyCard = existing
          ? { ...existing, ...updates, updatedAtISO: new Date().toISOString() }
          : {
              id: date,
              date,
              morningCompleted: false,
              eveningCompleted: false,
              ...updates,
              updatedAtISO: new Date().toISOString(),
            };
        
        return {
          dailyCards: {
            ...state.dailyCards,
            [date]: card,
          },
        };
      }),
      
      // Journal
      addJournalEntry: (entry) => set((state) => {
        const id = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newEntry: JournalEntry = {
          ...entry,
          id,
          updatedAtISO: new Date().toISOString(),
        };
        
        return {
          journalEntries: {
            ...state.journalEntries,
            [id]: newEntry,
          },
        };
      }),
      
      updateJournalEntry: (id, updates) => set((state) => {
        const existing = state.journalEntries[id];
        if (!existing) return state;
        
        return {
          journalEntries: {
            ...state.journalEntries,
            [id]: {
              ...existing,
              ...updates,
              updatedAtISO: new Date().toISOString(),
            },
          },
        };
      }),
      
      deleteJournalEntry: (id) => set((state) => {
        const { [id]: _, ...rest } = state.journalEntries;
        return { journalEntries: rest };
      }),
      
      getJournalEntries: () => {
        const state = get();
        return Object.values(state.journalEntries).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
      
      // Worksheets
      saveWorksheetResponse: (response) => set((state) => {
        const id = `worksheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const newResponse: WorksheetResponse = {
          ...response,
          id,
          createdAtISO: now,
          updatedAtISO: now,
        };
        
        return {
          worksheetResponses: {
            ...state.worksheetResponses,
            [id]: newResponse,
          },
        };
      }),
      
      updateWorksheetResponse: (id, responses) => set((state) => {
        const existing = state.worksheetResponses[id];
        if (!existing) return state;
        
        return {
          worksheetResponses: {
            ...state.worksheetResponses,
            [id]: {
              ...existing,
              responses,
              updatedAtISO: new Date().toISOString(),
            },
          },
        };
      }),
      
      getWorksheetResponses: (templateId) => {
        const state = get();
        return Object.values(state.worksheetResponses)
          .filter((r) => r.templateId === templateId)
          .sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());
      },
      
      // Emergency Actions
      updateEmergencyAction: (id, updates) => set((state) => ({
        emergencyActions: state.emergencyActions.map((action) =>
          action.id === id ? { ...action, ...updates } : action
        ),
      })),
      
      // Settings
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),
      
      // Data Management
      exportData: () => get(),
      
      importData: (data) => set((state) => {
        // Merge imported data with existing, preferring newest based on updatedAtISO
        const mergeByTimestamp = <T extends { updatedAtISO?: string }>(
          existing: Record<string, T>,
          imported: Record<string, T>
        ): Record<string, T> => {
          const merged = { ...existing };
          
          Object.entries(imported).forEach(([key, value]) => {
            const existingItem = merged[key];
            if (!existingItem || 
                (value.updatedAtISO && existingItem.updatedAtISO && 
                 new Date(value.updatedAtISO) > new Date(existingItem.updatedAtISO))) {
              merged[key] = value;
            }
          });
          
          return merged;
        };
        
        return {
          ...state,
          profile: data.profile || state.profile,
          stepAnswers: data.stepAnswers ? mergeByTimestamp(state.stepAnswers, data.stepAnswers) : state.stepAnswers,
          dailyCards: data.dailyCards ? mergeByTimestamp(state.dailyCards, data.dailyCards) : state.dailyCards,
          journalEntries: data.journalEntries ? mergeByTimestamp(state.journalEntries, data.journalEntries) : state.journalEntries,
          worksheetResponses: data.worksheetResponses ? mergeByTimestamp(state.worksheetResponses, data.worksheetResponses) : state.worksheetResponses,
          settings: data.settings || state.settings,
        };
      }),
      
      clearAllData: () => set(initialState),
    }),
    {
      name: 'recovery-companion-storage',
      version: CURRENT_VERSION,
      migrate: (persistedState: any, version: number) => {
        return migrateState(persistedState);
      },
      storage: {
        getItem: async (name) => {
          const str = await storageManager.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: async (name, value) => {
          await storageManager.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await storageManager.removeItem(name);
        },
      },
    }
  )
);
