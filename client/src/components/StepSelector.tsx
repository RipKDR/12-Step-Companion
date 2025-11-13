import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-4" data-testid="step-selector">
      <h2 className="text-lg font-semibold text-foreground">All Steps</h2>
      <div className="space-y-2">
        {steps.map((step) => {
          const isCurrent = currentStep === step.number;
          const isLocked = !step.completed && !isCurrent && step.number > (currentStep || 1);
          
          return (
            <Card
              key={step.number}
              className={cn(
                "cursor-pointer hover-elevate transition-all duration-200 glow-card",
                isCurrent && "border-primary/50",
                step.completed && "border-[hsl(var(--status-completed))]/30",
                isLocked && "opacity-60"
              )}
              onClick={() => !isLocked && onSelect(step.number)}
              data-testid={`step-card-${step.number}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors",
                    step.completed && "bg-[hsl(var(--status-completed))]/20",
                    isCurrent && "bg-primary/20 border-2 border-primary/50",
                    isLocked && "bg-[hsl(var(--status-locked))]/20"
                  )}>
                    {step.completed ? (
                      <Check className={cn("h-5 w-5", "text-[hsl(var(--status-completed))]")} />
                    ) : isCurrent ? (
                      <span className="text-sm font-bold text-primary">{step.number}</span>
                    ) : (
                      <Lock className="h-5 w-5 text-[hsl(var(--status-locked))]" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-base font-semibold",
                        step.completed && "text-[hsl(var(--status-completed))]",
                        isCurrent && "text-primary",
                        isLocked && "text-[hsl(var(--status-locked))]"
                      )}>
                        Step {step.number}
                      </span>
                      {isCurrent && (
                        <Badge variant="current" className="text-xs px-2 py-0.5">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {step.title}
                    </p>
                  </div>

                  {/* Arrow */}
                  {!isLocked && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
