import { useState, useMemo } from 'react';
import type { JournalEntry } from '@/types';
import JournalEntryCard from '@/components/JournalEntryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, AlertTriangle, Mic, MicOff, Disc, Square, TrendingUp, Calendar, Smile, Filter, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { haptics } from '@/lib/haptics';
import { startSpeechRecognition, startAudioRecording, isSpeechRecognitionSupported, isMediaRecordingSupported } from '@/lib/voice';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/PullToRefresh';
import { EmptyJournalState } from '@/components/EmptyState';
import { JournalEntrySkeletonList } from '@/components/JournalEntrySkeleton';
import { JournalEntryEditor } from '@/components/JournalEntryEditor';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { SortableList } from '@/components/SortableList';

const getMoodColor = (mood: number) => {
  if (mood <= 3) return 'text-red-500';
  if (mood <= 5) return 'text-orange-500';
  if (mood <= 7) return 'text-yellow-500';
  return 'text-green-500';
};

const getMoodEmoji = (mood: number) => {
  if (mood <= 2) return '😢';
  if (mood <= 4) return '😔';
  if (mood <= 6) return '😐';
  if (mood <= 8) return '🙂';
  return '😊';
};

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
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterTrigger, setFilterTrigger] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mood-high' | 'mood-low'>('newest');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const handleEditEntry = (entryId: string) => {
    setEditingEntryId(entryId);
    haptics.light();
  };

  const handleSaveEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    updateJournalEntry(entryId, updates);
    setEditingEntryId(null);
    haptics.success();
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteJournalEntry(entryId);
    if (editingEntryId === entryId) {
      setEditingEntryId(null);
    }
    haptics.success();
  };

  const getJournalEntries = useAppStore((state) => state.getJournalEntries);
  const addJournalEntry = useAppStore((state) => state.addJournalEntry);
  const updateJournalEntry = useAppStore((state) => state.updateJournalEntry);
  const deleteJournalEntry = useAppStore((state) => state.deleteJournalEntry);
  const settings = useAppStore((state) => state.settings);
  const trackAnalyticsEvent = useAppStore((state) => state.trackAnalyticsEvent);

  const entries = getJournalEntries();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach(entry => {
      entry.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  const commonTags = ['gratitude', 'meeting', 'struggle', 'victory', 'reflection', 'prayer'];

  const statistics = useMemo(() => {
    if (entries.length === 0) return null;
    
    const totalMood = entries.reduce((sum, entry) => sum + (entry.mood ?? 5), 0);
    const avgMood = totalMood / entries.length;
    const triggerCount = entries.filter(e => e.isTrigger).length;
    const last7Days = entries.filter(e => {
      const entryDate = new Date(e.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    });
    
    return {
      total: entries.length,
      avgMood: avgMood.toFixed(1),
      triggerCount,
      last7DaysCount: last7Days.length,
    };
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let filtered = entries.filter((entry) =>
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filterTag) {
      filtered = filtered.filter(entry => entry.tags.includes(filterTag));
    }

    if (filterTrigger !== null) {
      filtered = filtered.filter(entry => entry.isTrigger === filterTrigger);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'mood-high':
          return (b.mood ?? 5) - (a.mood ?? 5);
        case 'mood-low':
          return (a.mood ?? 5) - (b.mood ?? 5);
        default:
          return 0;
      }
    });

    return sorted;
  }, [entries, searchQuery, filterTag, filterTrigger, sortBy]);

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
    <div className="max-w-3xl mx-auto px-6 pb-8 sm:pb-12 pt-6">
      <header className="space-y-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Track your thoughts, moods, and recovery journey
          </p>
        </div>

        {statistics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <p className="text-xs font-medium">Total Entries</p>
              </div>
              <p className="text-2xl font-semibold">{statistics.total}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Smile className="h-4 w-4" />
                <p className="text-xs font-medium">Avg Mood</p>
              </div>
              <p className={cn("text-2xl font-semibold", getMoodColor(parseFloat(statistics.avgMood)))}>
                {statistics.avgMood} {getMoodEmoji(parseFloat(statistics.avgMood))}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <p className="text-xs font-medium">This Week</p>
              </div>
              <p className="text-2xl font-semibold">{statistics.last7DaysCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-xs font-medium">Triggers</p>
              </div>
              <p className="text-2xl font-semibold">{statistics.triggerCount}</p>
            </Card>
          </div>
        )}
        
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Button
            className="gap-2"
            onClick={() => setIsDialogOpen(true)}
            data-testid="button-new-entry"
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort:</span>
          </div>
          <Select value={sortBy} onValueChange={(value: "newest" | "oldest") => setSortBy(value)}>
            <SelectTrigger className="w-32" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="mood-high">Mood (High)</SelectItem>
              <SelectItem value="mood-low">Mood (Low)</SelectItem>
            </SelectContent>
          </Select>

          {allTags.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {allTags.slice(0, 5).map(tag => (
                  <Badge
                    key={tag}
                    variant={filterTag === tag ? 'default' : 'outline'}
                    className="cursor-pointer hover-elevate"
                    onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                    data-testid={`badge-filter-${tag}`}
                  >
                    {tag}
                    {filterTag === tag && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-1.5">
            <Badge
              variant={filterTrigger === true ? 'default' : 'outline'}
              className="cursor-pointer hover-elevate gap-1"
              onClick={() => setFilterTrigger(filterTrigger === true ? null : true)}
              data-testid="badge-filter-triggers"
            >
              <AlertTriangle className="h-3 w-3" />
              Triggers Only
              {filterTrigger === true && <X className="ml-1 h-3 w-3" />}
            </Badge>
          </div>

          {(filterTag || filterTrigger !== null) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterTag('');
                setFilterTrigger(null);
              }}
              className="gap-1"
              data-testid="button-clear-filters"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}
        </div>
      </header>

      <PullToRefresh
        onRefresh={async () => {
          // Refresh journal entries
          await new Promise(resolve => setTimeout(resolve, 500));
        }}
      >
        <section className="space-y-4" aria-label="Journal entries">
          {filteredEntries.length === 0 ? (
            <EmptyJournalState onCreate={() => setIsDialogOpen(true)} />
          ) : (
            filteredEntries.map((entry) => {
              if (editingEntryId === entry.id) {
                return (
                  <JournalEntryEditor
                    key={entry.id}
                    entry={entry}
                    onSave={(updates) => handleSaveEntry(entry.id, updates)}
                    onCancel={() => setEditingEntryId(null)}
                  />
                );
              }
              return (
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
                  onClick={() => handleEditEntry(entry.id)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  onEdit={() => handleEditEntry(entry.id)}
                />
              );
            })
          )}
        </section>
      </PullToRefresh>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
            <DialogDescription>
              Write about your day, your feelings, or anything on your mind.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4 overflow-y-auto flex-1">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="mood">Mood</Label>
                <span className={cn("text-2xl font-semibold", getMoodColor(mood))}>
                  {mood}/10 {getMoodEmoji(mood)}
                </span>
              </div>
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
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {commonTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={tags.split(',').map(t => t.trim()).includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover-elevate"
                    onClick={() => {
                      const currentTags = tags.split(',').map(t => t.trim()).filter(Boolean);
                      if (currentTags.includes(tag)) {
                        setTags(currentTags.filter(t => t !== tag).join(', '));
                      } else {
                        setTags([...currentTags, tag].join(', '));
                      }
                    }}
                    data-testid={`badge-tag-${tag}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add custom tags (comma-separated)"
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
