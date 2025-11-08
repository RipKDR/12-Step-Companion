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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="step-selector">
      {steps.map((step) => {
        const isCurrent = currentStep === step.number;
        
        return (
          <Card
            key={step.number}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isCurrent ? 'border-primary' : step.completed ? 'border-primary/30' : 'border-border'
            }`}
            onClick={() => onSelect(step.number)}
            data-testid={`step-card-${step.number}`}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                  step.completed ? 'bg-primary text-primary-foreground' :
                  isCurrent ? 'bg-primary/10 text-primary border border-primary/30' :
                  'bg-muted text-muted-foreground'
                } transition-colors font-semibold text-lg`}>
                  {step.completed ? <Check className="h-6 w-6" /> : step.number}
                </div>
                <CardTitle className="text-lg">
                  Step {step.number}
                </CardTitle>
              </div>
              {step.completed && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1">
                  <Check className="h-3 w-3" />
                  Complete
                </Badge>
              )}
              {isCurrent && !step.completed && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Current
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{step.progress}% Complete</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${step.progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
