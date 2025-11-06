import { useState } from 'react';
import JournalEntryCard from '@/components/JournalEntryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number>(5);
  const [tags, setTags] = useState('');
  
  const getJournalEntries = useAppStore((state) => state.getJournalEntries);
  const addJournalEntry = useAppStore((state) => state.addJournalEntry);

  const entries = getJournalEntries();

  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSave = () => {
    if (content.trim()) {
      addJournalEntry({
        date: new Date().toISOString(),
        content: content.trim(),
        mood,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      
      // Reset form
      setContent('');
      setMood(5);
      setTags('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-4">Journal</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </header>

      <Button
        className="w-full gap-2 h-12"
        onClick={() => setIsDialogOpen(true)}
        data-testid="button-new-entry"
      >
        <Plus className="h-5 w-5" />
        New Journal Entry
      </Button>

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
            <div className="space-y-2">
              <Label htmlFor="content">Entry</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today?"
                className="min-h-32"
                data-testid="input-content"
              />
            </div>

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
