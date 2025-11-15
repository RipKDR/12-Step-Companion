import { useState, useMemo, useEffect } from 'react';
import StepSelector from '@/components/StepSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Download, ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { exportStepAnswers } from '@/lib/export';
import { loadStepContent, loadAllSteps } from '@/lib/contentLoader';
import type { StepContent } from '@/types';
import { PullToRefresh } from '@/components/PullToRefresh';
import { EmptyStepsState } from '@/components/EmptyState';
import { StepCardSkeletonList } from '@/components/StepCardSkeleton';
import { InlineEditor } from '@/components/InlineEditor';
import { haptics } from '@/lib/haptics';
import ShareBadge from '@/components/sponsor-connection/ShareBadge';
import { useLocation } from 'wouter';

export default function Steps() {
  const [, setLocation] = useLocation();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [stepContent, setStepContent] = useState<StepContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stepQuestionCounts, setStepQuestionCounts] = useState<Map<number, number>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const saveStepAnswer = useAppStore((state) => state.saveStepAnswer);
  const getStepAnswers = useAppStore((state) => state.getStepAnswers);
  // Subscribe to the actual stepAnswers state so component re-renders when it changes
  const stepAnswersState = useAppStore((state) => state.stepAnswers);

  // Preload all step contents on mount to get question counts
  useEffect(() => {
    loadAllSteps().then((allSteps) => {
      const counts = new Map<number, number>();
      allSteps.forEach((content, stepNum) => {
        counts.set(stepNum, content.questions.length);
      });
      setStepQuestionCounts(counts);
    });
  }, []);

  // Load step content when selected
  useEffect(() => {
    if (selectedStep !== null) {
      setIsLoading(true);
      loadStepContent(selectedStep)
        .then((content) => {
          setStepContent(content);
          setIsLoading(false);
          
          // Find first unanswered question or start at beginning
          if (content) {
            const answers = getStepAnswers(selectedStep);
            const firstUnanswered = content.questions.findIndex((q) => {
              const answer = answers.find(a => a.questionId === q.id);
              return !answer || !answer.answer.trim();
            });
            setCurrentQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setStepContent(null);
      setCurrentQuestionIndex(0);
    }
  }, [selectedStep, getStepAnswers]);

  const steps = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const stepNumber = i + 1;
      const answers = getStepAnswers(stepNumber);
      const totalQuestions = stepQuestionCounts.get(stepNumber) || 0;
      const completed = answers.filter(a => a.answer.trim()).length;
      
      // Default step titles matching prototype style
      const stepTitles: Record<number, string> = {
        1: "We admitted we were powerless",
        2: "Came to believe in a Power greater",
        3: "Made a decision to turn our will",
        4: "Made a searching and fearless inventory",
        5: "Admitted to God, to ourselves, and to another",
        6: "Were entirely ready to have God remove",
        7: "Humbly asked Him to remove our shortcomings",
        8: "Made a list of all persons we had harmed",
        9: "Made direct amends to such people",
        10: "Continued to take personal inventory",
        11: "Sought through prayer and meditation",
        12: "Having had a spiritual awakening",
      };
      
      return {
        number: stepNumber,
        title: stepTitles[stepNumber] || `Step ${stepNumber}`,
        completed: totalQuestions > 0 && completed === totalQuestions,
        progress: totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0,
      };
    });
  }, [getStepAnswers, stepQuestionCounts, stepAnswersState]);

  const handleAnswerChange = (questionId: string, value: string) => {
    if (selectedStep) {
      // Optimistic update - save immediately
      saveStepAnswer({
        questionId,
        stepNumber: selectedStep,
        answer: value,
        updatedAtISO: new Date().toISOString(),
      });
      haptics.light();
    }
  };

  const handleExport = () => {
    if (selectedStep) {
      const answers = getStepAnswers(selectedStep);
      exportStepAnswers(selectedStep, answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (stepContent && currentQuestionIndex < stepContent.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const currentStepNumber = steps.find(s => !s.completed)?.number || 1;
  const currentStepData = steps.find(s => s.number === currentStepNumber);

  if (selectedStep === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 pb-8 sm:pb-12 pt-6">
        <header className="space-y-4 mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Step Work
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Work through the 12 steps at your own pace with your sponsor.
              </p>
            </div>
          </div>
        </header>

        {/* Currently Working On Card */}
        {currentStepData && (
          <Card className="mb-6 bg-card-gradient-strong glow-card border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  CURRENTLY WORKING ON
                </span>
                <Badge variant="current" className="text-xs">
                  In Progress
                </Badge>
              </div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Step {currentStepNumber}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {currentStepData.title}
                </p>
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={() => setSelectedStep(currentStepNumber)}
              >
                Continue Working
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        <StepSelector
          steps={steps}
          onSelect={setSelectedStep}
          currentStep={currentStepNumber}
        />
      </div>
    );
  }

  const currentAnswers = getStepAnswers(selectedStep);
  
  // Calculate actual completion based on answered questions
  const completedCount = currentAnswers.filter(a => a.answer.trim()).length;
  const totalCount = stepContent?.questions.length || 0;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 pb-8 sm:pb-12 pt-6">
      <header className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedStep(null)}
          data-testid="button-back"
          aria-label="Back to step list"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {stepContent?.title || `Step ${selectedStep}`}
          </h1>
          {stepContent?.subtitle && (
            <p className="text-sm text-muted-foreground mt-1.5">{stepContent.subtitle}</p>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40 mb-3" />
              <Skeleton className="h-7 w-full" />
            </CardHeader>
          </Card>
          <div className="space-y-6">
            <Skeleton className="h-3 w-full" />
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-7 w-3/4 mb-3" />
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!isLoading && !stepContent && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-base">Step content not available. Please import step questions in Settings.</p>
        </div>
      )}

      {!isLoading && stepContent && stepContent.questions.length > 0 && (
        <div className="space-y-8">
          {stepContent.overviewLabels && stepContent.overviewLabels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {stepContent.overviewLabels.map((label) => (
                    <span
                      key={label}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-medium">
                    Question {currentQuestionIndex + 1} of {stepContent.questions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {completedCount} answered • {completionPercentage}% complete
                  </p>
                </div>
                <Progress 
                  value={completionPercentage} 
                  className="h-3"
                />
              </div>
            </div>

            {(() => {
              const question = stepContent.questions[currentQuestionIndex];
              const existingAnswer = currentAnswers.find(a => a.questionId === question.id);
              
              return (
                <Card key={question.id} data-testid={`question-${question.id}`} role="article" aria-labelledby={`question-title-${question.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {question.section && (
                          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2" aria-label="Section">
                            {question.section}
                          </p>
                        )}
                        <CardTitle className="text-lg leading-relaxed" id={`question-title-${question.id}`}>
                          {question.prompt}
                        </CardTitle>
                      </div>
                      {existingAnswer?.answer && (
                        <ShareBadge
                          itemType="step-entry"
                          itemId={question.id}
                          size="sm"
                        />
                      )}
                    </div>
                    {question.help && (
                      <p className="text-sm text-muted-foreground mt-2" id={`question-help-${question.id}`}>
                        {question.help}
                      </p>
                    )}
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Store initial message in sessionStorage for AISponsor to pick up
                          sessionStorage.setItem('copilot_initial_message', `I'm working on Step ${selectedStep}, Question ${currentQuestionIndex + 1}: "${question.prompt}". Can you help me think through this?`);
                          setLocation('/ai-sponsor');
                        }}
                        className="gap-2"
                      >
                        <Sparkles className="h-3 w-3" />
                        Ask Copilot
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label htmlFor={`answer-${question.id}`} className="sr-only">
                        Your answer to: {question.prompt}
                      </label>
                      <Textarea
                        id={`answer-${question.id}`}
                        placeholder="Write your answer..."
                        value={existingAnswer?.answer || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="min-h-56 text-base"
                        data-testid={`answer-${question.id}`}
                        aria-describedby={question.help ? `question-help-${question.id}` : undefined}
                        aria-label={`Answer for question ${currentQuestionIndex + 1} of ${stepContent.questions.length}`}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Auto-saves as you type</span>
                      {existingAnswer?.answer && (
                        <span className="text-green-600">✓ Saved</span>
                      )}
                    </p>

                    <div className="flex items-center justify-between gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        data-testid="button-previous"
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <Button
                        variant="default"
                        onClick={handleNext}
                        disabled={currentQuestionIndex === stepContent.questions.length - 1}
                        data-testid="button-next"
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {currentQuestionIndex === stepContent.questions.length - 1 && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="h-4 w-4" />
              Export Step {selectedStep} Answers
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
