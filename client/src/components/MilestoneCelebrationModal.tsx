import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles, Trophy, Flame, BookOpen, CheckCircle } from 'lucide-react';

export interface MilestoneData {
  id: string;
  type: 'sobriety' | 'streak' | 'achievement' | 'step';
  milestone: string; // e.g., "1d", "7d", "30d", "step-1"
  title: string; // e.g., "30 Days Clean!"
  message: string; // Personalized encouragement
}

interface MilestoneCelebrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: MilestoneData | null;
  onShare?: () => void;
}

const getMilestoneIcon = (type: MilestoneData['type']) => {
  switch (type) {
    case 'sobriety':
      return CheckCircle;
    case 'streak':
      return Flame;
    case 'achievement':
      return Trophy;
    case 'step':
      return BookOpen;
    default:
      return Sparkles;
  }
};

export default function MilestoneCelebrationModal({
  open,
  onOpenChange,
  milestone,
  onShare,
}: MilestoneCelebrationModalProps) {
  if (!milestone) return null;

  const Icon = getMilestoneIcon(milestone.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-milestone">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center" data-testid="icon-milestone">
            <Icon className="h-10 w-10 text-primary" />
          </div>

          <DialogTitle className="text-2xl font-semibold text-center" data-testid="text-milestone-title">
            {milestone.title}
          </DialogTitle>

          <DialogDescription className="text-base text-center px-4" data-testid="text-milestone-message">
            {milestone.message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">
              Keep going. One day at a time.
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {onShare && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onShare();
                onOpenChange(false);
              }}
              className="w-full sm:w-auto"
              data-testid="button-share"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
            data-testid="button-continue"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
