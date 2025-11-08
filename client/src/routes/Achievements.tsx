import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trophy, Filter } from 'lucide-react';
import AchievementCard from '@/components/AchievementCard';
import MilestoneCelebrationModal, { type MilestoneData } from '@/components/MilestoneCelebrationModal';
import { useAppStore } from '@/store/useAppStore';
import {
  loadAchievements,
  calculateAchievementProgress,
  getCategoryIcon,
} from '@/lib/achievements';
import type { Achievement } from '@/types';

const CATEGORIES: Array<{ id: Achievement['category']; label: string }> = [
  { id: 'sobriety', label: 'Sobriety' },
  { id: 'step-work', label: 'Step Work' },
  { id: 'community', label: 'Community' },
  { id: 'self-care', label: 'Self Care' },
  { id: 'crisis', label: 'Crisis' },
];

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const [celebrationMilestone, setCelebrationMilestone] = useState<MilestoneData | null>(null);

  const state = useAppStore((state) => state);
  const unlockedAchievements = useAppStore((state) => state.unlockedAchievements || {});

  useEffect(() => {
    loadAchievements().then(setAchievements);
  }, []);

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = Object.keys(unlockedAchievements).length;
  const totalCount = achievements.length;

  const handleAchievementClick = (achievement: Achievement) => {
    const unlocked = unlockedAchievements[achievement.id];

    // If unlocked, show celebration
    if (unlocked) {
      setCelebrationMilestone({
        id: achievement.id,
        type: 'achievement',
        milestone: achievement.id,
        title: achievement.title,
        message: achievement.description,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pb-32 pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Achievements</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Track your progress and unlock achievements as you continue your recovery journey
        </p>
      </div>

      {/* Stats Card */}
      <Card className="mb-8 border-primary/30">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Achievements unlocked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-primary">{unlockedCount}</span>
            <span className="text-2xl text-muted-foreground">/ {totalCount}</span>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Filter by Category</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="mr-2">{getCategoryIcon(category.id)}</span>
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const unlocked = unlockedAchievements[achievement.id];
          const progress = calculateAchievementProgress(achievement, state);

          return (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={unlocked}
              progress={progress}
              onClick={() => handleAchievementClick(achievement)}
            />
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No achievements in this category yet</p>
        </div>
      )}

      {/* Celebration Modal */}
      <MilestoneCelebrationModal
        open={!!celebrationMilestone}
        onOpenChange={(open) => {
          if (!open) setCelebrationMilestone(null);
        }}
        milestone={celebrationMilestone}
      />
    </div>
  );
}
