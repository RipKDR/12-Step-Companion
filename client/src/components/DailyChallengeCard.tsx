import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, HelpCircle, Flame } from 'lucide-react';
import type { DailyChallenge, ChallengeTheme } from '@/types';
import { cn } from '@/lib/utils';
import { getThemeColor } from '@/lib/challenges';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  theme: ChallengeTheme;
  isCompleted: boolean;
  weeklyCount: number;
  onComplete: () => void;
}

export default function DailyChallengeCard({
  challenge,
  theme,
  isCompleted,
  weeklyCount,
  onComplete,
}: DailyChallengeCardProps) {
  const colors = getThemeColor(challenge.theme);

  return (
    <Card
      className={cn(
        'border-2 transition-all duration-200',
        isCompleted
          ? 'bg-muted/50 opacity-75'
          : cn(colors.bg, colors.border, 'hover:shadow-lg')
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{theme.icon}</span>
              <div>
                <CardTitle className={cn('text-lg', colors.text)}>
                  {theme.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {theme.description}
                </CardDescription>
              </div>
            </div>
          </div>

          {/* Weekly streak counter */}
          {weeklyCount > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900">
              <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                {weeklyCount}/7
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge title */}
        <div>
          <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>

        {/* Why section */}
        {!isCompleted && (
          <div className={cn('rounded-lg p-3 border', colors.bg, colors.border)}>
            <div className="flex items-start gap-2">
              <HelpCircle className={cn('h-4 w-4 mt-0.5', colors.text)} />
              <div>
                <p className={cn('text-xs font-medium mb-1', colors.text)}>Why this matters:</p>
                <p className="text-xs text-muted-foreground">{challenge.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        {isCompleted ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-5 w-5 text-green-600" />
            <span>Completed today! Great work! 🎉</span>
          </div>
        ) : (
          <Button
            onClick={onComplete}
            className="w-full"
            size="lg"
          >
            <Check className="mr-2 h-5 w-5" />
            Mark as Done ✓
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
