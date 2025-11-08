import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, Keyboard } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

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

  const addJournalEntry = useAppStore((state) => state.addJournalEntry);

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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      alert('Speech recognition error. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Journal Entry</DialogTitle>
          <DialogDescription>
            How are you feeling? Take a moment to check in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              autoFocus
            />
          </div>

          {/* Mood Selector */}
          <div className="space-y-2">
            <Label>How are you feeling?</Label>
            <div className="flex gap-2 justify-around">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    mood === m.value
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'hover:bg-muted'
                  }`}
                  title={m.label}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
