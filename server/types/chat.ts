export interface UserContext {
  name?: string;
  sobrietyDate?: string;
  triggers?: Array<{
    name?: string;
    description?: string;
    severity?: number;
  }>;
  recentJournals?: Array<{
    date?: string;
    content?: string;
  }>;
  stepProgress?: Record<
    string,
    {
      completed?: boolean;
      answers?: Record<string, unknown>;
    }
  >;
  conversationSummary?: string;
}

export interface ContextWindow {
  recentStepWork?: string[];
  recentJournals?: string[];
  activeScenes?: string[];
  currentStreaks?: Record<string, number>;
  recentMoodTrend?: number[];
  recentCravingsTrend?: number[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  userContext?: UserContext;
  contextWindow?: ContextWindow;
  promptType?: string;
}

