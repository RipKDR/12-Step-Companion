import { useState, useEffect, useMemo } from 'react';
import StepSelector from '@/components/StepSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { StepContent } from '@/types';
import { exportStepAnswers } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

export default function Steps() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [stepContent, setStepContent] = useState<StepContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getStepAnswers = useAppStore((state) => state.getStepAnswers);
  const saveStepAnswer = useAppStore((state) => state.saveStepAnswer);
  const { toast } = useToast();

  const steps = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const stepNumber = i + 1;
      const answers = getStepAnswers(stepNumber);
      const totalQuestions = 10;
      const progress = answers.length > 0 ? (answers.length / totalQuestions) * 100 : 0;
      
      return {
        number: stepNumber,
        title: `Step ${stepNumber}`,
        completed: progress === 100,
        progress: Math.round(progress),
      };
    });
  }, [getStepAnswers]);

  useEffect(() => {
    if (selectedStep === null) return;

    const loadStepContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/content/steps/step${selectedStep}.json`);
        if (!response.ok) {
          throw new Error(`Step ${selectedStep} content not found`);
        }
        const data: StepContent = await response.json();
        setStepContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load step content');
        toast({
          title: 'Error loading step',
          description: 'Could not load step content. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStepContent();
  }, [selectedStep, toast]);

  const handleAnswerChange = (questionId: string, value: string) => {
    if (!selectedStep) return;
    
    saveStepAnswer({
      questionId,
      stepNumber: selectedStep,
      answer: value,
      updatedAtISO: new Date().toISOString(),
    });
  };

  const handleExport = () => {
    if (!selectedStep) return;
    
    const answers = getStepAnswers(selectedStep);
    exportStepAnswers(selectedStep, answers);
    
    toast({
      title: 'Exported successfully',
      description: `Step ${selectedStep} answers have been downloaded.`,
    });
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
          currentStep={1}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading step content...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <h1 className="text-2xl font-bold">Error</h1>
        </header>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button
              className="mt-4"
              onClick={() => setSelectedStep(null)}
              data-testid="button-back-to-list"
            >
              Back to Step List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const savedAnswers = selectedStep ? getStepAnswers(selectedStep) : [];
  const answerMap = new Map(savedAnswers.map(a => [a.questionId, a.answer]));

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Step {selectedStep}</h1>
          <p className="text-sm text-muted-foreground">{stepContent?.title}</p>
        </div>
      </header>

      {stepContent?.overviewLabels && stepContent.overviewLabels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stepContent.overviewLabels.map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  data-testid={`theme-${label.toLowerCase()}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {stepContent?.questions.map((question, index) => (
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
                value={answerMap.get(question.id) || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="min-h-32"
                data-testid={`answer-${question.id}`}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Auto-saves as you type
              </p>
            </CardContent>
          </Card>
        ))}

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
    </div>
  );
}
