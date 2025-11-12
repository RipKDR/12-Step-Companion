import { useMemo, useState, useEffect, useCallback } from "react";
import SobrietyCounter from "@/components/SobrietyCounter";
import { EnhancedSobrietyCounter } from "@/components/EnhancedSobrietyCounter";
import StepProgressCards from "@/components/StepProgressCards";
import TodayShortcuts from "@/components/TodayShortcuts";
import TodayCheckIn from "@/components/TodayCheckIn";
import QuickJournalModal from "@/components/QuickJournalModal";
import QuickGratitudeModal from "@/components/QuickGratitudeModal";
import QuickMeetingLogModal from "@/components/QuickMeetingLogModal";
import RelapseResetModal from "@/components/RelapseResetModal";
import MilestoneCelebrationModal, {
  type MilestoneData,
} from "@/components/MilestoneCelebrationModal";
import ChallengeCompletionModal from "@/components/ChallengeCompletionModal";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Sparkles, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getTodayDate } from "@/lib/time";
import { loadAllSteps } from "@/lib/contentLoader";
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

  const handleMorningChange = useCallback((value: string) => {
    updateDailyCard(todayDate, { morningIntent: value });
  }, [todayDate, updateDailyCard]);

  const handleMorningComplete = useCallback(() => {
    updateDailyCard(todayDate, {
      morningCompleted: !dailyCard?.morningCompleted,
    });
  }, [todayDate, dailyCard?.morningCompleted, updateDailyCard]);

  const handleEveningChange = useCallback((value: string) => {
    updateDailyCard(todayDate, { eveningReflection: value });
  }, [todayDate, updateDailyCard]);

  const handleEveningComplete = useCallback(() => {
    updateDailyCard(todayDate, {
      eveningCompleted: !dailyCard?.eveningCompleted,
    });
  }, [todayDate, dailyCard?.eveningCompleted, updateDailyCard]);

  const handleGratitudeChange = useCallback((items: string[]) => {
    updateDailyCard(todayDate, { gratitudeItems: items });
  }, [todayDate, updateDailyCard]);

  const handleQuickNotesChange = useCallback((value: string) => {
    updateDailyCard(todayDate, { quickNotes: value });
  }, [todayDate, updateDailyCard]);

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

  // Calculate steps done (completed steps)
  const stepsDone = useMemo(() => {
    let completed = 0;
    for (let step = 1; step <= 12; step++) {
      const answers = getStepAnswers(step);
      const totalQuestions = stepQuestionCounts.get(step) || 0;
      const completedAnswers = answers.filter((a) => a.answer.trim()).length;
      if (totalQuestions > 0 && completedAnswers === totalQuestions) {
        completed++;
      }
    }
    return completed;
  }, [getStepAnswers, stepQuestionCounts, stepAnswersState]);

  const handleMorningClick = useCallback(() => {
    // Navigate to routine or open morning modal
    updateDailyCard(todayDate, { morningCompleted: !dailyCard?.morningCompleted });
  }, [todayDate, dailyCard?.morningCompleted, updateDailyCard]);

  const handleEveningClick = useCallback(() => {
    // Navigate to routine or open evening modal
    updateDailyCard(todayDate, { eveningCompleted: !dailyCard?.eveningCompleted });
  }, [todayDate, dailyCard?.eveningCompleted, updateDailyCard]);

  return (
    <div className="min-h-screen pb-24">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Main Content - Single Scroll Layout */}
      <PullToRefresh
        onRefresh={async () => {
          checkAllStreaks();
          await new Promise(resolve => setTimeout(resolve, 500));
        }}
      >
        <main 
          id="main-content" 
          role="main" 
          className="max-w-2xl mx-auto px-6 py-8 space-y-6"
          aria-live="polite"
          aria-atomic="true"
        >
        {/* Welcome Section */}
        <section className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">
              This space keeps the next right moves visible, not overwhelming.
            </p>
          </div>
        </section>

        {/* Clean Time Summary */}
        {profile?.cleanDate && (
          <section aria-labelledby="sobriety-heading">
            <h2 id="sobriety-heading" className="sr-only">
              Your Clean Time
            </h2>
            <EnhancedSobrietyCounter
              cleanDate={profile.cleanDate}
              timezone={profile.timezone}
              showProgress={true}
              nextMilestone={30}
            />
          </section>
        )}

        {/* Step Progress */}
        <section aria-labelledby="step-progress-heading">
          <h2 id="step-progress-heading" className="sr-only">
            Step Progress
          </h2>
          <StepProgressCards
            currentStep={stepProgress.currentStep}
            totalSteps={12}
            stepsDone={stepsDone}
          />
        </section>

        {/* Today Shortcuts */}
        <section aria-labelledby="shortcuts-heading">
          <h2 id="shortcuts-heading" className="sr-only">
            Today Shortcuts
          </h2>
          <TodayShortcuts currentStep={stepProgress.currentStep} />
        </section>

        {/* Today Check-in */}
        <CollapsibleSection
          title="Today's Check-in"
          defaultOpen={true}
          icon={<Sparkles className="h-4 w-4" />}
        >
          <TodayCheckIn
            morningCompleted={dailyCard?.morningCompleted || false}
            eveningCompleted={dailyCard?.eveningCompleted || false}
            onMorningClick={handleMorningClick}
            onEveningClick={handleEveningClick}
          />
        </CollapsibleSection>
        </main>
      </PullToRefresh>

      {/* Modals - Globally mounted */}
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
