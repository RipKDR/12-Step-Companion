import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, SendIcon } from './icons';

interface ChatInputProps {
    isLoading: boolean;
    isRecording: boolean;
    handleSendMessage: (message: string) => void;
    handleToggleRecording: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ isLoading, isRecording, handleSendMessage, handleToggleRecording }) => {
    const [textInput, setTextInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [textInput]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || isLoading || isRecording) return;
        handleSendMessage(textInput);
        setTextInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <footer className="p-4 sticky bottom-0 bg-slate-900/70 backdrop-blur-lg border-t border-slate-700/60">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex items-end gap-3">
                    <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2 bg-slate-800 rounded-xl p-2 border border-slate-700 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                        <textarea
                            ref={textareaRef}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isRecording ? "Voice input active..." : "Type your message..."}
                            className="flex-1 bg-transparent text-slate-200 placeholder-slate-400 px-2 pt-2.5 pb-2 resize-none focus:outline-none max-h-48"
                            rows={1}
                            disabled={isRecording || isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || isRecording || !textInput.trim()} 
                            className="p-2.5 rounded-lg bg-sky-600 text-white disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 flex-shrink-0"
                            aria-label="Send message"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                    <button
                        onClick={handleToggleRecording}
                        disabled={isLoading}
                        className={`
                            p-3 rounded-lg flex items-center justify-center transition-colors duration-200 ease-in-out flex-shrink-0 h-[52px] w-[52px]
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                            ${isRecording ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500' : 'bg-slate-700 hover:bg-slate-600 focus-visible:ring-sky-500'}
                            disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        aria-label={isRecording ? 'Stop conversation' : 'Start voice conversation'}
                    >
                        {isRecording ? <StopIcon className="w-6 h-6 text-white" /> : <MicrophoneIcon className="w-6 h-6 text-white" />}
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default ChatInput;