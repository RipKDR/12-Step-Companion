import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

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

const getMilestoneEmoji = (type: MilestoneData['type']): string => {
  switch (type) {
    case 'sobriety':
      return '🎉';
    case 'streak':
      return '🔥';
    case 'achievement':
      return '🏆';
    case 'step':
      return '📖';
    default:
      return '✨';
  }
};

export default function MilestoneCelebrationModal({
  open,
  onOpenChange,
  milestone,
  onShare,
}: MilestoneCelebrationModalProps) {
  useEffect(() => {
    if (open && milestone) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Burst from two sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [open, milestone]);

  if (!milestone) return null;

  const emoji = getMilestoneEmoji(milestone.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-2 border-primary/50">
        <DialogHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-8xl mx-auto"
          >
            {emoji}
          </motion.div>

          <DialogTitle className="text-4xl font-bold text-center">
            {milestone.title}
          </DialogTitle>

          <DialogDescription className="text-lg text-center px-4">
            {milestone.message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-sm italic">
              Keep going. One day at a time. ✨
            </span>
          </motion.div>
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
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Continue 💪
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
