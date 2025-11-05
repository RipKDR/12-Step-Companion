import { useState, useMemo } from 'react';
import JournalEntryCard from '@/components/JournalEntryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { JournalEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  
  const [formContent, setFormContent] = useState('');
  const [formMood, setFormMood] = useState<number>(5);
  const [formTags, setFormTags] = useState('');

  const getJournalEntries = useAppStore((state) => state.getJournalEntries);
  const addJournalEntry = useAppStore((state) => state.addJournalEntry);
  const updateJournalEntry = useAppStore((state) => state.updateJournalEntry);
  const deleteJournalEntry = useAppStore((state) => state.deleteJournalEntry);
  const { toast } = useToast();

  const entries = useMemo(() => getJournalEntries(), [getJournalEntries]);

  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openNewEntryDialog = () => {
    setEditingEntry(null);
    setFormContent('');
    setFormMood(5);
    setFormTags('');
    setDialogOpen(true);
  };

  const openEditEntryDialog = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormContent(entry.content);
    setFormMood(entry.mood || 5);
    setFormTags(entry.tags.join(', '));
    setDialogOpen(true);
  };

  const handleSaveEntry = () => {
    if (!formContent.trim()) {
      toast({
        title: 'Content required',
        description: 'Please write something in your journal entry.',
        variant: 'destructive',
      });
      return;
    }

    const tags = formTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (editingEntry) {
      updateJournalEntry(editingEntry.id, {
        content: formContent,
        mood: formMood,
        tags,
      });
      toast({
        title: 'Entry updated',
        description: 'Your journal entry has been updated.',
      });
    } else {
      addJournalEntry({
        date: new Date().toISOString(),
        content: formContent,
        mood: formMood,
        tags,
      });
      toast({
        title: 'Entry created',
        description: 'Your journal entry has been saved.',
      });
    }

    setDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      deleteJournalEntry(entryToDelete);
      toast({
        title: 'Entry deleted',
        description: 'Your journal entry has been deleted.',
      });
    }
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-4">Journal</h1>
        
        {/* Search */}
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

      {/* New Entry Button */}
      <Button
        className="w-full gap-2 h-12"
        onClick={openNewEntryDialog}
        data-testid="button-new-entry"
      >
        <Plus className="h-5 w-5" />
        New Journal Entry
      </Button>

      {/* Entries */}
      <section className="space-y-4" aria-label="Journal entries">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No entries found' : 'No journal entries yet'}
            </p>
            {!searchQuery && (
              <Button variant="outline" onClick={openNewEntryDialog} data-testid="button-create-first">
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
              onClick={() => openEditEntryDialog(entry)}
            />
          ))
        )}
      </section>

      {/* Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-journal-entry">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Entry' : 'New Journal Entry'}</DialogTitle>
            <DialogDescription>
              {editingEntry ? 'Update your journal entry' : 'Write about your day, feelings, or recovery journey'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Entry</Label>
              <Textarea
                id="content"
                placeholder="Write your thoughts..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="min-h-40"
                data-testid="input-content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Mood (1-10)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="mood"
                  type="range"
                  min="1"
                  max="10"
                  value={formMood}
                  onChange={(e) => setFormMood(parseInt(e.target.value))}
                  className="flex-1"
                  data-testid="input-mood"
                />
                <span className="text-lg font-semibold w-8 text-center" data-testid="text-mood-value">
                  {formMood}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., gratitude, meeting, sponsor"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                data-testid="input-tags"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingEntry && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDeleteClick(editingEntry.id);
                  setDialogOpen(false);
                }}
                className="sm:mr-auto"
                data-testid="button-delete"
              >
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSaveEntry} data-testid="button-save">
              {editingEntry ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
