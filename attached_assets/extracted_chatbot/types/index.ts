export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  sources?: Source[];
  error?: string;
}

export interface UserProfile {
    sobrietyDate: string;
    triggers: string;
    currentStep: string;
}

export type ChatMode = 'standard' | 'deep' | 'research';

export interface ChatState {
    messages: Message[];
    chatMode: ChatMode;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateLastMessage: (contentChunk: string, sources?: Source[]) => void;
    setLastMessageError: (errorMessage: string) => void;
    setChatMode: (mode: ChatMode) => void;
}