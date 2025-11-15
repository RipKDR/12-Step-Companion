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
import { SceneQuickAccess } from "@/components/recovery-scenes/SceneQuickAccess";
import MorningIntentionCard from "@/components/recovery-rhythm/MorningIntentionCard";
import MiddayPulseCheck from "@/components/recovery-rhythm/MiddayPulseCheck";
import EveningInventoryCard from "@/components/recovery-rhythm/EveningInventoryCard";
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
  DailyCard,
} from "@/types";
import ShareBadge from '@/components/sponsor-connection/ShareBadge';
import RiskSignalCard from '@/components/jitai/RiskSignalCard';
import InterventionSuggestions from '@/components/jitai/InterventionSuggestions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Navigation } from 'lucide-react';
import { useLocation } from 'wouter';
import type { Meeting } from '@/types';
import { formatDistance } from '@/lib/location';

export default function Home() {
  const profile = useAppStore((state) => state.profile);
  const getDailyCard = useAppStore((state) => state.getDailyCard);
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);
  const setMorningIntention = useAppStore((state) => state.setMorningIntention);
  const setMiddayPulseCheck = useAppStore((state) => state.setMiddayPulseCheck);
  const setEveningInventory = useAppStore((state) => state.setEveningInventory);
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
  const detectRiskSignals = useAppStore((state) => state.detectRiskSignals);
  const dismissRiskSignal = useAppStore((state) => state.dismissRiskSignal);
  const riskSignalsRaw = useAppStore((state) => state.riskSignals);
  const riskSignals = useMemo(() => {
    const signals = riskSignalsRaw || {};
    return Object.values(signals).filter((s) => !s.dismissedAtISO);
  }, [riskSignalsRaw]);
  const meetingCache = useAppStore((state) => state.meetingCache);
  const getFavoriteMeetings = useAppStore((state) => state.getFavoriteMeetings);
  const getMeetingsWithReminders = useAppStore((state) => state.getMeetingsWithReminders);
  const [, setLocation] = useLocation();

  const [stepQuestionCounts, setStepQuestionCounts] = useState<
    Map<number, number>
  >(new Map());
  const [showInterventionSuggestions, setShowInterventionSuggestions] = useState(false);
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

  // Check for risk signals on mount and after daily card updates
  useEffect(() => {
    const signals = detectRiskSignals();
    // Show intervention suggestions if high-risk signals detected
    const highRiskSignals = signals.filter((s) => s.severity >= 70);
    if (highRiskSignals.length > 0) {
      setShowInterventionSuggestions(true);
    }
  }, [detectRiskSignals, dailyCard?.updatedAtISO]);

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

  // Recovery Rhythm handlers
  const handleMorningIntention = useCallback((intention: DailyCard['morningIntention'], custom?: string, reminder?: string) => {
    setMorningIntention(todayDate, intention, custom, reminder);
  }, [todayDate, setMorningIntention]);

  const handleMiddayPulseCheck = useCallback((mood: number, craving: number, context: string[]) => {
    setMiddayPulseCheck(todayDate, mood, craving, context);
  }, [todayDate, setMiddayPulseCheck]);

  const handleEveningInventory = useCallback((stayedClean: DailyCard['eveningStayedClean'], stayedConnected: DailyCard['eveningStayedConnected'], gratitude?: string, improvement?: string) => {
    setEveningInventory(todayDate, stayedClean, stayedConnected, gratitude, improvement);
  }, [todayDate, setEveningInventory]);

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

  // Get meetings starting soon (next 60 minutes)
  const meetingsStartingSoon = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    const oneHourLater = currentTime + 60;

    // Combine meetings from cache and favorites
    const allMeetings: Meeting[] = [];
    if (meetingCache) {
      allMeetings.push(...meetingCache.meetings);
    }
    const favorites = getFavoriteMeetings();
    favorites.forEach(fav => {
      if (!allMeetings.find(m => m.id === fav.id)) {
        allMeetings.push(fav);
      }
    });

    return allMeetings.filter(meeting => {
      if (meeting.dayOfWeek !== currentDay) return false;
      const [hours, minutes] = meeting.time.split(':').map(Number);
      const meetingTime = hours * 60 + minutes;
      return meetingTime >= currentTime && meetingTime <= oneHourLater;
    }).sort((a, b) => {
      const [aHours, aMins] = a.time.split(':').map(Number);
      const [bHours, bMins] = b.time.split(':').map(Number);
      const aTime = aHours * 60 + aMins;
      const bTime = bHours * 60 + bMins;
      return aTime - bTime;
    });
  }, [meetingCache, getFavoriteMeetings]);

  // Get next meeting reminder
  const nextReminder = useMemo<{ meeting: Meeting; minutesUntil: number } | null>(() => {
    const meetingsWithReminders = getMeetingsWithReminders();
    if (meetingsWithReminders.length === 0) return null;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let next: Meeting | null = null;
    let minMinutesUntil = Infinity;

    meetingsWithReminders.forEach(meeting => {
      if (!meeting.reminderEnabled) return;

      const [hours, minutes] = meeting.time.split(':').map(Number);
      const meetingTime = hours * 60 + minutes;
      const reminderTime = meetingTime - meeting.reminderMinutesBefore;

      let daysUntil = (meeting.dayOfWeek - currentDay + 7) % 7;
      if (daysUntil === 0 && reminderTime <= currentTime) {
        daysUntil = 7;
      }

      const minutesUntil = daysUntil * 24 * 60 + reminderTime - currentTime;

      if (minutesUntil >= 0 && minutesUntil < minMinutesUntil) {
        minMinutesUntil = minutesUntil;
        next = meeting;
      }
    });

    return next ? { meeting: next, minutesUntil: minMinutesUntil } : null;
  }, [getMeetingsWithReminders]);

  const formatMeetingTime = (meeting: Meeting): string => {
    const [hours, minutes] = meeting.time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
        {/* Risk Signals */}
        {riskSignals.length > 0 && (
          <div className="space-y-3">
            {riskSignals.map((signal) => (
              <RiskSignalCard
                key={signal.id}
                signal={signal}
                onDismiss={() => dismissRiskSignal(signal.id)}
              />
            ))}
          </div>
        )}

        {/* Welcome Section */}
        <section className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
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

        {/* Meetings Starting Soon */}
        {meetingsStartingSoon.length > 0 && (
          <section aria-labelledby="meetings-soon-heading">
            <h2 id="meetings-soon-heading" className="sr-only">
              Meetings Starting Soon
            </h2>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Meetings Starting Soon
                    </CardTitle>
                    <CardDescription>
                      {meetingsStartingSoon.length} meeting{meetingsStartingSoon.length !== 1 ? 's' : ''} in the next hour
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{meetingsStartingSoon.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {meetingsStartingSoon.slice(0, 3).map((meeting) => {
                  const [hours, minutes] = meeting.time.split(':').map(Number);
                  const now = new Date();
                  const meetingTime = new Date(now);
                  meetingTime.setHours(hours, minutes, 0, 0);
                  const minutesUntil = Math.max(0, Math.floor((meetingTime.getTime() - now.getTime()) / 60000));

                  return (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => setLocation('/meetings?tab=finder')}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{meeting.program}</Badge>
                          <span className="font-medium text-sm">{meeting.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatMeetingTime(meeting)} • {minutesUntil === 0 ? 'Starting now' : `in ${minutesUntil} min`}
                          {meeting.location && meeting.distanceKm && (
                            <span> • {formatDistance(meeting.distanceKm)}</span>
                          )}
                        </div>
                      </div>
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                    </div>
                  );
                })}
                {meetingsStartingSoon.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setLocation('/meetings?tab=finder')}
                  >
                    View all ({meetingsStartingSoon.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Next Meeting Reminder */}
        {nextReminder && (
          <section aria-labelledby="next-reminder-heading">
            <h2 id="next-reminder-heading" className="sr-only">
              Next Meeting Reminder
            </h2>
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Next Reminder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{nextReminder.meeting.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Reminder in {Math.floor(nextReminder.minutesUntil / 60)}h {nextReminder.minutesUntil % 60}m
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/meetings?tab=reminders')}
                    className="w-full"
                  >
                    Manage Reminders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Recovery Rhythm */}
        <CollapsibleSection
          title="Recovery Rhythm"
          defaultOpen={true}
          icon={<Sparkles className="h-4 w-4" />}
          action={dailyCard && (
            <ShareBadge
              itemType="daily-entry"
              itemId={todayDate}
              size="sm"
            />
          )}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Three quick check-ins to build your daily recovery habit
            </p>
            <MorningIntentionCard
              date={todayDate}
              dailyCard={dailyCard || undefined}
              onComplete={handleMorningIntention}
            />
            <MiddayPulseCheck
              date={todayDate}
              dailyCard={dailyCard || undefined}
              onComplete={handleMiddayPulseCheck}
            />
            <EveningInventoryCard
              date={todayDate}
              dailyCard={dailyCard || undefined}
              onComplete={handleEveningInventory}
            />
            
            {/* Show streak if complete rhythm exists */}
            {streaks.recoveryRhythm.current > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {streaks.recoveryRhythm.current} day{streaks.recoveryRhythm.current !== 1 ? 's' : ''} of complete rhythm
                  </span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Today Check-in (Legacy) */}
        <CollapsibleSection
          title="Today's Check-in"
          defaultOpen={false}
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

      <InterventionSuggestions
        signals={riskSignals}
        open={showInterventionSuggestions}
        onOpenChange={setShowInterventionSuggestions}
      />
      
      {/* Recovery Scenes Quick Access */}
      <SceneQuickAccess variant="fab" />
    </div>
  );
}
