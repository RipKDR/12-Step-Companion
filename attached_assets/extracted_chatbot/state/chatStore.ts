import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatState, Message } from '../types';

const initialMessage: Message = {
    id: 'init',
    role: 'model',
    content: "Hello, I'm your AI Sponsor. I'm here to support you on your recovery journey. I am not a replacement for a sponsor, therapist, or medical professional. My purpose is to provide a safe space for you to reflect and explore recovery tools. How are you feeling today?",
};

const useChatStore = create<ChatState & { startNewChat: () => void }>()(
  persist(
    (set, get) => ({
      messages: [initialMessage],
      chatMode: 'standard',
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateLastMessage: (contentChunk, sources) => {
        set((state) => {
          const lastMessage = state.messages[state.messages.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            const updatedMessage = {
              ...lastMessage,
              content: lastMessage.content + contentChunk,
              sources: sources || lastMessage.sources,
            };
            return { messages: [...state.messages.slice(0, -1), updatedMessage] };
          }
          return state;
        });
      },
      setLastMessageError: (errorMessage) => {
        set((state) => {
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
                const updatedMessage = {
                    ...lastMessage,
                    content: `Sorry, I encountered an error. Please try again.`,
                    error: errorMessage,
                };
                return { messages: [...state.messages.slice(0, -1), updatedMessage] };
            }
            return state;
        });
      },
      setChatMode: (mode) => set({ chatMode: mode }),
      startNewChat: () => set({ messages: [initialMessage] }),
    }),
    {
      name: 'ai-sponsor-chat-storage', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useChatStore;