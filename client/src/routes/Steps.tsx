import { useState, useMemo, useEffect } from 'react';
import StepSelector from '@/components/StepSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { exportStepAnswers } from '@/lib/export';
import { loadStepContent, loadAllSteps } from '@/lib/contentLoader';
import { cn } from '@/lib/utils';
import type { StepContent } from '@/types';

export default function Steps() {
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
      
      return {
        number: stepNumber,
        title: `Step ${stepNumber}`,
        completed: totalQuestions > 0 && completed === totalQuestions,
        progress: totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0,
      };
    });
  }, [getStepAnswers, stepQuestionCounts, stepAnswersState]);

  const handleAnswerChange = (questionId: string, value: string) => {
    if (selectedStep) {
      saveStepAnswer({
        questionId,
        stepNumber: selectedStep,
        answer: value,
        updatedAtISO: new Date().toISOString(),
      });
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

  if (selectedStep === null) {
    const currentStep = steps.find(s => !s.completed)?.number || 12;
    const completedStepsCount = steps.filter(s => s.completed).length;
    const currentStepData = steps.find(s => s.number === currentStep);
    
    return (
      <div className="max-w-3xl mx-auto px-6 pb-24 pt-6 space-y-8">
        {/* Currently Working On Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Currently working on
              </span>
              <span className="text-xs text-muted-foreground">
                {completedStepsCount}/12 completed
              </span>
            </div>
            <CardTitle className="text-2xl">
              Step {currentStep}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {currentStepData?.progress || 0}% complete • Continue your journey
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setSelectedStep(currentStep)}
              data-testid="button-continue-step"
            >
              Continue Step {currentStep}
            </Button>
          </CardContent>
        </Card>

        {/* All Steps List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All steps</h2>
          <div className="space-y-3">
            {steps.map((step) => {
              const isCurrent = step.number === currentStep;
              const isLocked = step.number > currentStep && completedStepsCount < 12;
              const isComplete = step.completed;
              
              return (
                <Card
                  key={step.number}
                  className={cn(
                    'cursor-pointer hover-elevate active-elevate-2 transition-all',
                    isCurrent && 'border-primary/30 bg-primary/5',
                    isLocked && 'opacity-60 cursor-not-allowed'
                  )}
                  onClick={() => !isLocked && setSelectedStep(step.number)}
                  data-testid={`step-card-${step.number}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Step Icon/Status */}
                      <div className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-full font-semibold',
                        isComplete && 'bg-green-500/10 text-green-500',
                        isCurrent && !isComplete && 'bg-primary/10 text-primary',
                        isLocked && 'bg-muted/50 text-muted-foreground'
                      )}>
                        {isComplete ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isLocked ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          step.number
                        )}
                      </div>
                      
                      {/* Step Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Step {step.number}</span>
                          {isCurrent && !isComplete && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        {!isLocked && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
                              <div 
                                className={cn(
                                  'h-full transition-all duration-500',
                                  isComplete ? 'bg-green-500' : 'bg-primary'
                                )}
                                style={{ width: `${step.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {step.progress}%
                            </span>
                          </div>
                        )}
                        {isLocked && (
                          <p className="text-xs text-muted-foreground">
                            Complete previous steps to unlock
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
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
          <h1 className="text-3xl font-semibold tracking-tight">
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
                <Card key={question.id} data-testid={`question-${question.id}`}>
                  <CardHeader>
                    {question.section && (
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                        {question.section}
                      </p>
                    )}
                    <CardTitle className="text-lg leading-relaxed">
                      {question.prompt}
                    </CardTitle>
                    {question.help && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {question.help}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Textarea
                      placeholder="Write your answer..."
                      value={existingAnswer?.answer || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="min-h-56 text-base"
                      data-testid={`answer-${question.id}`}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-saves as you type
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
