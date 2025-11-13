import { EnhancedSobrietyCounter } from "@/components/EnhancedSobrietyCounter";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Bot,
  MessageCircle,
  Zap,
  TrendingUp,
  Target,
} from "lucide-react";
import { Link } from "wouter";
import type { DailyChallenge, ChallengeTheme, Profile } from "@/types";

interface TodayPanelProps {
  profile: Profile | undefined;
  totalActiveStreaks: number;
  highestStreak: number;
  currentStep: number;
  todaysChallenge: DailyChallenge | null;
  challengeTheme: ChallengeTheme | null;
  isChallengeCompleted: boolean;
  weeklyCount: number;
  onChallengeComplete: () => void;
}

export default function TodayPanel({
  profile,
  totalActiveStreaks,
  highestStreak,
  currentStep,
  todaysChallenge,
  challengeTheme,
  isChallengeCompleted,
  weeklyCount,
  onChallengeComplete,
}: TodayPanelProps) {
  return (
    <div className="space-y-6 px-6">
      {/* Hero - Sobriety Counter */}
      <section aria-labelledby="sobriety-heading">
        <h2 id="sobriety-heading" className="sr-only">
          Your Clean Time
        </h2>
        {profile?.cleanDate ? (
          <EnhancedSobrietyCounter
            cleanDate={profile.cleanDate}
            timezone={profile.timezone}
            nextMilestone={30}
          />
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                Complete onboarding to start tracking your clean time
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3" aria-label="Quick statistics">
        <Card className="p-3 sm:p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1.5 sm:mb-2">
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{totalActiveStreaks}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1.5 sm:mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{highestStreak}</p>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 col-span-2 sm:col-span-1">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1.5 sm:mb-2">
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{currentStep}</p>
            <p className="text-xs text-muted-foreground">Current Step</p>
          </div>
        </Card>
      </section>

      {/* Priority Support */}
      <section className="space-y-3" aria-label="Priority support">
        <Link href="/emergency">
          <Card className="cursor-pointer border-2 border-destructive/20 hover:border-destructive/40 hover-elevate active-elevate-2" data-testid="link-emergency">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">Need Support Now?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Crisis tools & emergency contacts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai-sponsor">
          <Card className="cursor-pointer relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 hover-elevate active-elevate-2" data-testid="link-ai-sponsor">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/15 text-primary shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">AI Sponsor</h3>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">24/7</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Get support & guidance anytime
                  </p>
                </div>
                <MessageCircle className="h-4 w-4 text-primary shrink-0" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Today's Challenge */}
      {todaysChallenge && challengeTheme && (
        <section aria-labelledby="challenge-heading">
          <h2 id="challenge-heading" className="sr-only">
            Today's Challenge
          </h2>
          <DailyChallengeCard
            challenge={todaysChallenge}
            theme={challengeTheme}
            isCompleted={isChallengeCompleted}
            weeklyCount={weeklyCount}
            onComplete={onChallengeComplete}
          />
        </section>
      )}
    </div>
  );
}
