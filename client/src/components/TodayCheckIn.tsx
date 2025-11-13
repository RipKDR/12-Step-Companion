import { Star, CheckCircle2, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TodayCheckInProps {
  morningCompleted?: boolean;
  eveningCompleted?: boolean;
  onMorningClick?: () => void;
  onEveningClick?: () => void;
}

export default function TodayCheckIn({
  morningCompleted = false,
  eveningCompleted = false,
  onMorningClick,
  onEveningClick,
}: TodayCheckInProps) {
  const completedCount = (morningCompleted ? 1 : 0) + (eveningCompleted ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Today check-in</h2>
        </div>
        <span className="text-xs text-muted-foreground">{completedCount}/2 done</span>
      </div>

      <div className="space-y-3">
        {/* Morning Intention */}
        <Card
          className={`bg-card-gradient border-card-border cursor-pointer hover-elevate active-elevate-2 transition-smooth card-hover button-press glow-card ${
            morningCompleted ? 'opacity-75' : ''
          }`}
          onClick={onMorningClick}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground mb-1">
                  Morning intention
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose one clear intention for today.
                </p>
              </div>
              {morningCompleted && (
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-completed))] shrink-0" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Evening Reflection */}
        <Card
          className={`bg-card-gradient border-card-border cursor-pointer hover-elevate active-elevate-2 transition-smooth card-hover button-press glow-card ${
            eveningCompleted ? 'opacity-75' : ''
          }`}
          onClick={onEveningClick}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground mb-1">
                  Evening reflection
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan the day without judgement.
                </p>
              </div>
              {eveningCompleted && (
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-completed))] shrink-0" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

