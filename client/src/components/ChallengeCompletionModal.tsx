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
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ChallengeCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (notes?: string) => void;
}

export default function ChallengeCompletionModal({
  open,
  onOpenChange,
  onSave,
}: ChallengeCompletionModalProps) {
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave(notes.trim() || undefined);
    setNotes('');
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSave(undefined);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl mx-auto mb-4"
          >
            🎉
          </motion.div>

          <DialogTitle className="text-2xl">Great work!</DialogTitle>

          <DialogDescription className="text-base">
            You completed today's challenge. Want to share what you did?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="challenge-notes" className="text-sm text-muted-foreground mb-2 block">
            Optional: Share your experience (for your own reflection)
          </Label>
          <Textarea
            id="challenge-notes"
            placeholder="What did you do? How did it feel? What did you learn?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] resize-none"
            autoFocus
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <Sparkles className="h-4 w-4" />
          <span className="italic">
            Consistency builds recovery. Keep showing up, one day at a time.
          </span>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
