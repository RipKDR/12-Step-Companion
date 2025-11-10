import { useState, useRef, useCallback, useEffect } from 'react';
import useChatStore from '../state/chatStore';
import useUserProfileStore from '../state/userProfileStore';
import { streamText, streamTextWithThinking, streamTextWithSearch, getAiInstance, getSystemInstruction } from '../services/geminiService';
import { Message } from '../types';
// FIX: The `LiveSession` type is not exported from `@google/genai`. We infer it from the `live.connect` method for type safety.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audio';


// Infer the LiveSession type from the return value of the connect method.
type LiveSession = Awaited<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>>;


// --- Crisis Keywords for Client-Side Check ---
const CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'want to die', 'end my life', 'overdose',
    'self-harm', 'hopeless', 'can\'t go on', 'no reason to live'
];

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

function createPcmBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
    };
}


export const useChat = () => {
    const { messages, chatMode, addMessage, updateLastMessage, setLastMessageError } = useChatStore();
    const { userProfile } = useUserProfileStore();
    const [isLoading, setIsLoading] = useState(false);

    // --- Voice Chat State ---
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // --- Audio Playback Queue ---
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());


    const handleSendMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading || isRecording) return;
    
        // Client-side crisis check
        if (CRISIS_KEYWORDS.some(keyword => messageContent.toLowerCase().includes(keyword))) {
            alert("It sounds like you are in a very difficult situation. If you are in immediate danger, please contact your local emergency services, a crisis line (like 988 in the US), or a trusted person right away. Your safety is the most important thing.");
            return;
        }

        setIsLoading(true);
    
        const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent };
        addMessage(newUserMessage);
    
        // Add an empty model message to stream into
        const modelMessageId = `${Date.now()}-model`;
        addMessage({ id: modelMessageId, role: 'model', content: '' });
    
        try {
            let stream;
            const history = messages.filter(m => m.id !== 'init'); // Exclude initial welcome message from history

            if (chatMode === 'standard') {
                stream = await streamText(messageContent, history, userProfile);
            } else if (chatMode === 'deep') {
                stream = await streamTextWithThinking(messageContent, history, userProfile);
            } else { // research
                stream = await streamTextWithSearch(messageContent, history, userProfile);
            }
    
            for await (const chunk of stream) {
                const textChunk = chunk.text;
                const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                const sources = groundingChunks
                    ?.map(c => c.web)
                    .filter((web): web is { uri: string, title: string } => !!web && !!web.uri);
                
                updateLastMessage(textChunk, sources);
            }
    
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setLastMessageError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Voice Chat Logic ---
    const stopConversation = useCallback(async () => {
        setIsRecording(false);
    
        // Stop microphone tracks
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    
        // Disconnect audio processing
        if (scriptProcessorRef.current) {
          scriptProcessorRef.current.disconnect();
          scriptProcessorRef.current.onaudioprocess = null;
          scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
          mediaStreamSourceRef.current.disconnect();
          mediaStreamSourceRef.current = null;
        }
    
        // Close Gemini session
        if (sessionPromiseRef.current) {
          const session = await sessionPromiseRef.current;
          session.close();
          sessionPromiseRef.current = null;
        }
    
        // Close audio contexts
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;

        // Clear any pending audio playback
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }, []);

    const startConversation = async () => {
        setIsRecording(true);
        const ai = getAiInstance();
    
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
    
            // FIX: Add cross-browser compatibility for AudioContext to support Safari and other browsers.
            const CrossBrowserAudioContext = window.AudioContext || (window as any).webkitAudioContext;

            inputAudioContextRef.current = new CrossBrowserAudioContext({ sampleRate: INPUT_SAMPLE_RATE });
            outputAudioContextRef.current = new CrossBrowserAudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
    
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
    
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTimeRef.current = Math.max(
                                nextStartTimeRef.current,
                                outputAudioContextRef.current.currentTime,
                            );
                            
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                outputAudioContextRef.current,
                                OUTPUT_SAMPLE_RATE,
                                1,
                            );

                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current.destination);
                            
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        stopConversation();
                    },
                    onclose: () => {
                        console.log('Live session closed.');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: getSystemInstruction(userProfile),
                },
            });
    
        } catch (err) {
            console.error("Failed to start voice conversation:", err);
            alert("Could not access microphone. Please check your browser permissions.");
            stopConversation();
        }
    };
    
    const handleToggleRecording = () => {
        if (isRecording) {
            stopConversation();
        } else {
            startConversation();
        }
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (isRecording) {
                stopConversation();
            }
        };
    }, [isRecording, stopConversation]);

    return {
        isLoading,
        isRecording,
        handleSendMessage,
        handleToggleRecording,
    };
};
