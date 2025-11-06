import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface MeditationTimerProps {
  testId?: string;
}

const PRESET_DURATIONS = [
  { label: '1 min', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
];

export default function MeditationTimer({ testId = 'meditation-timer' }: MeditationTimerProps) {
  const [selectedDuration, setSelectedDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          setHasCompleted(true);
          haptics.success();
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Meditation Complete', {
              body: 'Great job! Your meditation session is complete.',
              icon: '/icon-192.png',
            });
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleStart = () => {
    haptics.light();
    setIsActive(true);
    setHasCompleted(false);
  };

  const handlePause = () => {
    haptics.light();
    setIsActive(false);
  };

  const handleReset = () => {
    haptics.light();
    setIsActive(false);
    setTimeLeft(selectedDuration);
    setHasCompleted(false);
  };

  const handlePresetSelect = (seconds: number) => {
    haptics.light();
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(false);
    setHasCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  return (
    <Card className="w-full" data-testid={testId}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
        <div className="text-primary">
          <Clock className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">Prayer & Meditation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESET_DURATIONS.map((preset) => (
            <Button
              key={preset.seconds}
              size="sm"
              variant={selectedDuration === preset.seconds ? 'default' : 'outline'}
              onClick={() => handlePresetSelect(preset.seconds)}
              disabled={isActive}
              data-testid={`${testId}-preset-${preset.seconds}`}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="relative">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <div
            className={`text-5xl font-bold ${hasCompleted ? 'text-primary' : 'text-foreground'}`}
            data-testid={`${testId}-display`}
          >
            {formatTime(timeLeft)}
          </div>
          {hasCompleted && (
            <p className="text-sm text-primary mt-2" data-testid={`${testId}-complete-message`}>
              Session complete!
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {!isActive ? (
            <Button
              size="lg"
              onClick={handleStart}
              disabled={timeLeft === 0}
              className="gap-2"
              data-testid={`${testId}-start-button`}
            >
              <Play className="h-5 w-5" />
              Start
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={handlePause}
              className="gap-2"
              data-testid={`${testId}-pause-button`}
            >
              <Pause className="h-5 w-5" />
              Pause
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            className="gap-2"
            data-testid={`${testId}-reset-button`}
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
