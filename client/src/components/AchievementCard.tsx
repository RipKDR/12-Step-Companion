import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';
import type { Achievement, UnlockedAchievement } from '@/types';
import { getRarityColor, getRarityBg } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked?: UnlockedAchievement;
  progress?: number;
  onClick?: () => void;
}

export default function AchievementCard({
  achievement,
  unlocked,
  progress = 0,
  onClick,
}: AchievementCardProps) {
  const isUnlocked = !!unlocked;
  const progressPercent = Math.min(
    (progress / achievement.criteria.target) * 100,
    100
  );

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-105',
        isUnlocked ? 'border-2' : 'opacity-60',
        isUnlocked && getRarityBg(achievement.rarity)
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {isUnlocked ? (
              <div className="text-5xl mb-2">{achievement.icon}</div>
            ) : (
              <div className="relative text-5xl mb-2 filter grayscale opacity-30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                {achievement.icon}
              </div>
            )}
            <CardTitle className={cn('text-lg', getRarityColor(achievement.rarity))}>
              {achievement.title}
            </CardTitle>
            <span className={cn(
              'text-xs font-medium uppercase tracking-wide',
              getRarityColor(achievement.rarity)
            )}>
              {achievement.rarity}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm mb-3">
          {achievement.description}
        </CardDescription>

        {/* Progress bar for locked achievements */}
        {!isUnlocked && progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {progress} / {achievement.criteria.target}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Unlock date for unlocked achievements */}
        {isUnlocked && unlocked && (
          <div className="text-xs text-muted-foreground">
            Unlocked {new Date(unlocked.unlockedAtISO).toLocaleDateString()}
          </div>
        )}
      </CardContent>

      {/* Rarity indicator stripe */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-1',
          achievement.rarity === 'common' && 'bg-muted',
          achievement.rarity === 'uncommon' && 'bg-secondary',
          achievement.rarity === 'rare' && 'bg-primary',
          achievement.rarity === 'epic' && 'bg-accent'
        )}
      />
    </Card>
  );
}
