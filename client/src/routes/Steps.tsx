import { useState, useMemo } from 'react';
import StepSelector from '@/components/StepSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { exportStepAnswers } from '@/lib/export';

export default function Steps() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const saveStepAnswer = useAppStore((state) => state.saveStepAnswer);
  const getStepAnswers = useAppStore((state) => state.getStepAnswers);

  // Mock step content - TODO: Load from /public/content/steps/*.json
  const mockQuestions = useMemo(() => [
    {
      id: 'q1',
      prompt: 'Describe a situation where you felt powerless over your addiction.',
      help: 'Be specific and honest about your experiences.',
    },
    {
      id: 'q2',
      prompt: 'How has your life become unmanageable?',
      help: 'Consider the impact on relationships, work, and health.',
    },
    {
      id: 'q3',
      prompt: 'What patterns do you notice in your behavior?',
      help: 'Look for recurring themes and triggers.',
    },
  ], []);

  const steps = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const stepNumber = i + 1;
      const answers = getStepAnswers(stepNumber);
      const totalQuestions = stepNumber === 1 ? mockQuestions.length : 5;
      const completed = answers.filter(a => a.answer.trim()).length;
      
      return {
        number: stepNumber,
        title: `Step ${stepNumber}`,
        completed: completed === totalQuestions,
        progress: totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0,
      };
    });
  }, [getStepAnswers, mockQuestions.length]);

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
          <h1 className="text-2xl font-bold">Step {selectedStep}</h1>
          <p className="text-sm text-muted-foreground">Answer each question thoughtfully</p>
        </div>
      </header>

      <div className="space-y-6">
        {mockQuestions.map((question, index) => {
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
    </div>
  );
}
