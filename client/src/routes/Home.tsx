import { useMemo, useState, useEffect } from 'react';
import SobrietyCounter from '@/components/SobrietyCounter';
import DailyCard from '@/components/DailyCard';
import GratitudeList from '@/components/GratitudeList';
import QuickNotes from '@/components/QuickNotes';
import MeditationTimer from '@/components/MeditationTimer';
import DailyAffirmation from '@/components/DailyAffirmation';
import DailyQuote from '@/components/DailyQuote';
import ProgressRing from '@/components/ProgressRing';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sunrise, Moon, BookOpen, BookMarked, Phone, Sparkles, ExternalLink, TrendingUp, Users } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto px-6 pb-32 pt-8">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <main id="main-content" role="main" className="space-y-16">
        {/* Sobriety Counter */}
        <section aria-labelledby="sobriety-heading">
          <h1 id="sobriety-heading" className="sr-only">Your Clean Time</h1>
          {profile?.cleanDate ? (
            <SobrietyCounter cleanDate={profile.cleanDate} timezone={profile.timezone} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Complete onboarding to start tracking your clean time</p>
            </div>
          )}
        </section>

        {/* Daily Affirmation */}
        <section aria-labelledby="affirmation-heading">
          <h2 id="affirmation-heading" className="sr-only">Daily Affirmation</h2>
          <DailyAffirmation date={new Date()} />
        </section>

        {/* Daily Recovery Quote */}
        <section aria-labelledby="quote-heading">
          <h2 id="quote-heading" className="sr-only">Daily Recovery Quote</h2>
          <DailyQuote />
        </section>

        <Separator className="my-8" />

        {/* Progress Ring */}
        <section className="flex justify-center py-8" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="sr-only">Current Step Progress</h2>
          <ProgressRing 
            current={stepProgress.answeredQuestions} 
            total={stepProgress.totalQuestions} 
            stepNumber={stepProgress.currentStep} 
          />
        </section>

        <Separator className="my-8" />

        {/* Daily Cards */}
        <section className="space-y-6" aria-labelledby="daily-heading">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1">
              <h2 id="daily-heading" className="text-3xl font-bold">Daily Practice</h2>
              <p className="text-base text-muted-foreground mt-2">
                Complete your daily reflections and gratitude
              </p>
            </div>
          </div>
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
          
          <a 
            href="https://www.na.org.au/multi/category/na-today-blog/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
            data-testid="link-daily-inspiration"
          >
            <Card className="hover-elevate active-elevate-2 cursor-pointer bg-gradient-to-br from-primary/5 to-transparent border-primary/20 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">Daily Fellowship Reading</CardTitle>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Read recovery stories and insights from members across Australia
                </p>
              </CardContent>
            </Card>
          </a>
        </section>

        <Separator className="my-8" />

        {/* Quick Actions */}
        <section className="space-y-6" aria-labelledby="actions-heading">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1">
              <h2 id="actions-heading" className="text-3xl font-bold">Quick Actions</h2>
              <p className="text-base text-muted-foreground mt-2">
                Continue your recovery journey
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Link 
              href="/steps"
              className={cn(buttonVariants({ variant: "outline" }), "w-full h-16 justify-start gap-4 text-base")}
              data-testid="button-step-work"
            >
              <BookOpen className="h-5 w-5" />
              Continue Step Work
            </Link>
            <Link 
              href="/journal"
              className={cn(buttonVariants({ variant: "outline" }), "w-full h-16 justify-start gap-4 text-base")}
              data-testid="button-journal"
            >
              <BookMarked className="h-5 w-5" />
              New Journal Entry
            </Link>
            <Link 
              href="/analytics"
              className={cn(buttonVariants({ variant: "outline" }), "w-full h-16 justify-start gap-4 text-base")}
              data-testid="button-analytics"
            >
              <TrendingUp className="h-5 w-5" />
              Mood Analytics
            </Link>
            <Link 
              href="/contacts"
              className={cn(buttonVariants({ variant: "outline" }), "w-full h-16 justify-start gap-4 text-base")}
              data-testid="button-contacts"
            >
              <Users className="h-5 w-5" />
              Fellowship Contacts
            </Link>
            <Link 
              href="/emergency"
              className={cn(buttonVariants({ variant: "destructive" }), "w-full h-16 justify-start gap-4 text-base")}
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
