import { useMemo, useState, useEffect } from "react";
import SobrietyCounter from "@/components/SobrietyCounter";
import DailyCard from "@/components/DailyCard";
import GratitudeList from "@/components/GratitudeList";
import QuickNotes from "@/components/QuickNotes";
import MeditationTimer from "@/components/MeditationTimer";
import DailyAffirmation from "@/components/DailyAffirmation";
import DailyQuote from "@/components/DailyQuote";
import ProgressRing from "@/components/ProgressRing";
import StreakCard from "@/components/StreakCard";
import QuickJournalModal from "@/components/QuickJournalModal";
import QuickGratitudeModal from "@/components/QuickGratitudeModal";
import QuickMeetingLogModal from "@/components/QuickMeetingLogModal";
import RelapseResetModal from "@/components/RelapseResetModal";
import MilestoneCelebrationModal, {
  type MilestoneData,
} from "@/components/MilestoneCelebrationModal";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import ChallengeCompletionModal from "@/components/ChallengeCompletionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sunrise,
  Moon,
  BookOpen,
  BookMarked,
  Phone,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Users,
  PenLine,
  Calendar,
  UserCheck,
  Trophy,
  Undo2,
  Bot,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
} from "lucide-react";
import { Link } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { getTodayDate } from "@/lib/time";
import { loadAllSteps } from "@/lib/contentLoader";
import { cn } from "@/lib/utils";
import { checkSobrietyMilestone, checkStreakMilestone } from "@/lib/milestones";
import { checkAchievements } from "@/lib/achievements";
import {
  getTodaysChallenge,
  getThemeData,
  isTodayChallengeCompleted,
  getWeeklyCompletionCount,
} from "@/lib/challenges";
import type {
  CelebratedMilestone,
  UnlockedAchievement,
  DailyChallenge,
  ChallengeTheme,
} from "@/types";

export default function Home() {
  const profile = useAppStore((state) => state.profile);
  const getDailyCard = useAppStore((state) => state.getDailyCard);
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);
  const getStepAnswers = useAppStore((state) => state.getStepAnswers);
  const stepAnswersState = useAppStore((state) => state.stepAnswers);
  const streaks = useAppStore((state) => state.streaks);
  const checkAllStreaks = useAppStore((state) => state.checkAllStreaks);
  const celebratedMilestones = useAppStore(
    (state) => state.celebratedMilestones || {},
  );
  const celebrateMilestone = useAppStore((state) => state.celebrateMilestone);
  const unlockAchievement = useAppStore((state) => state.unlockAchievement);
  const completedChallenges = useAppStore(
    (state) => state.completedChallenges || {},
  );
  const completeChallenge = useAppStore((state) => state.completeChallenge);
  const trackAnalyticsEvent = useAppStore((state) => state.trackAnalyticsEvent);
  const awardPoints = useAppStore((state) => state.awardPoints);

  const [stepQuestionCounts, setStepQuestionCounts] = useState<
    Map<number, number>
  >(new Map());
  const [showQuickJournal, setShowQuickJournal] = useState(false);
  const [showQuickGratitude, setShowQuickGratitude] = useState(false);
  const [showQuickMeeting, setShowQuickMeeting] = useState(false);
  const [showRelapseReset, setShowRelapseReset] = useState(false);
  const [currentMilestone, setCurrentMilestone] =
    useState<MilestoneData | null>(null);
  const [todaysChallenge, setTodaysChallenge] = useState<DailyChallenge | null>(
    null,
  );
  const [challengeTheme, setChallengeTheme] = useState<ChallengeTheme | null>(
    null,
  );
  const [showChallengeCompletion, setShowChallengeCompletion] = useState(false);
  const [showDailyPractice, setShowDailyPractice] = useState(false);

  const todayDate = useMemo(
    () => getTodayDate(profile?.timezone || "Australia/Melbourne"),
    [profile?.timezone],
  );
  const dailyCard = getDailyCard(todayDate);

  // Load all step contents to get question counts
  useEffect(() => {
    loadAllSteps().then((allSteps) => {
      const counts = new Map<number, number>();
      allSteps.forEach((content, stepNum) => {
        counts.set(stepNum, content.questions.length);
      });
      setStepQuestionCounts(counts);
    });
  }, []);

  // Load today's challenge
  useEffect(() => {
    getTodaysChallenge().then((challenge) => {
      if (challenge) {
        setTodaysChallenge(challenge);
        getThemeData(challenge.theme).then((theme) => {
          if (theme) setChallengeTheme(theme);
        });
      }
    });
  }, []);

  // Check and break stale streaks on mount
  useEffect(() => {
    checkAllStreaks();
    trackAnalyticsEvent("app_opened");
  }, [checkAllStreaks, trackAnalyticsEvent]);

  // Check for milestone celebrations
  useEffect(() => {
    if (!profile?.cleanDate) return;

    const sobrietyMilestone = checkSobrietyMilestone(
      profile.cleanDate,
      celebratedMilestones,
    );
    if (sobrietyMilestone) {
      setCurrentMilestone(sobrietyMilestone);
      return;
    }

    const streakTypes: Array<
      "journaling" | "dailyCards" | "meetings" | "stepWork"
    > = ["journaling", "dailyCards", "meetings", "stepWork"];

    for (const streakType of streakTypes) {
      const streak = streaks[streakType];
      const streakMilestone = checkStreakMilestone(
        streak.current,
        streakType,
        celebratedMilestones,
      );
      if (streakMilestone) {
        setCurrentMilestone(streakMilestone);
        return;
      }
    }
  }, [profile?.cleanDate, celebratedMilestones, streaks]);

  const handleMilestoneCelebrated = () => {
    if (currentMilestone) {
      const celebratedMilestoneData: CelebratedMilestone = {
        id: currentMilestone.id,
        type: currentMilestone.type,
        milestone: currentMilestone.milestone,
        celebratedAtISO: new Date().toISOString(),
      };
      celebrateMilestone(celebratedMilestoneData);
      trackAnalyticsEvent("milestone_celebrated", {
        type: currentMilestone.type,
        milestone: currentMilestone.milestone,
      });
      setCurrentMilestone(null);
    }
  };

  // Check for newly unlocked achievements
  useEffect(() => {
    checkAchievements(useAppStore.getState()).then((newAchievements) => {
      newAchievements.forEach((achievement) => {
        const unlockedAchievement: UnlockedAchievement = {
          id: `unlock_${achievement.id}_${Date.now()}`,
          achievementId: achievement.id,
          unlockedAtISO: new Date().toISOString(),
        };
        unlockAchievement(unlockedAchievement);
        trackAnalyticsEvent("achievement_unlocked", {
          achievementCategory: achievement.category,
          rarity: achievement.rarity,
        });

        if (achievement.recoveryPoints) {
          awardPoints({
            amount: achievement.recoveryPoints.amount,
            reason: `Achievement unlocked: ${achievement.title}`,
            source: "achievement",
            relatedId: achievement.id,
            metadata: {
              behavior: achievement.recoveryPoints.behavior,
              trigger: achievement.recoveryPoints.trigger,
            },
          });
        }

        if (!currentMilestone) {
          setCurrentMilestone({
            id: achievement.id,
            type: "achievement",
            milestone: achievement.id,
            title: achievement.title,
            message: achievement.description,
          });
        }
      });
    });
  }, [streaks, profile?.cleanDate, stepAnswersState]);

  const stepProgress = useMemo(() => {
    const totalSteps = 12;
    let currentStep = 1;
    let currentStepAnswers = 0;
    let currentStepTotalQuestions = 0;

    for (let step = 1; step <= totalSteps; step++) {
      const answers = getStepAnswers(step);
      const totalQuestions = stepQuestionCounts.get(step) || 0;
      const completedAnswers = answers.filter((a) => a.answer.trim()).length;

      if (completedAnswers < totalQuestions) {
        currentStep = step;
        currentStepAnswers = completedAnswers;
        currentStepTotalQuestions = totalQuestions;
        break;
      }

      currentStep = step + 1;
      currentStepAnswers = 0;
      currentStepTotalQuestions = stepQuestionCounts.get(step + 1) || 0;
    }

    if (currentStep > totalSteps) {
      currentStep = totalSteps;
      const lastStepTotal = stepQuestionCounts.get(totalSteps) || 0;
      currentStepAnswers = lastStepTotal;
      currentStepTotalQuestions = lastStepTotal;
    }

    return {
      currentStep,
      answeredQuestions: currentStepAnswers,
      totalQuestions: currentStepTotalQuestions,
    };
  }, [getStepAnswers, stepQuestionCounts, stepAnswersState]);

  const handleMorningChange = (value: string) => {
    updateDailyCard(todayDate, { morningIntent: value });
  };

  const handleMorningComplete = () => {
    updateDailyCard(todayDate, {
      morningCompleted: !dailyCard?.morningCompleted,
    });
  };

  const handleEveningChange = (value: string) => {
    updateDailyCard(todayDate, { eveningReflection: value });
  };

  const handleEveningComplete = () => {
    updateDailyCard(todayDate, {
      eveningCompleted: !dailyCard?.eveningCompleted,
    });
  };

  const handleGratitudeChange = (items: string[]) => {
    updateDailyCard(todayDate, { gratitudeItems: items });
  };

  const handleQuickNotesChange = (value: string) => {
    updateDailyCard(todayDate, { quickNotes: value });
  };

  const isChallengeCompleted = isTodayChallengeCompleted(completedChallenges);
  const weeklyCount = getWeeklyCompletionCount(completedChallenges);

  const handleChallengeComplete = () => {
    setShowChallengeCompletion(true);
  };

  const handleChallengeCompletionSave = (notes?: string) => {
    if (todaysChallenge) {
      completeChallenge(todaysChallenge.id, notes);
      trackAnalyticsEvent("daily_challenge_completed", {
        theme: todaysChallenge.theme,
      });
    }
  };

  const totalActiveStreaks = Object.values(streaks).filter(s => s.current > 0).length;
  const highestStreak = Math.max(...Object.values(streaks).map(s => s.current));

  return (
    <div className="max-w-3xl mx-auto px-6 pb-32 pt-6">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <main id="main-content" role="main" className="space-y-6">
        {/* Hero Section - Sobriety Counter */}
        <section aria-labelledby="sobriety-heading">
          <h1 id="sobriety-heading" className="sr-only">
            Your Clean Time
          </h1>
          {profile?.cleanDate ? (
            <SobrietyCounter
              cleanDate={profile.cleanDate}
              timezone={profile.timezone}
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

        {/* Quick Stats Overview */}
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
              <p className="text-xl sm:text-2xl font-bold">{stepProgress.currentStep}</p>
              <p className="text-xs text-muted-foreground">Current Step</p>
            </div>
          </Card>
        </section>

        {/* Priority Actions - Emergency & AI Sponsor */}
        <section className="space-y-3" aria-label="Priority support">
          <Link href="/emergency">
            <Card className="cursor-pointer border-2 border-destructive/20 hover:border-destructive/40 hover-elevate active-elevate-2">
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
            <Card className="cursor-pointer relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 hover-elevate active-elevate-2">
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
              onComplete={handleChallengeComplete}
            />
          </section>
        )}

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
              onClick={() => setShowQuickJournal(true)}
              data-testid="quick-action-journal"
            >
              <PenLine className="h-5 w-5" />
              <span className="text-xs font-medium">Journal</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-20 flex flex-col gap-1.5 p-2"
              onClick={() => setShowQuickGratitude(true)}
              data-testid="quick-action-gratitude"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-medium">Gratitude</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-20 flex flex-col gap-1.5 p-2 col-span-2 sm:col-span-1"
              onClick={() => setShowQuickMeeting(true)}
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
              onClick={() => setShowRelapseReset(true)}
              data-testid="quick-action-relapse"
            >
              <Undo2 className="h-5 w-5" />
              <span className="text-xs font-medium">Log Slip</span>
            </Button>
          </div>
        </section>

        {/* Current Step Progress */}
        <section aria-labelledby="progress-heading">
          <Link href="/steps">
            <Card className="cursor-pointer hover-elevate active-elevate-2">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <ProgressRing
                    current={stepProgress.answeredQuestions}
                    total={stepProgress.totalQuestions}
                    stepNumber={stepProgress.currentStep}
                    size={80}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">Step {stepProgress.currentStep}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stepProgress.answeredQuestions} of {stepProgress.totalQuestions} questions answered
                    </p>
                    <div className="mt-2">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${stepProgress.totalQuestions > 0 ? (stepProgress.answeredQuestions / stepProgress.totalQuestions) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Streaks - Compact */}
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

        {/* Daily Practice - Collapsible */}
        <section aria-labelledby="daily-practice-heading">
          <h2 id="daily-practice-heading" className="sr-only">Daily Practice</h2>
          <Collapsible open={showDailyPractice} onOpenChange={setShowDailyPractice}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader 
                  className="cursor-pointer hover:bg-accent/50 transition-colors pb-4"
                  data-testid="daily-practice-toggle"
                  aria-expanded={showDailyPractice}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Daily Practice</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Morning, evening, and gratitude reflections
                      </p>
                    </div>
                    {showDailyPractice ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <DailyCard
                    title="Morning Intent"
                    icon={<Sunrise className="h-5 w-5" />}
                    value={dailyCard?.morningIntent || ""}
                    completed={dailyCard?.morningCompleted || false}
                    onChange={handleMorningChange}
                    onComplete={handleMorningComplete}
                    testId="morning-card"
                  />
                  <DailyCard
                    title="Evening Reflection"
                    icon={<Moon className="h-5 w-5" />}
                    value={dailyCard?.eveningReflection || ""}
                    completed={dailyCard?.eveningCompleted || false}
                    onChange={handleEveningChange}
                    onComplete={handleEveningComplete}
                    testId="evening-card"
                  />
                  <GratitudeList
                    items={dailyCard?.gratitudeItems || []}
                    onChange={handleGratitudeChange}
                    testId="gratitude-list"
                  />
                  <QuickNotes
                    value={dailyCard?.quickNotes || ""}
                    onChange={handleQuickNotesChange}
                    testId="quick-notes"
                  />
                  <MeditationTimer testId="meditation-timer" />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </section>

        {/* Resources */}
        <section className="space-y-3" aria-label="Resources">
          <a
            href="https://www.na.org.au/multi/category/na-today-blog/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-daily-inspiration"
          >
            <Card className="cursor-pointer hover-elevate active-elevate-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Daily Fellowship</h3>
                      <p className="text-xs text-muted-foreground">Recovery stories & insights</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          </a>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/journal">
              <Card className="cursor-pointer hover-elevate active-elevate-2" data-testid="button-journal">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <BookMarked className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Journal</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="cursor-pointer hover-elevate active-elevate-2" data-testid="button-analytics">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Analytics</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/achievements">
              <Card className="cursor-pointer hover-elevate active-elevate-2" data-testid="button-achievements">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Achievements</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contacts">
              <Card className="cursor-pointer hover-elevate active-elevate-2">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Contacts</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      {/* Modals */}
      <QuickJournalModal
        open={showQuickJournal}
        onOpenChange={setShowQuickJournal}
      />
      <QuickGratitudeModal
        open={showQuickGratitude}
        onOpenChange={setShowQuickGratitude}
      />
      <QuickMeetingLogModal
        open={showQuickMeeting}
        onOpenChange={setShowQuickMeeting}
      />
      <RelapseResetModal
        open={showRelapseReset}
        onOpenChange={setShowRelapseReset}
      />
      <MilestoneCelebrationModal
        open={!!currentMilestone}
        onOpenChange={(open) => {
          if (!open) handleMilestoneCelebrated();
        }}
        milestone={currentMilestone}
      />
      <ChallengeCompletionModal
        open={showChallengeCompletion}
        onOpenChange={setShowChallengeCompletion}
        onSave={handleChallengeCompletionSave}
      />
    </div>
  );
}
