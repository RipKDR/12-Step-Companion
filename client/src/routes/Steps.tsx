import { useState } from 'react';
import StepSelector from '@/components/StepSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';

export default function Steps() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');

  // TODO: Replace with actual step data from JSON files
  const steps = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    title: `Step ${i + 1}`,
    completed: i < 1,
    progress: i === 0 ? 70 : i < 1 ? 100 : 0,
  }));

  const mockQuestions = [
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
  ];

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
        {mockQuestions.map((question, index) => (
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
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
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
          data-testid="button-export"
        >
          <Download className="h-4 w-4" />
          Export Step {selectedStep} Answers
        </Button>
      </div>
    </div>
  );
}
