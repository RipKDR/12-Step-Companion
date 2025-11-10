import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trophy, Filter, Gift, Download } from 'lucide-react';
import AchievementCard from '@/components/AchievementCard';
import MilestoneCelebrationModal, { type MilestoneData } from '@/components/MilestoneCelebrationModal';
import { useAppStore } from '@/store/useAppStore';
import {
  loadAchievements,
  calculateAchievementProgress,
  getCategoryIcon,
} from '@/lib/achievements';
import type { Achievement, RecoveryPointTransaction, RecoveryPointRedemption, RecoveryPointReward } from '@/types';

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
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const state = useAppStore((state) => state);
  const unlockedAchievements = useAppStore((state) => state.unlockedAchievements || {});
  const recoveryPoints = useAppStore((state) => state.recoveryPoints);
  const redeemReward = useAppStore((state) => state.redeemReward);
  const exportRecoveryPointsSummary = useAppStore((state) => state.exportRecoveryPointsSummary);

  useEffect(() => {
    loadAchievements().then(setAchievements);
  }, []);

  useEffect(() => {
    if (!exportNotice) return;
    const timeout = setTimeout(() => setExportNotice(null), 4000);
    return () => clearTimeout(timeout);
  }, [exportNotice]);

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = Object.keys(unlockedAchievements).length;
  const totalCount = achievements.length;
  const completionPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const rewards = useMemo<RecoveryPointReward[]>(() => {
    return Object.values(recoveryPoints.rewards || {}).sort((a, b) => a.cost - b.cost);
  }, [recoveryPoints.rewards]);

  const recentTransactions = useMemo<RecoveryPointTransaction[]>(() => {
    return Object.values(recoveryPoints.transactions || {})
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [recoveryPoints.transactions]);

  const redemptionHistory = useMemo<RecoveryPointRedemption[]>(() => {
    return Object.values(recoveryPoints.redemptions || {})
      .sort((a, b) => new Date(b.redeemedAtISO).getTime() - new Date(a.redeemedAtISO).getTime());
  }, [recoveryPoints.redemptions]);

  const formatDateTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return iso;
    }
  };

  const handleRedeemReward = (reward: RecoveryPointReward) => {
    redeemReward(reward.id);
  };

  const handleExportSummary = () => {
    const summary = exportRecoveryPointsSummary();
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `recovery-points-summary-${new Date().toISOString()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setExportNotice('An anonymized recovery points summary was exported.');
  };

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
    <div className="max-w-6xl mx-auto px-6 pb-20 sm:pb-24 pt-8">
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
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Recovery Points</CardTitle>
            <CardDescription>Track and redeem supportive rewards</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportSummary}>
            <Download className="mr-2 h-4 w-4" />
            Export summary
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Current balance</p>
              <p className="text-3xl font-semibold">{recoveryPoints.balance.current} pts</p>
            </div>
            <div className="rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Lifetime earned</p>
              <p className="text-2xl font-semibold">{recoveryPoints.balance.lifetimeEarned} pts</p>
            </div>
            <div className="rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Lifetime redeemed</p>
              <p className="text-2xl font-semibold">{recoveryPoints.balance.lifetimeRedeemed} pts</p>
            </div>
          </div>

          {exportNotice && (
            <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
              {exportNotice}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Redeem Support Rewards</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rewards.map((reward) => {
            const canRedeem = recoveryPoints.balance.current >= reward.cost;
            return (
              <Card key={reward.id} className="border-muted">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {reward.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Cost: <span className="font-semibold text-primary">{reward.cost} pts</span>
                  </div>
                  <Button
                    variant="default"
                    disabled={!canRedeem}
                    onClick={() => handleRedeemReward(reward)}
                  >
                    Redeem
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {rewards.length === 0 && (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No rewards configured yet. Check back soon!
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Recent Point Activity</CardTitle>
            <CardDescription>Latest awards and redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 && (
                <p className="text-sm text-muted-foreground">No point activity yet. Earn points by completing achievements and daily practices.</p>
              )}
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {transaction.type === 'award' ? 'Points awarded' : 'Points redeemed'}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(transaction.timestamp)}</p>
                  </div>
                  <span className={`text-sm font-semibold ${transaction.type === 'award' ? 'text-emerald-600' : 'text-destructive'}`}>
                    {transaction.type === 'award' ? '+' : '-'}{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reward Redemptions</CardTitle>
            <CardDescription>Catalogued support unlocks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {redemptionHistory.length === 0 && (
                <p className="text-sm text-muted-foreground">No rewards redeemed yet. Redeem a support to see it logged here.</p>
              )}
              {redemptionHistory.map((redemption) => {
                const reward = recoveryPoints.rewards[redemption.rewardId];
                return (
                  <div key={redemption.id} className="rounded-lg border p-3">
                    <p className="text-sm font-semibold">{reward?.name ?? redemption.rewardId}</p>
                    <p className="text-xs text-muted-foreground">
                      Redeemed on {formatDateTime(redemption.redeemedAtISO)}
                    </p>
                    {redemption.notes && (
                      <p className="mt-1 text-xs text-muted-foreground">Notes: {redemption.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

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
