import { useEffect, useState } from 'react';

interface SobrietyCounterProps {
  cleanDate: string; // ISO 8601
  timezone?: string;
}

interface TimeUnits {
  years: number;
  days: number;
  hours: number;
  minutes: number;
}

function calculateSobriety(cleanDate: string): TimeUnits {
  const clean = new Date(cleanDate);
  const now = new Date();
  const diff = now.getTime() - clean.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);

  return {
    years,
    days: days % 365,
    hours: hours % 24,
    minutes: minutes % 60,
  };
}

export default function SobrietyCounter({ cleanDate, timezone = 'Australia/Melbourne' }: SobrietyCounterProps) {
  const [time, setTime] = useState<TimeUnits>(calculateSobriety(cleanDate));
  const [absoluteTime, setAbsoluteTime] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateSobriety(cleanDate));
    }, 60000); // Update every minute

    // Update immediately
    setTime(calculateSobriety(cleanDate));

    // Format absolute time
    const formatted = new Intl.DateTimeFormat('en-AU', {
      timeZone: timezone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(cleanDate));
    setAbsoluteTime(formatted);

    return () => clearInterval(interval);
  }, [cleanDate, timezone]);

  return (
    <div
      className="rounded-lg bg-card border border-border p-8 shadow-sm"
      data-testid="sobriety-counter"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary">Active Recovery</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Clean Time
          </h2>
        </div>
        
        <div
          className="flex flex-wrap justify-center gap-6 md:gap-8"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          {time.years > 0 && (
            <div className="flex flex-col items-center gap-2 min-w-[100px]">
              <div className="text-5xl md:text-6xl font-semibold text-foreground tracking-tight" data-testid="counter-years">
                {time.years}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {time.years === 1 ? 'Year' : 'Years'}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-2 min-w-[100px]">
            <div className="text-5xl md:text-6xl font-semibold text-foreground tracking-tight" data-testid="counter-days">
              {time.days}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {time.days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 min-w-[90px]">
            <div className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight" data-testid="counter-hours">
              {time.hours}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {time.hours === 1 ? 'Hour' : 'Hours'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 min-w-[90px]">
            <div className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight" data-testid="counter-minutes">
              {time.minutes}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {time.minutes === 1 ? 'Minute' : 'Minutes'}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground" data-testid="counter-absolute">
            Clean since
          </div>
          <div className="text-sm font-medium text-foreground">
            {absoluteTime}
          </div>
        </div>
      </div>
    </div>
  );
}
