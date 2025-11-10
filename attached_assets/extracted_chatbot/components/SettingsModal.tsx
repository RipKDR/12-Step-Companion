import React, { useState, useEffect } from 'react';
import useChatStore from '../state/chatStore';
import useUserProfileStore from '../state/userProfileStore';
import { UserProfile, ChatMode } from '../types';
import { BrainCircuitIcon, MessageSquareIcon, SearchIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EXAMPLE_PROMPTS: Record<ChatMode, string[]> = {
    standard: [
        "I'm having a really tough craving right now.",
        "I feel so overwhelmed today and I don't know what to do.",
        "Can we just talk through something that happened at my meeting?",
    ],
    deep: [
        "I'm on Step 4 and I'm struggling with my resentments. Where do I start?",
        "What's the difference between a character defect and a shortcoming?",
        "Help me think through how to make amends to someone I hurt.",
    ],
    research: [
        "Can you explain the concept of 'unmanageability' in the First Step?",
        "What are some common relapse warning signs I should look out for?",
        "Find me some information about the history of the Serenity Prayer.",
    ],
};


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { chatMode, setChatMode } = useChatStore();
    const { userProfile, setUserProfile } = useUserProfileStore();
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const [selectedMode, setSelectedMode] = useState<ChatMode>(chatMode);

    useEffect(() => {
        setFormData(userProfile);
        setSelectedMode(chatMode);
    }, [userProfile, chatMode, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setUserProfile(formData);
        setChatMode(selectedMode);
        onClose();
    };
    
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={handleOverlayClick}
        >
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6" role="dialog" aria-modal="true">
                <h2 className="text-xl font-bold text-slate-100 mb-4">Settings</h2>
                
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">Chat Mode</h3>
                    <div className="flex flex-col gap-3">
                        <ModeButton 
                            mode="standard" 
                            label="Supportive Chat" 
                            icon={<MessageSquareIcon className="w-4 h-4"/>} 
                            description="For day-to-day check-ins and general support. Balanced and responsive."
                            currentMode={selectedMode} 
                            onClick={setSelectedMode} 
                        />
                        <ModeButton 
                            mode="deep" 
                            label="Step Work Helper" 
                            icon={<BrainCircuitIcon className="w-4 h-4"/>} 
                            description="For deeper reflection on Twelve-Step principles. More thoughtful and in-depth."
                            currentMode={selectedMode} 
                            onClick={setSelectedMode} 
                        />
                        <ModeButton 
                            mode="research" 
                            label="Recovery Topics" 
                            icon={<SearchIcon className="w-4 h-4"/>} 
                            description="For exploring recovery concepts using web search to find relevant information."
                            currentMode={selectedMode} 
                            onClick={setSelectedMode} 
                        />
                    </div>
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/60 min-h-[120px] transition-all duration-300">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Example Prompts:</h4>
                        <ul className="space-y-2">
                            {EXAMPLE_PROMPTS[selectedMode].map((prompt, index) => (
                                <li key={`${selectedMode}-${index}`} className="text-sm text-slate-400 pl-3 border-l-2 border-slate-600 animate-fade-in-fast">
                                    "{prompt}"
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-700/60 pt-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Your Profile</h3>
                    <p className="text-sm text-slate-400 mb-6">
                        Providing context helps the AI give you more relevant support. This is saved only in your browser.
                    </p>
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="sobrietyDate" className="block text-sm font-medium text-slate-300 mb-1.5">Sobriety Date</label>
                                <input
                                    type="date"
                                    id="sobrietyDate"
                                    name="sobrietyDate"
                                    value={formData.sobrietyDate}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="currentStep" className="block text-sm font-medium text-slate-300 mb-1.5">Current Step</label>
                                <input
                                    type="text"
                                    id="currentStep"
                                    name="currentStep"
                                    placeholder="e.g., Step 4"
                                    value={formData.currentStep}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="triggers" className="block text-sm font-medium text-slate-300 mb-1.5">Triggers or Challenges</label>
                                <textarea
                                    id="triggers"
                                    name="triggers"
                                    rows={3}
                                    placeholder="e.g., Stress at work, feeling lonely"
                                    value={formData.triggers}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none focus:border-sky-500 transition-colors"
                                ></textarea>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ModeButton: React.FC<{
    mode: ChatMode,
    label: string,
    icon: React.ReactNode,
    description: string,
    currentMode: ChatMode,
    onClick: (mode: ChatMode) => void
  }> = ({ mode, label, icon, description, currentMode, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(mode)}
        className={`flex flex-col items-start text-left p-3 rounded-lg transition-all duration-200 border-2 w-full ${
            currentMode === mode 
                ? 'bg-sky-900/50 border-sky-500 shadow-md' 
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-slate-600'
        }`}
        aria-pressed={currentMode === mode}
    >
        <div className="flex items-center gap-2">
            {icon}
            <span className={`font-semibold ${currentMode === mode ? 'text-sky-300' : 'text-slate-200'}`}>{label}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">{description}</p>
    </button>
);


export default SettingsModal;