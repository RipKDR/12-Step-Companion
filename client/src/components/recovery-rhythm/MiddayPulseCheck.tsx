import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Clock, Check } from 'lucide-react';
import { useState } from 'react';
import { haptics } from '@/lib/haptics';
import type { DailyCard } from '@/types';

interface MiddayPulseCheckProps {
  date: string;
  dailyCard?: DailyCard;
  onComplete: (mood: number, craving: number, context: string[]) => void;
}

const CONTEXT_OPTIONS = ['Alone', 'With people', 'Bored', 'Stressed', 'Hungry'];

const MOOD_LABELS = ['Low', 'Okay', 'Good', 'Great', 'Excellent'];
const CRAVING_LABELS = ['None', 'Mild', 'Moderate', 'Strong', 'Intense'];

export default function MiddayPulseCheck({
  date,
  dailyCard,
  onComplete,
}: MiddayPulseCheckProps) {
  const [mood, setMood] = useState<number>(
    dailyCard?.middayPulseCheck?.mood ?? 3
  );
  const [craving, setCraving] = useState<number>(
    dailyCard?.middayPulseCheck?.craving ?? 0
  );
  const [context, setContext] = useState<string[]>(
    dailyCard?.middayPulseCheck?.context ?? []
  );

  const isCompleted = dailyCard?.middayCompleted;

  const toggleContext = (option: string) => {
    haptics.light();
    setContext((prev) =>
      prev.includes(option)
        ? prev.filter((c) => c !== option)
        : [...prev, option]
    );
  };

  const handleComplete = () => {
    haptics.success();
    onComplete(mood, craving, context);
  };

  return (
    <Card className="w-full transition-all duration-200" data-testid="midday-pulse-check">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={`p-3 rounded-lg ${
              isCompleted
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            } transition-colors`}
          >
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <CardTitle className="text-lg">Pulse Check</CardTitle>
            {isCompleted && (
              <p className="text-sm text-muted-foreground">
                Mood: {MOOD_LABELS[mood - 1]}, Craving: {CRAVING_LABELS[Math.floor(craving / 2.5)]}
              </p>
            )}
          </div>
        </div>
        {isCompleted && (
          <Badge variant="default" className="h-8">
            <Check className="h-3 w-3 mr-1" />
            Done
          </Badge>
        )}
      </CardHeader>
      {!isCompleted && (
        <CardContent className="space-y-6 pt-2">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="mood-slider" className="text-sm font-medium">
                  How's your mood?
                </label>
                <span className="text-sm text-muted-foreground">{MOOD_LABELS[mood - 1]}</span>
              </div>
              <Slider
                id="mood-slider"
                min={1}
                max={5}
                step={1}
                value={[mood]}
                onValueChange={([value]) => {
                  haptics.light();
                  setMood(value);
                }}
                className="w-full"
                aria-label="Mood slider"
                data-testid="mood-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low</span>
                <span>Great</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="craving-slider" className="text-sm font-medium">
                  Craving intensity?
                </label>
                <span className="text-sm text-muted-foreground">
                  {craving === 0 ? 'None' : `${craving}/10`}
                </span>
              </div>
              <Slider
                id="craving-slider"
                min={0}
                max={10}
                step={1}
                value={[craving]}
                onValueChange={([value]) => {
                  haptics.light();
                  setCraving(value);
                }}
                className="w-full"
                aria-label="Craving slider"
                data-testid="craving-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>None</span>
                <span>Intense</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="context-group" className="text-sm font-medium">Context (optional)</label>
            <div id="context-group" className="flex flex-wrap gap-2" role="group" aria-labelledby="context-group-label">
              <span id="context-group-label" className="sr-only">Select context options</span>
              {CONTEXT_OPTIONS.map((option) => (
                <Button
                  key={option}
                  id={`context-${option.toLowerCase().replace(' ', '-')}`}
                  name="context"
                  variant={context.includes(option) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleContext(option)}
                  className="h-9"
                  aria-pressed={context.includes(option)}
                  data-testid={`context-${option.toLowerCase().replace(' ', '-')}`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleComplete}
            className="w-full h-12"
            data-testid="complete-midday-pulse"
            aria-label="Complete pulse check"
          >
            <Check className="h-4 w-4 mr-2" />
            Save Check-In
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

