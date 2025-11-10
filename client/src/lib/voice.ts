/**
 * Voice input and audio recording utilities
 */

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface AudioRecordingResult {
  audioData: string; // Base64 encoded
  duration: number; // seconds
  mimeType: string;
}

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Check if media recording is supported
 */
export function isMediaRecordingSupported(): boolean {
  return (
    'MediaRecorder' in window &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  );
}

/**
 * Start speech recognition
 */
export function startSpeechRecognition(
  onResult: (result: VoiceRecognitionResult) => void,
  onError: (error: string) => void,
  onEnd: () => void,
  options?: {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
  }
): () => void {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition not supported in this browser');
    return () => {};
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = options?.continuous ?? true;
  recognition.interimResults = options?.interimResults ?? true;
  recognition.lang = options?.lang ?? 'en-US';

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      onResult({
        transcript: result[0].transcript,
        isFinal: result.isFinal,
        confidence: result[0].confidence,
      });
    }
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Speech recognition error');
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();

  // Return stop function
  return () => {
    try {
      recognition.stop();
    } catch (e) {
      // Already stopped
    }
  };
}

/**
 * Start audio recording
 */
export async function startAudioRecording(
  onComplete: (result: AudioRecordingResult) => void,
  onError: (error: string) => void,
  maxDurationSeconds: number = 300 // 5 minutes default
): Promise<() => void> {
  if (!isMediaRecordingSupported()) {
    onError('Audio recording not supported in this browser');
    return () => {};
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    const startTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      const duration = (Date.now() - startTime) / 1000;

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        onComplete({
          audioData: base64Data,
          duration,
          mimeType: mediaRecorder.mimeType,
        });
      };
      reader.onerror = () => {
        onError('Failed to convert audio to base64');
      };
      reader.readAsDataURL(audioBlob);

      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.onerror = () => {
      onError('Audio recording error');
      stream.getTracks().forEach((track) => track.stop());
    };

    // Start recording
    mediaRecorder.start();

    // Auto-stop after max duration
    const maxDurationTimeout = setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, maxDurationSeconds * 1000);

    // Return stop function
    return () => {
      clearTimeout(maxDurationTimeout);
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      } else {
        // Already stopped, clean up stream
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  } catch (error) {
    onError('Failed to access microphone. Please grant permission.');
    return () => {};
  }
}

/**
 * Play audio from base64 data
 */
export function playAudio(
  audioData: string,
  onEnd?: () => void,
  onError?: (error: string) => void
): () => void {
  const audio = new Audio(audioData);

  audio.onended = () => {
    if (onEnd) onEnd();
  };

  audio.onerror = () => {
    if (onError) onError('Failed to play audio');
  };

  audio.play().catch((error) => {
    if (onError) onError('Failed to play audio: ' + error.message);
  });

  // Return stop function
  return () => {
    audio.pause();
    audio.currentTime = 0;
  };
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Estimate audio file size in MB
 */
export function estimateAudioSize(audioData: string): number {
  // Base64 string length * 0.75 (base64 overhead) / 1024 / 1024
  return (audioData.length * 0.75) / 1024 / 1024;
}
