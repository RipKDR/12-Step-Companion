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
    <div className="flex flex-col items-center gap-6 p-8" data-testid="sobriety-counter">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-muted-foreground mb-2">Clean Time</h2>
        <div 
          className="flex flex-wrap justify-center gap-6" 
          role="timer" 
          aria-live="polite"
          aria-atomic="true"
        >
          {time.years > 0 && (
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-bold text-foreground" data-testid="counter-years">
                {time.years}
              </div>
              <div className="text-sm font-regular text-muted-foreground mt-1">
                {time.years === 1 ? 'Year' : 'Years'}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center">
            <div className="text-5xl md:text-6xl font-bold text-foreground" data-testid="counter-days">
              {time.days}
            </div>
            <div className="text-sm font-regular text-muted-foreground mt-1">
              {time.days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-bold text-foreground" data-testid="counter-hours">
              {time.hours}
            </div>
            <div className="text-sm font-regular text-muted-foreground mt-1">
              {time.hours === 1 ? 'Hour' : 'Hours'}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-bold text-foreground" data-testid="counter-minutes">
              {time.minutes}
            </div>
            <div className="text-sm font-regular text-muted-foreground mt-1">
              {time.minutes === 1 ? 'Minute' : 'Minutes'}
            </div>
          </div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground text-center" data-testid="counter-absolute">
        Clean since {absoluteTime}
      </div>
    </div>
  );
}
