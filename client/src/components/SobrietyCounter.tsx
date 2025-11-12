import { useEffect, useState } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { NumberCounter } from './NumberCounter';

interface SobrietyCounterProps {
  cleanDate: string; // ISO 8601
  timezone?: string;
}

interface TimeUnits {
  totalDays: number;
  weeks: number;
  monthsEst: number;
  dayStreak: number;
}

function calculateSobriety(cleanDate: string): TimeUnits {
  const clean = new Date(cleanDate);
  const now = new Date();
  const diff = now.getTime() - clean.getTime();
  
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const monthsEst = Math.floor(totalDays / 30);
  // For day streak, we'll use totalDays as continuous streak
  const dayStreak = totalDays;

  return {
    totalDays,
    weeks,
    monthsEst,
    dayStreak,
  };
}

export default function SobrietyCounter({ cleanDate, timezone = 'Australia/Melbourne' }: SobrietyCounterProps) {
  const [time, setTime] = useState<TimeUnits>(calculateSobriety(cleanDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateSobriety(cleanDate));
    }, 60000); // Update every minute

    // Update immediately
    setTime(calculateSobriety(cleanDate));

    return () => clearInterval(interval);
  }, [cleanDate]);

  // Calculate progress for circular indicator (365 days = full circle)
  const progress = Math.min((time.totalDays % 365) / 365, 1);
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);

  return (
    <Card className="bg-card-gradient border-card-border p-6" data-testid="sobriety-counter">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Clean time</div>
              <div className="text-xs text-muted-foreground mt-0.5">Continuous, from your last reset.</div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Streak intact</span>
            </div>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              className="transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(230 25% 20%)"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle with glow - inline style needed for dynamic filter */}
              {/* eslint-disable-next-line react/forbid-dom-props */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(217 70% 55%)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-500 ease-out glow-primary"
                style={{
                  filter: 'drop-shadow(0 0 8px hsl(217 70% 55% / 0.5))',
                }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-foreground tracking-tight" data-testid="counter-days">
                <NumberCounter value={time.totalDays} />
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-wide">
                Days clean
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card-gradient-subtle border-card-border p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground" data-testid="counter-weeks">
                <NumberCounter value={time.weeks} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Weeks</div>
            </div>
          </Card>
          <Card className="bg-card-gradient-subtle border-card-border p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground" data-testid="counter-months">
                <NumberCounter value={time.monthsEst} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Months est.</div>
            </div>
          </Card>
          <Card className="bg-card-gradient-subtle border-card-border p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground" data-testid="counter-streak">
                <NumberCounter value={time.dayStreak} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Day streak</div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}
