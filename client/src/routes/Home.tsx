import { useMemo } from 'react';
import SobrietyCounter from '@/components/SobrietyCounter';
import DailyCard from '@/components/DailyCard';
import ProgressRing from '@/components/ProgressRing';
import { Button } from '@/components/ui/button';
import { Sunrise, Moon, BookOpen, BookMarked, Phone } from 'lucide-react';
import { Link } from 'wouter';
import { useAppStore } from '@/store/useAppStore';
import { getTodayDate } from '@/lib/time';

export default function Home() {
  const profile = useAppStore((state) => state.profile);
  const getDailyCard = useAppStore((state) => state.getDailyCard);
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);
  const getStepAnswers = useAppStore((state) => state.getStepAnswers);

  const todayDate = useMemo(() => getTodayDate(profile?.timezone || 'Australia/Melbourne'), [profile?.timezone]);
  const dailyCard = getDailyCard(todayDate);

  const stepProgress = useMemo(() => {
    const totalSteps = 12;
    let currentStep = 1;
    let currentStepAnswers = 0;
    
    for (let step = 1; step <= totalSteps; step++) {
      const answers = getStepAnswers(step);
      if (answers.length === 0) {
        currentStep = step;
        break;
      }
      currentStep = step;
      currentStepAnswers = answers.length;
    }
    
    return {
      currentStep,
      answeredQuestions: currentStepAnswers,
      totalQuestions: 10,
    };
  }, [getStepAnswers]);

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
        </section>

        {/* Quick Actions */}
        <section className="space-y-3" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/steps">
              <Button
                variant="outline"
                className="w-full h-14 justify-start gap-3 text-base"
                data-testid="button-step-work"
                asChild
              >
                <a>
                  <BookOpen className="h-5 w-5" />
                  Continue Step Work
                </a>
              </Button>
            </Link>
            <Link href="/journal">
              <Button
                variant="outline"
                className="w-full h-14 justify-start gap-3 text-base"
                data-testid="button-journal"
                asChild
              >
                <a>
                  <BookMarked className="h-5 w-5" />
                  New Journal Entry
                </a>
              </Button>
            </Link>
            <Link href="/emergency">
              <Button
                variant="destructive"
                className="w-full h-14 justify-start gap-3 text-base"
                data-testid="button-emergency"
                asChild
              >
                <a>
                  <Phone className="h-5 w-5" />
                  Emergency Help
                </a>
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
