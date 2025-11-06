import { useMemo, useState, useEffect } from 'react';
import SobrietyCounter from '@/components/SobrietyCounter';
import DailyCard from '@/components/DailyCard';
import GratitudeList from '@/components/GratitudeList';
import QuickNotes from '@/components/QuickNotes';
import MeditationTimer from '@/components/MeditationTimer';
import DailyAffirmation from '@/components/DailyAffirmation';
import ProgressRing from '@/components/ProgressRing';
import { buttonVariants } from '@/components/ui/button';
import { Sunrise, Moon, BookOpen, BookMarked, Phone } from 'lucide-react';
import { Link } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { getTodayDate } from '@/lib/time';
import { loadAllSteps } from '@/lib/contentLoader';
import { cn } from '@/lib/utils';

export default function Home() {
  const profile = useAppStore((state) => state.profile);
  const getDailyCard = useAppStore((state) => state.getDailyCard);
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);
  const getStepAnswers = useAppStore((state) => state.getStepAnswers);
  const stepAnswersState = useAppStore((state) => state.stepAnswers);
  
  const [stepQuestionCounts, setStepQuestionCounts] = useState<Map<number, number>>(new Map());

  const todayDate = useMemo(() => getTodayDate(profile?.timezone || 'Australia/Melbourne'), [profile?.timezone]);
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

  const stepProgress = useMemo(() => {
    const totalSteps = 12;
    let currentStep = 1;
    let currentStepAnswers = 0;
    let currentStepTotalQuestions = 0;
    
    for (let step = 1; step <= totalSteps; step++) {
      const answers = getStepAnswers(step);
      const totalQuestions = stepQuestionCounts.get(step) || 0;
      const completedAnswers = answers.filter(a => a.answer.trim()).length;
      
      if (completedAnswers < totalQuestions) {
        currentStep = step;
        currentStepAnswers = completedAnswers;
        currentStepTotalQuestions = totalQuestions;
        break;
      }
      
      // This step is complete, move to next
      currentStep = step + 1;
      currentStepAnswers = 0;
      currentStepTotalQuestions = stepQuestionCounts.get(step + 1) || 0;
    }
    
    // If we've gone past step 12, stay on step 12
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
    updateDailyCard(todayDate, { morningCompleted: !dailyCard?.morningCompleted });
  };

  const handleEveningChange = (value: string) => {
    updateDailyCard(todayDate, { eveningReflection: value });
  };

  const handleEveningComplete = () => {
    updateDailyCard(todayDate, { eveningCompleted: !dailyCard?.eveningCompleted });
  };

  const handleGratitudeChange = (items: string[]) => {
    updateDailyCard(todayDate, { gratitudeItems: items });
  };

  const handleQuickNotesChange = (value: string) => {
    updateDailyCard(todayDate, { quickNotes: value });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-8">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <main id="main-content" role="main">
        {/* Sobriety Counter */}
        <section aria-labelledby="sobriety-heading">
          <h1 id="sobriety-heading" className="sr-only">Your Clean Time</h1>
          {profile?.cleanDate ? (
            <SobrietyCounter cleanDate={profile.cleanDate} timezone={profile.timezone} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Complete onboarding to start tracking your clean time</p>
            </div>
          )}
        </section>

        {/* Daily Affirmation */}
        <section aria-labelledby="affirmation-heading" className="py-6">
          <h2 id="affirmation-heading" className="sr-only">Daily Affirmation</h2>
          <DailyAffirmation date={new Date()} />
        </section>

        {/* Progress Ring */}
        <section className="flex justify-center py-6" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="sr-only">Current Step Progress</h2>
          <ProgressRing 
            current={stepProgress.answeredQuestions} 
            total={stepProgress.totalQuestions} 
            stepNumber={stepProgress.currentStep} 
          />
        </section>

        {/* Daily Cards */}
        <section className="space-y-4" aria-labelledby="daily-heading">
          <h2 id="daily-heading" className="text-xl font-semibold mb-4">Daily Practice</h2>
          <DailyCard
            title="Morning Intent"
            icon={<Sunrise className="h-5 w-5" />}
            value={dailyCard?.morningIntent || ''}
            completed={dailyCard?.morningCompleted || false}
            onChange={handleMorningChange}
            onComplete={handleMorningComplete}
            testId="morning-card"
          />
          <DailyCard
            title="Evening Reflection"
            icon={<Moon className="h-5 w-5" />}
            value={dailyCard?.eveningReflection || ''}
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
            value={dailyCard?.quickNotes || ''}
            onChange={handleQuickNotesChange}
            testId="quick-notes"
          />
          <MeditationTimer testId="meditation-timer" />
        </section>

        {/* Quick Actions */}
        <section className="space-y-3" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link 
              href="/steps"
              className={cn(buttonVariants({ variant: "outline" }), "w-full h-14 justify-start gap-3 text-base")}
              data-testid="button-step-work"
            >
              <BookOpen className="h-5 w-5" />
              Continue Step Work
            </Link>
            <Link 
              href="/journal"
              className={cn(buttonVariants({ variant: "outline" }), "w-full h-14 justify-start gap-3 text-base")}
              data-testid="button-journal"
            >
              <BookMarked className="h-5 w-5" />
              New Journal Entry
            </Link>
            <Link 
              href="/emergency"
              className={cn(buttonVariants({ variant: "destructive" }), "w-full h-14 justify-start gap-3 text-base")}
              data-testid="button-emergency"
            >
              <Phone className="h-5 w-5" />
              Emergency Help
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
