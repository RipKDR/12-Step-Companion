import { useState, useMemo, useEffect } from 'react';
import StepSelector from '@/components/StepSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { exportStepAnswers } from '@/lib/export';
import { loadStepContent, loadAllSteps } from '@/lib/contentLoader';
import type { StepContent } from '@/types';

export default function Steps() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [stepContent, setStepContent] = useState<StepContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stepQuestionCounts, setStepQuestionCounts] = useState<Map<number, number>>(new Map());
  
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
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setStepContent(null);
    }
  }, [selectedStep]);

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

  if (selectedStep === null) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold mb-2">Step Work</h1>
          <p className="text-muted-foreground">
            Select a step to continue your work
          </p>
        </header>
        <StepSelector
          steps={steps}
          onSelect={setSelectedStep}
          currentStep={steps.find(s => !s.completed)?.number || 1}
        />
      </div>
    );
  }

  const currentAnswers = getStepAnswers(selectedStep);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedStep(null)}
          data-testid="button-back"
          aria-label="Back to step list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {stepContent?.title || `Step ${selectedStep}`}
          </h1>
          <p className="text-sm text-muted-foreground">Answer each question thoughtfully</p>
        </div>
      </header>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Loading step content...</p>
        </div>
      )}

      {!isLoading && !stepContent && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Step content not available. Please import step questions in Settings.</p>
        </div>
      )}

      {!isLoading && stepContent && (
        <div className="space-y-6">
          {stepContent.overviewLabels && stepContent.overviewLabels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stepContent.overviewLabels.map((label) => (
                    <span
                      key={label}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stepContent.questions.map((question, index) => {
            const existingAnswer = currentAnswers.find(a => a.questionId === question.id);
            
            return (
              <Card key={question.id} data-testid={`question-${question.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}
                  </CardTitle>
                  <p className="text-base font-normal text-foreground mt-2">
                    {question.prompt}
                  </p>
                  {question.help && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {question.help}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write your answer..."
                    value={existingAnswer?.answer || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="min-h-32"
                    data-testid={`answer-${question.id}`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Auto-saves as you type
                  </p>
                </CardContent>
              </Card>
            );
          })}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleExport}
            data-testid="button-export"
          >
            <Download className="h-4 w-4" />
            Export Step {selectedStep} Answers
          </Button>
        </div>
      )}
    </div>
  );
}
