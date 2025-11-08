import { useState } from 'react';
import JournalEntryCard from '@/components/JournalEntryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, AlertTriangle, Mic, MicOff, Disc, Square } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { haptics } from '@/lib/haptics';
import { startSpeechRecognition, startAudioRecording, isSpeechRecognitionSupported, isMediaRecordingSupported } from '@/lib/voice';

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number>(5);
  const [tags, setTags] = useState('');
  const [isTrigger, setIsTrigger] = useState(false);
  const [triggerType, setTriggerType] = useState('');
  const [triggerIntensity, setTriggerIntensity] = useState<number>(5);
  const [copingActions, setCopingActions] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);
  const [stopListening, setStopListening] = useState<(() => void) | null>(null);
  const [stopRecording, setStopRecording] = useState<(() => void) | null>(null);

  const getJournalEntries = useAppStore((state) => state.getJournalEntries);
  const addJournalEntry = useAppStore((state) => state.addJournalEntry);
  const settings = useAppStore((state) => state.settings);
  const trackAnalyticsEvent = useAppStore((state) => state.trackAnalyticsEvent);

  const entries = getJournalEntries();

  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleVoice = () => {
    if (isListening) {
      if (stopListening) stopListening();
      setIsListening(false);
      setStopListening(null);
    } else {
      const stop = startSpeechRecognition(
        (result) => {
          if (result.isFinal) {
            setContent((prev) => (prev ? `${prev} ${result.transcript}` : result.transcript));
            // Track voice-to-text usage
            trackAnalyticsEvent('journal_entry_voice_used');
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      setStopListening(() => stop);
      setIsListening(true);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      if (stopRecording) stopRecording();
      setIsRecording(false);
      setStopRecording(null);
    } else {
      const stop = await startAudioRecording(
        (result) => {
          setAudioData(result.audioData);
          setAudioDuration(result.duration);
          setIsRecording(false);
          // Track audio recording usage
          trackAnalyticsEvent('journal_entry_audio_recorded', {
            duration: Math.floor(result.duration),
          });
        },
        (error) => {
          console.error('Audio recording error:', error);
          setIsRecording(false);
        },
        300 // 5 minutes max
      );
      setStopRecording(() => stop);
      setIsRecording(true);
    }
  };

  const handleSave = () => {
    if (content.trim()) {
      haptics.success();
      addJournalEntry({
        date: new Date().toISOString(),
        content: content.trim(),
        mood,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        isTrigger,
        triggerType: isTrigger ? triggerType : undefined,
        triggerIntensity: isTrigger ? triggerIntensity : undefined,
        copingActions: isTrigger ? copingActions : undefined,
        audioData,
        audioDuration,
      });

      // Track journal entry creation
      trackAnalyticsEvent('journal_entry_created', {
        hasSponsor: isTrigger,
        hasAudio: !!audioData,
      });

      // Reset form
      setContent('');
      setMood(5);
      setTags('');
      setIsTrigger(false);
      setTriggerType('');
      setTriggerIntensity(5);
      setCopingActions('');
      setAudioData(undefined);
      setAudioDuration(undefined);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pb-32 pt-8">
      <header className="space-y-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
            Journal
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your thoughts, moods, and recovery journey
          </p>
        </div>
        
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-muted focus:border-primary/50 transition-colors"
              data-testid="input-search"
            />
          </div>
          <Button
            className="gap-2 min-w-[180px] h-12 text-base"
            onClick={() => setIsDialogOpen(true)}
            data-testid="button-new-entry"
          >
            <Plus className="h-5 w-5" />
            New Entry
          </Button>
        </div>
      </header>

      <section className="space-y-4" aria-label="Journal entries">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No entries found' : 'No journal entries yet'}
            </p>
            {!searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(true)}
                data-testid="button-create-first"
              >
                Create your first entry
              </Button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              date={entry.date}
              content={entry.content}
              mood={entry.mood}
              tags={entry.tags}
              isTrigger={entry.isTrigger}
              triggerType={entry.triggerType}
              triggerIntensity={entry.triggerIntensity}
              audioData={entry.audioData}
              audioDuration={entry.audioDuration}
              onClick={() => console.log('Edit entry:', entry.id)}
            />
          ))
        )}
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
            <DialogDescription>
              Write about your day, your feelings, or anything on your mind.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={isTrigger ? 'default' : 'outline'}
                onClick={() => setIsTrigger(!isTrigger)}
                className="gap-2"
                data-testid="button-trigger-toggle"
              >
                <AlertTriangle className="h-4 w-4" />
                {isTrigger ? 'Trigger Entry' : 'Regular Entry'}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Entry</Label>
                <div className="flex gap-2">
                  {isSpeechRecognitionSupported() && (
                    <Button
                      type="button"
                      size="sm"
                      variant={isListening ? 'default' : 'outline'}
                      onClick={handleToggleVoice}
                      className="gap-2"
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isListening ? 'Stop' : 'Voice'}
                    </Button>
                  )}
                  {settings.enableVoiceRecording && isMediaRecordingSupported() && (
                    <Button
                      type="button"
                      size="sm"
                      variant={isRecording ? 'destructive' : 'outline'}
                      onClick={handleToggleRecording}
                      className="gap-2"
                    >
                      {isRecording ? <Square className="h-4 w-4" /> : <Disc className="h-4 w-4" />}
                      {isRecording ? 'Stop Rec' : 'Record'}
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isTrigger ? "Describe the trigger situation..." : "What's on your mind today?"}
                className="min-h-32"
                data-testid="input-content"
              />
              {audioData && (
                <div className="text-sm text-muted-foreground">
                  Audio recording attached ({audioDuration?.toFixed(0)}s)
                </div>
              )}
            </div>

            {isTrigger && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="trigger-type">Trigger Type</Label>
                  <Select value={triggerType} onValueChange={setTriggerType}>
                    <SelectTrigger data-testid="select-trigger-type">
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="people">People</SelectItem>
                      <SelectItem value="places">Places</SelectItem>
                      <SelectItem value="things">Things</SelectItem>
                      <SelectItem value="emotions">Emotions</SelectItem>
                      <SelectItem value="stress">Stress</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger-intensity">Intensity ({triggerIntensity}/10)</Label>
                  <Slider
                    id="trigger-intensity"
                    value={[triggerIntensity]}
                    onValueChange={(values) => setTriggerIntensity(values[0])}
                    min={1}
                    max={10}
                    step={1}
                    data-testid="slider-trigger-intensity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coping-actions">Coping Actions Taken</Label>
                  <Textarea
                    id="coping-actions"
                    value={copingActions}
                    onChange={(e) => setCopingActions(e.target.value)}
                    placeholder="What did you do to cope? (e.g., called sponsor, went to meeting, exercised)"
                    className="min-h-20"
                    data-testid="input-coping-actions"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="mood">Mood ({mood}/10)</Label>
              <Slider
                id="mood"
                value={[mood]}
                onValueChange={(values) => setMood(values[0])}
                min={0}
                max={10}
                step={1}
                data-testid="slider-mood"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="gratitude, meeting, struggle"
                data-testid="input-tags"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!content.trim()}
              data-testid="button-save"
            >
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
