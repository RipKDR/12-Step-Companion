import { Card } from '@/components/ui/card';
import { TrendingUp, CheckCircle2, Heart, AlertTriangle } from 'lucide-react';

export default function Insights() {
  return (
    <div className="pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Insights</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your patterns, triggers, and overall progress.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Avg Mood */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  AVG MOOD
                </div>
                <div className="text-2xl font-bold">87%</div>
                <div className="text-xs text-green-400">+2% from last week</div>
              </div>
            </div>
          </Card>

          {/* Check-ins */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-400/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(155 70% 50%)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  CHECK-INS
                </div>
                <div className="text-2xl font-bold">6/7</div>
                <div className="text-xs text-muted-foreground">Days this week</div>
              </div>
            </div>
          </Card>

          {/* Gratitude */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pink-400/10 rounded-lg">
                <Heart className="h-4 w-4 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  GRATITUDE
                </div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-xs text-muted-foreground">Entries logged</div>
              </div>
            </div>
          </Card>

          {/* Triggers */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-400/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  TRIGGERS
                </div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs text-muted-foreground">Identified</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Mood Placeholder */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Weekly Mood</h3>
          <p className="text-sm text-muted-foreground">
            Your emotional baseline this week.
          </p>
          <div className="mt-4 h-48 bg-muted/30 rounded-lg flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Chart will be implemented in ADVANCED-1</p>
          </div>
        </Card>

        {/* Common Triggers Placeholder */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Common Triggers</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Work stress</span>
                <span className="text-xs text-muted-foreground">15 occurrences</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Social situations</span>
                <span className="text-xs text-muted-foreground">8 occurrences</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: '40%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Family dynamics</span>
                <span className="text-xs text-muted-foreground">5 occurrences</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
