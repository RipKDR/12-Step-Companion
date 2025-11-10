import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import { SparklesIcon } from './icons';

interface ChatLogProps {
    messages: Message[];
    isLoading: boolean;
}

const ChatLog: React.FC<ChatLogProps> = ({ messages, isLoading }) => {
    const chatLogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const showLoadingIndicator = isLoading && 
                                 messages.length > 0 && 
                                 messages[messages.length - 1].role === 'model' && 
                                 messages[messages.length - 1].content === '';

    return (
        <main ref={chatLogRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {showLoadingIndicator && (
                <div className="flex items-start gap-4 animate-fade-in">
                    <div className="bg-slate-700 p-2 rounded-full flex-shrink-0 flex items-center justify-center w-10 h-10">
                        <SparklesIcon className="w-6 h-6 text-sky-400" />
                    </div>
                    <div className="bg-slate-700 rounded-xl p-4 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse delay-0"></span>
                            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse delay-150"></span>
                            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ChatLog;