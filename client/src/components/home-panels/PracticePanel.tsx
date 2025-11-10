import DailyAffirmation from "@/components/DailyAffirmation";
import DailyQuote from "@/components/DailyQuote";
import StreakCard from "@/components/StreakCard";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  Sparkles,
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  Undo2,
} from "lucide-react";
import { Link } from "wouter";
import type { Streaks } from "@/types";

interface PracticePanelProps {
  streaks: Streaks;
  onQuickJournal: () => void;
  onQuickGratitude: () => void;
  onQuickMeeting: () => void;
  onRelapseReset: () => void;
}

export default function PracticePanel({
  streaks,
  onQuickJournal,
  onQuickGratitude,
  onQuickMeeting,
  onRelapseReset,
}: PracticePanelProps) {
  return (
    <div className="space-y-6 px-6">
      {/* Daily Inspiration */}
      <section className="space-y-3" aria-label="Daily inspiration">
        <DailyAffirmation date={new Date()} />
        <DailyQuote />
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading">
        <div className="mb-4">
          <h2 id="quick-actions-heading" className="text-xl font-semibold tracking-tight">
            Quick Actions
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Log your progress in seconds
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="lg"
            className="h-20 flex flex-col gap-1.5 p-2"
            onClick={onQuickJournal}
            data-testid="quick-action-journal"
          >
            <PenLine className="h-5 w-5" />
            <span className="text-xs font-medium">Journal</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-20 flex flex-col gap-1.5 p-2"
            onClick={onQuickGratitude}
            data-testid="quick-action-gratitude"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-medium">Gratitude</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-20 flex flex-col gap-1.5 p-2 col-span-2 sm:col-span-1"
            onClick={onQuickMeeting}
            data-testid="quick-action-meeting"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Meeting</span>
          </Button>

          <Link href="/steps" className="col-span-2">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-20 flex flex-col gap-1.5 p-2"
              data-testid="quick-action-steps"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Step Work</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="h-20 flex flex-col gap-1.5 p-2 border-destructive/30 text-destructive hover:border-destructive/50"
            onClick={onRelapseReset}
            data-testid="quick-action-relapse"
          >
            <Undo2 className="h-5 w-5" />
            <span className="text-xs font-medium">Log Slip</span>
          </Button>
        </div>
      </section>

      {/* Streaks */}
      <section aria-labelledby="streaks-heading">
        <div className="mb-4">
          <h2 id="streaks-heading" className="text-xl font-semibold tracking-tight">
            Streaks
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Keep the momentum going
          </p>
        </div>
        <div className="space-y-3">
          {/* Primary Streak - Hero Card */}
          {(() => {
            const streakConfigs = [
              { key: 'journaling', title: 'Journaling', icon: PenLine, color: 'blue' as const, streak: streaks.journaling },
              { key: 'dailyCards', title: 'Daily Cards', icon: Calendar, color: 'green' as const, streak: streaks.dailyCards },
              { key: 'stepWork', title: 'Step Work', icon: BookOpen, color: 'purple' as const, streak: streaks.stepWork },
              { key: 'meetings', title: 'Meetings', icon: UserCheck, color: 'orange' as const, streak: streaks.meetings },
            ];

            const primaryStreak = streakConfigs.reduce((prev, current) => 
              current.streak.current > prev.streak.current ? current : prev
            );

            const secondaryStreaks = streakConfigs.filter(s => s.key !== primaryStreak.key);

            return (
              <>
                <StreakCard
                  title={primaryStreak.title}
                  icon={primaryStreak.icon}
                  streak={primaryStreak.streak}
                  color={primaryStreak.color}
                  variant="hero"
                />
                
                {/* Secondary Streaks - Compact Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {secondaryStreaks.map((config) => (
                    <StreakCard
                      key={config.key}
                      title={config.title}
                      icon={config.icon}
                      streak={config.streak}
                      color={config.color}
                      variant="compact"
                    />
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
