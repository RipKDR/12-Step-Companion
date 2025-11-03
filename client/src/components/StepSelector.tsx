import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface StepSelectorProps {
  steps: Array<{
    number: number;
    title: string;
    completed: boolean;
    progress: number; // 0-100
  }>;
  onSelect: (stepNumber: number) => void;
  currentStep?: number;
}

export default function StepSelector({ steps, onSelect, currentStep }: StepSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="step-selector">
      {steps.map((step) => {
        const isCurrent = currentStep === step.number;
        
        return (
          <Card
            key={step.number}
            className={`cursor-pointer hover-elevate active-elevate-2 transition-all ${
              isCurrent ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect(step.number)}
            data-testid={`step-card-${step.number}`}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
              <CardTitle className="text-lg">
                Step {step.number}
              </CardTitle>
              {step.completed && (
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  Done
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{step.title}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{step.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
