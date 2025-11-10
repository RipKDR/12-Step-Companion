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
        <div className="grid grid-cols-2 gap-3">
          <StreakCard
            title="Journaling"
            icon={PenLine}
            streak={streaks.journaling}
            color="blue"
          />
          <StreakCard
            title="Daily Cards"
            icon={Calendar}
            streak={streaks.dailyCards}
            color="green"
          />
          <StreakCard
            title="Step Work"
            icon={BookOpen}
            streak={streaks.stepWork}
            color="purple"
          />
          <StreakCard
            title="Meetings"
            icon={UserCheck}
            streak={streaks.meetings}
            color="orange"
          />
        </div>
      </section>
    </div>
  );
}
