import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

interface ToolOutcomePromptProps {
  usageId: string;
  toolName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolOutcomePrompt({ usageId, toolName, open, onOpenChange }: ToolOutcomePromptProps) {
  const recordToolOutcome = useAppStore((state) => state.recordToolOutcome);
  const [result, setResult] = useState<'better' | 'same' | 'worse' | null>(null);
  const [cravingChange, setCravingChange] = useState<number>(0);
  const [moodChange, setMoodChange] = useState<number>(0);
  const [notes, setNotes] = useState('');
  
  const handleSubmit = () => {
    if (!result) return;
    
    recordToolOutcome(usageId, {
      checkedAtISO: new Date().toISOString(),
      result,
      cravingChange: cravingChange !== 0 ? cravingChange : undefined,
      moodChange: moodChange !== 0 ? moodChange : undefined,
      notes: notes.trim() || undefined,
    });
    
    onOpenChange(false);
    // Reset form
    setResult(null);
    setCravingChange(0);
    setMoodChange(0);
    setNotes('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Did {toolName.replace(/-/g, ' ')} help?</DialogTitle>
          <DialogDescription>
            Your feedback helps us learn what works best for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={result === 'better' ? 'default' : 'outline'}
              onClick={() => setResult('better')}
              className="flex-1"
            >
              Better
            </Button>
            <Button
              variant={result === 'same' ? 'default' : 'outline'}
              onClick={() => setResult('same')}
              className="flex-1"
            >
              Same
            </Button>
            <Button
              variant={result === 'worse' ? 'default' : 'outline'}
              onClick={() => setResult('worse')}
              className="flex-1"
            >
              Worse
            </Button>
          </div>
          
          {/* Optional: Notes textarea */}
          <div className="space-y-2">
            <Label htmlFor="outcome-notes">Notes (optional)</Label>
            <Textarea
              id="outcome-notes"
              placeholder="Any additional thoughts..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!result} className="flex-1">
              Submit
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

