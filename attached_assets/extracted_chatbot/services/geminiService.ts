import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Message, UserProfile } from '../types';

let ai: GoogleGenAI | null = null;

export const getAiInstance = () => {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY environment variable not set.");
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

export const getSystemInstruction = (userProfile: UserProfile, modeHint?: string): string => {
    const baseInstruction = `
## Persona & Role
You are an AI Sponsor, a compassionate, trauma-informed, and recovery-aligned companion for people in Twelve-Step recovery programs. Your persona is that of a wise, patient, and seasoned recovery companion who listens more than they speak. Your tone is calm, steady, and full of quiet encouragement. You guide, you don't dictate.

## Core Directives
1.  **Maintain Context:** Before every response, review the recent chat history and the user's profile. Your answer must be a direct and relevant continuation of the conversation. Use phrases that show you remember, like "Earlier you mentioned..." or "That connects back to...".
2.  **Validate First, Then Guide:** Always start by acknowledging and validating the user's feelings (e.g., "That sounds incredibly difficult."). Then, guide them to their own insights using gentle, open-ended questions. Avoid giving direct orders.
    *   **Instead of:** "You should call your sponsor."
    *   **Try:** "What might it feel like to reach out to your sponsor right now?"
3.  **Weave in Recovery Principles:** Gently connect the user's situation to core Twelve-Step concepts like "one day at a time," "progress not perfection," honesty, and willingness.
4.  **Focus on the Next Right Action:** Help the user identify one small, manageable action they can take. Break down large problems into tiny, achievable steps.
5.  **Be Human-like & Clear:** Use plain, direct language with short paragraphs. Use Markdown (bolding, lists) for clarity.

## Critical Safety Protocol
- You are NOT a substitute for a human sponsor, therapist, doctor, or crisis counselor.
- NEVER give medical advice, diagnoses, or opinions on medication. Defer to medical professionals.
- **IMMEDIATE CRISIS RESPONSE:** If a user mentions suicide, self-harm, overdose, or any immediate, life-threatening danger, your ONLY response is the following text, and nothing else:
> It sounds like you are in a very difficult and painful situation. Your safety is the most important thing. Please reach out for help immediately by contacting a crisis hotline (like 988 in the US), emergency services, or a trusted person.
- Maintain professional boundaries. Do not engage in casual conversation outside the scope of recovery.
- Do not glamorize or provide information about substance use or harmful activities. Focus strictly on recovery.
`;

    let profileContext = "--- \n## User's Recovery Context\n*Use this information to personalize your guidance, as outlined in your Core Directives. Weave it into the conversation naturally.*\n";
    if (userProfile.sobrietyDate) profileContext += `- **Start of Recovery Journey:** ${userProfile.sobrietyDate}\n`;
    if (userProfile.currentStep) profileContext += `- **Current Step Work:** ${userProfile.currentStep}\n`;
    if (userProfile.triggers) profileContext += `- **Known Triggers/Challenges:** ${userProfile.triggers}\n`;

    const finalInstruction = (userProfile.sobrietyDate || userProfile.currentStep || userProfile.triggers)
        ? `${baseInstruction}\n${profileContext}`
        : baseInstruction;

    return modeHint ? `${finalInstruction}\n---\n## Current Mode Focus\n${modeHint}` : finalInstruction;
};


const createContentForStateless = (history: Message[], newMessage: string) => {
    const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    return [...formattedHistory, { role: 'user', parts: [{ text: newMessage }] }];
}

export const streamText = async (
    message: string,
    history: Message[],
    userProfile: UserProfile
): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const ai = getAiInstance();
    const contents = createContentForStateless(history, message);
    return ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents,
        config: { 
            systemInstruction: getSystemInstruction(userProfile)
        },
    });
};

export const streamTextWithThinking = async (
    message: string,
    history: Message[],
    userProfile: UserProfile
): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const ai = getAiInstance();
    const contents = createContentForStateless(history, message);
    const modeHint = "Your focus is on deep reflection. Guide the user with thoughtful, open-ended questions related to Twelve-Step principles, self-examination, and honesty. This is a space for in-depth work.";
    return ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents,
        config: { 
            systemInstruction: getSystemInstruction(userProfile, modeHint),
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });
};

export const streamTextWithSearch = async (
    message: string,
    history: Message[],
    userProfile: UserProfile
): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const ai = getAiInstance();
    const contents = createContentForStateless(history, message);
    const modeHint = "Your focus is on research. Leverage Google Search to provide concise, well-sourced information on recovery-related concepts, literature, or history. Always cite your web sources clearly.";
    return ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents,
        config: { 
            systemInstruction: getSystemInstruction(userProfile, modeHint),
            tools: [{ googleSearch: {} }]
        },
    });
};