import React from 'react';
import { marked } from 'marked';
import { Message } from '../types';
import { SparklesIcon, UserIcon } from './icons';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { role, content, sources, error } = message;
    const isUser = role === 'user';

    const renderContent = () => {
        if (!content && !error) return null;
        if (error) {
             return <p className="text-white">Sorry, I encountered an error. Please try again.</p>
        }
        const dirtyHtml = marked.parse(content, { gfm: true, breaks: true });
        const sanitizedHtml = typeof dirtyHtml === 'string' ? dirtyHtml : ''; 
        return <div className="prose prose-invert text-slate-200 leading-relaxed prose-p:text-slate-200 prose-strong:text-white prose-a:text-sky-400 prose-a:font-medium hover:prose-a:underline" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
    };

    const iconClasses = "w-6 h-6";
    const bubbleBaseClasses = "rounded-xl p-4 max-w-[85%] md:max-w-[80%]";

    return (
        <div className={`flex items-start gap-4 animate-fade-in ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="bg-slate-700 p-2 rounded-full flex-shrink-0 flex items-center justify-center w-10 h-10 ring-2 ring-slate-800">
                    <SparklesIcon className={`${iconClasses} text-sky-400`} />
                </div>
            )}
            <div className={`${bubbleBaseClasses} ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-700'} ${error ? 'border border-red-500/50' : ''}`}>
                <div className="whitespace-pre-wrap break-words">
                    {renderContent()}
                </div>
                {error && (
                    <p className="text-xs text-red-300 mt-2 font-mono">Error: {error}</p>
                )}
                {sources && sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-600/50">
                        <h4 className="text-xs font-semibold text-slate-300 mb-2">Sources:</h4>
                        <ul className="space-y-1.5">
                            {sources.map((source, index) => (
                                <li key={index} className="text-xs truncate">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                                        {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {isUser && (
                <div className="bg-indigo-500 p-2 rounded-full flex-shrink-0 flex items-center justify-center w-10 h-10 ring-2 ring-slate-800">
                    <UserIcon className={`${iconClasses} text-indigo-100`} />
                </div>
            )}
        </div>
    );
};

// Add keyframes for animation in a global style or here in the component file if not done elsewhere.
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.4s ease-out forwards;
    }
    @keyframes fadeInFast {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-fade-in-fast {
        animation: fadeInFast 0.2s ease-out forwards;
    }
`;
document.head.appendChild(style);


export default MessageBubble;