import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { getTodayDate, calculateSobriety } from '@/lib/time';
import { loadAllSteps } from '@/lib/contentLoader';
import { 
  FileText, 
  BookMarked, 
  AlertCircle, 
  BarChart3,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [, setLocation] = useLocation();
  const profile = useAppStore((state) => state.profile);
  const getDailyCard = useAppStore((state) => state.getDailyCard);
  const updateDailyCard = useAppStore((state) => state.updateDailyCard);
  const getStepAnswers = useAppStore((state) => state.getStepAnswers);

  const [stepQuestionCounts, setStepQuestionCounts] = useState<Map<number, number>>(new Map());

  const todayDate = useMemo(
    () => getTodayDate(profile?.timezone || 'Australia/Melbourne'),
    [profile?.timezone]
  );
  const dailyCard = getDailyCard(todayDate);

  // Load step question counts
  useEffect(() => {
    loadAllSteps().then((allSteps) => {
      const counts = new Map<number, number>();
      allSteps.forEach((content, stepNum) => {
        counts.set(stepNum, content.questions.length);
      });
      setStepQuestionCounts(counts);
    });
  }, []);

  // Calculate sobriety stats
  const daysClean = useMemo(() => {
    if (!profile?.cleanDate) return 0;
    return calculateSobriety(profile.cleanDate).totalDays;
  }, [profile?.cleanDate]);

  const weeksClean = Math.floor(daysClean / 7);
  const monthsClean = Math.floor(daysClean / 30);
  const currentStreak = daysClean; // Streak is same as days clean for now

  // Calculate step progress (matching Steps.tsx logic)
  const { completedSteps, currentStep } = useMemo(() => {
    let completed = 0;
    let firstIncomplete: number | null = null;
    
    for (let i = 1; i <= 12; i++) {
      const answers = getStepAnswers(i);
      const totalQuestions = stepQuestionCounts.get(i) || 0;
      const answeredCount = answers.filter(a => a.answer.trim().length > 0).length;
      const isComplete = totalQuestions > 0 && answeredCount === totalQuestions;
      
      if (isComplete) {
        completed++;
      } else if (firstIncomplete === null) {
        firstIncomplete = i;
      }
    }
    
    // Current step is the first incomplete one, or 12 if all complete
    const current = firstIncomplete !== null ? firstIncomplete : 12;
    
    return { completedSteps: completed, currentStep: current };
  }, [getStepAnswers, stepQuestionCounts]);

  // Check-in completion
  const morningComplete = dailyCard?.morningIntent && dailyCard.morningIntent.trim().length > 0;
  const eveningComplete = dailyCard?.eveningReflection && dailyCard.eveningReflection.trim().length > 0;
  const checkInCount = (morningComplete ? 1 : 0) + (eveningComplete ? 1 : 0);

  const shortcuts = [
    {
      title: 'Step Work',
      description: `Continue Step ${currentStep}`,
      icon: FileText,
      path: '/steps',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Journal',
      description: 'Capture what actually happened today',
      icon: BookMarked,
      path: '/journal',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      title: 'Emergency',
      description: 'Open your support plan instantly',
      icon: AlertCircle,
      path: '/emergency',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
    },
    {
      title: 'Insights',
      description: 'Patterns, triggers, and progress view',
      icon: BarChart3,
      path: '/insights',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
  ];

  return (
    <div className="pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Hero Section - Welcome & Sobriety Counter */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              This space keeps the next right moves visible, not overwhelming.
            </p>
          </div>

          {/* Large Circular Sobriety Counter */}
          <Card className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="flex items-center justify-between w-full max-w-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Clean time
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-green-400">
                    Streak intact
                  </span>
                </div>
              </div>

              {/* Large Circular Progress */}
              <div className="relative" style={{ width: 200, height: 200 }}>
                <svg
                  width={200}
                  height={200}
                  className="transform -rotate-90 drop-shadow-lg"
                >
                  {/* Background circle */}
                  <circle
                    cx={100}
                    cy={100}
                    r={88}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={12}
                    opacity={0.2}
                  />
                  {/* Progress circle */}
                  <circle
                    cx={100}
                    cy={100}
                    r={88}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={12}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - Math.min(1, daysClean / 365))}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold tracking-tight">{daysClean}</div>
                  <div className="text-sm uppercase tracking-wider text-muted-foreground mt-1">
                    Days clean
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground max-w-sm">
                Continuous, from your last reset.
              </p>
            </div>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold">{weeksClean}</div>
            <div className="text-xs text-muted-foreground mt-1">Weeks</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold">{monthsClean}</div>
            <div className="text-xs text-muted-foreground mt-1">Months est.</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold">{currentStreak}</div>
            <div className="text-xs text-muted-foreground mt-1">Day streak</div>
          </Card>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-start gap-2 mb-1">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Current step
                </div>
                <div className="text-2xl font-bold">{currentStep}/12</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tap from nav to pick up where you stopped.
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-2 mb-1">
              <div className="p-1.5 bg-green-400/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(155 70% 50%)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Steps done
                </div>
                <div className="text-2xl font-bold">{completedSteps}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Marked complete with your sponsor.
            </p>
          </Card>
        </div>

        {/* Today Shortcuts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today shortcuts</h2>
            <span className="text-xs text-muted-foreground">Curated from your routine</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((shortcut) => (
              <Card
                key={shortcut.path}
                className="p-4 cursor-pointer hover-elevate active-elevate-2"
                onClick={() => setLocation(shortcut.path)}
                data-testid={`shortcut-${shortcut.title.toLowerCase().replace(' ', '-')}`}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('p-2 rounded-lg', shortcut.bgColor)}>
                    <shortcut.icon className={cn('h-5 w-5', shortcut.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-0.5">{shortcut.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {shortcut.description}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Today Check-in */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today check-in</h2>
            <Badge variant={checkInCount === 2 ? 'default' : 'secondary'}>
              {checkInCount}/2 done
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Morning Intention */}
            <Card
              className={cn(
                'p-4 cursor-pointer hover-elevate active-elevate-2',
                morningComplete && 'border-green-400/50'
              )}
              onClick={() => {
                const intent = prompt('Choose one clear intention for today:');
                if (intent) {
                  updateDailyCard(todayDate, { morningIntent: intent });
                }
              }}
              data-testid="card-morning-intention"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  morningComplete ? 'bg-green-400/10' : 'bg-yellow-400/10'
                )}>
                  <Sun className={cn(
                    'h-5 w-5',
                    morningComplete ? 'text-green-400' : 'text-yellow-400'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-0.5 flex items-center justify-between">
                    Morning intention
                    {morningComplete && (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {morningComplete
                      ? dailyCard.morningIntent
                      : 'Choose one clear intention for today.'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Evening Reflection */}
            <Card
              className={cn(
                'p-4 cursor-pointer hover-elevate active-elevate-2',
                eveningComplete && 'border-purple-400/50'
              )}
              onClick={() => {
                const reflection = prompt('Scan the day without judgement:');
                if (reflection) {
                  updateDailyCard(todayDate, { eveningReflection: reflection });
                }
              }}
              data-testid="card-evening-reflection"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  eveningComplete ? 'bg-purple-400/10' : 'bg-blue-400/10'
                )}>
                  <Moon className={cn(
                    'h-5 w-5',
                    eveningComplete ? 'text-purple-400' : 'text-blue-400'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-0.5 flex items-center justify-between">
                    Evening reflection
                    {eveningComplete && (
                      <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {eveningComplete
                      ? dailyCard.eveningReflection
                      : 'Scan the day without judgement.'}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
