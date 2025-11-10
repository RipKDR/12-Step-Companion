import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StreakData } from '@/types';
import { getStreakColor } from '@/lib/streaks';
import { LucideIcon, Flame, Crown, TrendingUp } from 'lucide-react';

interface StreakCardProps {
  title: string;
  icon: LucideIcon;
  streak: StreakData;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  variant?: 'hero' | 'compact';
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

const bgGradientClasses = {
  blue: 'from-blue-500/10 to-transparent',
  green: 'from-green-500/10 to-transparent',
  purple: 'from-purple-500/10 to-transparent',
  orange: 'from-orange-500/10 to-transparent',
};

export default function StreakCard({
  title,
  icon: Icon,
  streak,
  color = 'green',
  variant = 'compact',
  onClick,
}: StreakCardProps) {
  const streakColor = getStreakColor(streak.current, streak.longest);
  const isActive = streak.current > 0;
  const isRecord = streakColor === 'record';
  const isClickable = !!onClick;

  if (variant === 'hero') {
    return (
      <Card
        className={`relative overflow-hidden transition-all border-2 ${
          isActive ? borderColorClasses[color] : 'border-muted'
        } ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}`}
        onClick={onClick}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradientClasses[color]} pointer-events-none`} />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-background/80 ${iconColorClasses[color]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-xs text-muted-foreground">Primary Streak</p>
              </div>
            </div>
            {isRecord && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3 text-yellow-500" />
                <span className="text-xs">Record</span>
              </Badge>
            )}
            {!isRecord && streak.current >= 7 && (
              <Flame className={`h-6 w-6 ${iconColorClasses[color]}`} />
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className={`text-5xl font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {streak.current}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {streak.current === 1 ? 'day streak' : 'days streak'}
              </div>
            </div>

            {streak.longest > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Best: {streak.longest}</span>
                </div>
              </div>
            )}
          </div>

          {!isActive && streak.longest > 0 && (
            <div className="mt-4 text-sm text-muted-foreground border-t border-border/50 pt-3">
              Start a new streak today!
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`transition-all ${isClickable ? 'cursor-pointer hover-elevate' : ''} ${
        isActive
          ? `bg-card border ${borderColorClasses[color]}`
          : 'bg-muted/50 border-muted'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${iconColorClasses[color]}`} />
          <h3 className="font-medium text-xs flex-1">{title}</h3>
          {isRecord && <Crown className="h-3.5 w-3.5 text-yellow-500" />}
          {!isRecord && streak.current >= 7 && (
            <Flame className={`h-3.5 w-3.5 ${iconColorClasses[color]}`} />
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <div className={`text-2xl font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
            {streak.current}
          </div>
          <div className="text-xs text-muted-foreground">
            {streak.current === 1 ? 'day' : 'days'}
          </div>
        </div>

        {streak.longest > 0 && (
          <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Best: {streak.longest}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
