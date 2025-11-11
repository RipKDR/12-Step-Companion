import { useEffect, useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel';
import { useAppStore } from '@/store/useAppStore';
import { checkStreakMilestone, checkSobrietyMilestone } from '@/lib/milestones';
import { checkAchievements } from '@/lib/achievements';
import type { CelebratedMilestone, UnlockedAchievement } from '@/types';
import type { MilestoneData } from '@/components/MilestoneCelebrationModal';
import TodayPanel from '@/components/home-panels/TodayPanel';
import PracticePanel from '@/components/home-panels/PracticePanel';
import RoutinePanel from '@/components/home-panels/RoutinePanel';
import ExplorePanel from '@/components/home-panels/ExplorePanel';
import QuickJournalModal from '@/components/QuickJournalModal';
import QuickGratitudeModal from '@/components/QuickGratitudeModal';
import QuickMeetingLogModal from '@/components/QuickMeetingLogModal';
import RelapseResetModal from '@/components/RelapseResetModal';
import MilestoneCelebrationModal from '@/components/MilestoneCelebrationModal';
import ChallengeCompletionModal from '@/components/ChallengeCompletionModal';

const PANEL_NAMES = ['Today', 'Practice', 'Routine', 'Explore'];

export default function Home() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentPanel, setCurrentPanel] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneData | null>(null);
  const [showQuickJournal, setShowQuickJournal] = useState(false);
  const [showQuickGratitude, setShowQuickGratitude] = useState(false);
  const [showQuickMeeting, setShowQuickMeeting] = useState(false);
  const [showRelapseReset, setShowRelapseReset] = useState(false);
  const [showChallengeCompletion, setShowChallengeCompletion] = useState(false);

  const profile = useAppStore((state) => state.profile);
  const streaks = useAppStore((state) => state.streaks);
  const celebratedMilestones = useAppStore((state) => state.celebratedMilestones);
  const celebrateMilestone = useAppStore((state) => state.celebrateMilestone);
  const unlockAchievement = useAppStore((state) => state.unlockAchievement);
  const awardPoints = useAppStore((state) => state.awardPoints);
  const getStepAnswers = useAppStore((state) => state.getStepAnswers);
  const stepQuestionCounts = useAppStore((state) => state.stepQuestionCounts);
  const stepAnswersState = useAppStore((state) => state.stepAnswers);
  const dailyCard = useAppStore((state) => state.getDailyCard(new Date().toISOString().split('T')[0]));
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);
  const todaysChallenge = useAppStore((state) => state.todaysChallenge);
  const challengeTheme = useAppStore((state) => state.challengeTheme);
  const isTodayChallengeCompleted = useAppStore((state) => state.isTodayChallengeCompleted);
  const completedChallenges = useAppStore((state) => state.completedChallenges);
  const completeChallenge = useAppStore((state) => state.completeChallenge);
  const getWeeklyCompletionCount = useAppStore((state) => state.getWeeklyCompletionCount);
  const trackAnalyticsEvent = useAppStore((state) => state.trackAnalyticsEvent);

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on('select', () => {
      setCurrentPanel(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Check for sobriety milestones
  useEffect(() => {
    if (profile?.cleanDate && !currentMilestone) {
      const sobrietyMilestone = checkSobrietyMilestone(
        profile.cleanDate,
        celebratedMilestones
      );
      if (sobrietyMilestone) {
        setCurrentMilestone(sobrietyMilestone);
        return;
      }
    }

    // Check for streak milestones
    if (!currentMilestone) {
      for (const [streakType, streak] of Object.entries(streaks) as [keyof typeof streaks, typeof streaks[keyof typeof streaks]][]) {
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

  const totalActiveStreaks = Object.values(streaks).filter(s => s.current > 0).length;
  const highestStreak = Math.max(...Object.values(streaks).map(s => s.current));

  return (
    <div className="h-screen flex flex-col pb-8 sm:pb-12">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Panel indicator */}
      <div className="flex items-center justify-center gap-2 py-4 px-6">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Home panels">
          {PANEL_NAMES.map((name, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={currentPanel === index}
              aria-label={`${name} panel`}
              onClick={() => carouselApi?.scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentPanel === index
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              data-testid={`panel-indicator-${index}`}
            />
          ))}
        </div>
      </div>

      {/* Panel name */}
      <div className="text-center pb-4">
        <h1 className="text-sm font-medium text-muted-foreground">
          {PANEL_NAMES[currentPanel]}
        </h1>
      </div>

      {/* Carousel */}
      <main 
        id="main-content" 
        role="main" 
        className="flex-1 overflow-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        <Carousel
          setApi={setCarouselApi}
          className="h-full"
          opts={{
            align: "start",
            loop: false,
            skipSnaps: false,
            duration: 30,
          }}
        >
          <CarouselContent className="h-full">
            <CarouselItem className="h-full">
              <div className="h-full overflow-y-auto pb-8 pt-2">
                <TodayPanel
                  profile={profile}
                  totalActiveStreaks={totalActiveStreaks}
                  highestStreak={highestStreak}
                  currentStep={stepProgress.currentStep}
                  todaysChallenge={todaysChallenge}
                  challengeTheme={challengeTheme}
                  isChallengeCompleted={isChallengeCompleted}
                  weeklyCount={weeklyCount}
                  onChallengeComplete={handleChallengeComplete}
                />
              </div>
            </CarouselItem>

            <CarouselItem className="h-full">
              <div className="h-full overflow-y-auto pb-8 pt-2">
                <PracticePanel
                  streaks={streaks}
                  onQuickJournal={() => setShowQuickJournal(true)}
                  onQuickGratitude={() => setShowQuickGratitude(true)}
                  onQuickMeeting={() => setShowQuickMeeting(true)}
                  onRelapseReset={() => setShowRelapseReset(true)}
                />
              </div>
            </CarouselItem>

            <CarouselItem className="h-full">
              <div className="h-full overflow-y-auto pb-8 pt-2">
                <RoutinePanel
                  dailyCard={dailyCard || null}
                  stepProgress={stepProgress}
                  onMorningChange={handleMorningChange}
                  onMorningComplete={handleMorningComplete}
                  onEveningChange={handleEveningChange}
                  onEveningComplete={handleEveningComplete}
                  onGratitudeChange={handleGratitudeChange}
                  onQuickNotesChange={handleQuickNotesChange}
                />
              </div>
            </CarouselItem>

            <CarouselItem className="h-full">
              <div className="h-full overflow-y-auto pb-8 pt-2">
                <ExplorePanel />
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </main>

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
