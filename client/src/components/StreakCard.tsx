import { Card, CardContent } from '@/components/ui/card';
import type { StreakData } from '@/types';
import { getStreakFireEmoji, getStreakColor } from '@/lib/streaks';
import { LucideIcon, Flame, Crown } from 'lucide-react';

interface StreakCardProps {
  title: string;
  icon: LucideIcon;
  streak: StreakData;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

const borderColorClasses = {
  blue: 'border-blue-500/30',
  green: 'border-green-500/30',
  purple: 'border-purple-500/30',
  orange: 'border-orange-500/30',
};

const iconColorClasses = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
};

export default function StreakCard({
  title,
  icon: Icon,
  streak,
  color = 'green',
  onClick,
}: StreakCardProps) {
  const fireEmoji = getStreakFireEmoji(streak.current);
  const streakColor = getStreakColor(streak.current, streak.longest);
  const isActive = streak.current > 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive
          ? `bg-card border ${borderColorClasses[color]}`
          : 'bg-muted/50 border-muted'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColorClasses[color]}`} />
            <h3 className="font-medium text-sm">{title}</h3>
          </div>
          {streak.current >= 7 && (
            <Flame className={`h-5 w-5 ${iconColorClasses[color]}`} />
          )}
        </div>

        <div className="space-y-2">
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {streak.current}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {streak.current === 1 ? 'day' : 'days'}
            </div>
          </div>

          {streak.longest > 0 && (
            <div className="text-center pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                Longest: {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
                {streakColor === 'record' && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
              </div>
            </div>
          )}

          {!isActive && streak.longest > 0 && (
            <div className="text-center text-xs text-muted-foreground pt-1">
              Start a new streak!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
