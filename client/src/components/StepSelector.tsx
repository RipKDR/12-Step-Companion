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
            className={`relative cursor-pointer hover-elevate active-elevate-2 transition-all overflow-hidden ${
              isCurrent ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-transparent' : ''
            } ${step.completed ? 'border-primary/20' : ''}`}
            onClick={() => onSelect(step.number)}
            data-testid={`step-card-${step.number}`}
          >
            {isCurrent && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -z-10" />
            )}
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                  step.completed ? 'bg-primary text-primary-foreground' : 
                  isCurrent ? 'bg-primary/20 text-primary border border-primary/30' :
                  'bg-muted text-muted-foreground'
                } transition-colors font-bold text-lg`}>
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
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-muted-foreground">{step.progress}% Complete</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
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
