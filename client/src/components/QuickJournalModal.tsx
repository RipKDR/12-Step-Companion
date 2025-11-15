import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, Keyboard } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useIsMobile } from '@/hooks/use-mobile';
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  WindowWithSpeechRecognition,
} from '@/lib/speech-recognition-types';

const MOODS = [
  { emoji: '😊', label: 'Great', value: 8 },
  { emoji: '😌', label: 'Good', value: 6 },
  { emoji: '😐', label: 'Okay', value: 5 },
  { emoji: '😟', label: 'Struggling', value: 3 },
  { emoji: '😰', label: 'Difficult', value: 2 },
];

interface QuickJournalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickJournalModal({ open, onOpenChange }: QuickJournalModalProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [inputMode, setInputMode] = useState<'type' | 'voice'>('type');
  const [isRecording, setIsRecording] = useState(false);
  const isMobile = useIsMobile();

  const addJournalEntry = useAppStore((state) => state.addJournalEntry);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setContent('');
        setMood(undefined);
        setInputMode('type');
      }, 200);
    }
  }, [open]);

  const handleSave = () => {
    if (!content.trim()) return;

    addJournalEntry({
      date: new Date().toISOString(),
      content: content.trim(),
      mood,
      tags: [],
    });

    // Reset form
    setContent('');
    setMood(undefined);
    setInputMode('type');
    onOpenChange(false);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser');
      return;
    }
    
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecording(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsRecording(false);
      alert(`Speech recognition error: ${event.error}. Please try again.`);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

          return (
            <Drawer open={open} onOpenChange={onOpenChange}>
              <DrawerContent className="max-h-[90vh]" aria-labelledby="quick-journal-title" aria-describedby="quick-journal-description">
                <DrawerHeader className="text-left">
                  <DrawerTitle id="quick-journal-title">Quick Journal Entry</DrawerTitle>
                  <DrawerDescription id="quick-journal-description">
                    How are you feeling? Take a moment to check in.
                  </DrawerDescription>
                </DrawerHeader>

        <div className="space-y-4 px-4 overflow-y-auto flex-1">
          {/* Input Mode Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={inputMode === 'type' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('type')}
              className="flex-1"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Type
            </Button>
            <Button
              type="button"
              variant={inputMode === 'voice' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setInputMode('voice');
                handleVoiceInput();
              }}
              className="flex-1"
              disabled={isRecording}
            >
              <Mic className={`mr-2 h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
              {isRecording ? 'Listening...' : 'Voice'}
            </Button>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="journal-content">Your thoughts</Label>
            <Textarea
              id="journal-content"
              name="journal-content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              autoFocus={!isMobile}
            />
          </div>

          {/* Mood Selector */}
          <div className="space-y-2">
            <Label htmlFor="mood-selector">How are you feeling?</Label>
            <div id="mood-selector" className="flex gap-2 justify-around" role="group" aria-labelledby="mood-selector-label">
              <span id="mood-selector-label" className="sr-only">Select your mood</span>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  id={`mood-${m.value}`}
                  name="mood"
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    mood === m.value
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'hover:bg-muted'
                  }`}
                  title={m.label}
                  aria-label={m.label}
                  aria-pressed={mood === m.value}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!content.trim()}
          >
            Save ✓
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
