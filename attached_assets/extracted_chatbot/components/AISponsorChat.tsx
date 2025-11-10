import React, { useState } from 'react';
import useChatStore from '../state/chatStore';
import { useChat } from '../hooks/useChat';
import ChatLog from './ChatLog';
import ChatInput from './ChatInput';
import SettingsModal from './SettingsModal';
import { SettingsIcon, PlusIcon } from './icons';

const AISponsorChat: React.FC = () => {
  const { messages, startNewChat } = useChatStore();
  const {
    isLoading,
    isRecording,
    handleSendMessage,
    handleToggleRecording
  } = useChat();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNewChat = () => {
    if (messages.length > 1 && window.confirm("Are you sure you want to start a new chat? Your current conversation will be cleared.")) {
        startNewChat();
    } else if (messages.length <= 1) {
        startNewChat();
    }
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-slate-900 text-slate-300">
      <header className="p-4 border-b border-slate-700/60 text-center sticky top-0 bg-slate-900/70 backdrop-blur-lg z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-200">AI Sponsor</h1>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleNewChat}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                aria-label="Start new chat"
            >
                <PlusIcon className="w-5 h-5 text-slate-400" />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label="Open settings"
            >
              <SettingsIcon className="w-5 h-5 text-slate-400" />
            </button>
        </div>
      </header>

      <ChatLog
        messages={messages}
        isLoading={isLoading}
      />

      <ChatInput
        isLoading={isLoading}
        isRecording={isRecording}
        handleSendMessage={handleSendMessage}
        handleToggleRecording={handleToggleRecording}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default AISponsorChat;