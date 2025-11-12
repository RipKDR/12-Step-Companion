import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NumberCounter } from './NumberCounter';

interface StepProgressCardsProps {
  currentStep: number;
  totalSteps: number;
  stepsDone: number;
}

export default function StepProgressCards({
  currentStep,
  totalSteps,
  stepsDone,
}: StepProgressCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Current Step Card */}
      <Card className="bg-card-gradient border-card-border transition-smooth card-hover">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <TrendingUp className="h-5 w-5 text-primary shrink-0" />
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Current step
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            <NumberCounter value={currentStep} />/<NumberCounter value={totalSteps} />
          </div>
          <p className="text-xs text-muted-foreground">
            Tap from nav to pick up where you stopped.
          </p>
        </CardContent>
      </Card>

      {/* Steps Done Card */}
      <Card className="bg-card-gradient border-card-border transition-smooth card-hover">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-xs font-semibold text-green-500 uppercase tracking-wide">
              Steps done
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            <NumberCounter value={stepsDone} />
          </div>
          <p className="text-xs text-muted-foreground">
            Marked complete with your sponsor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

