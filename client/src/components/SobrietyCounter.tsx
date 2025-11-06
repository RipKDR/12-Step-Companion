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
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8 shadow-sm" 
      data-testid="sobriety-counter"
    >
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
      <div className="relative flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Active Recovery</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
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
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-card-border min-w-[100px]">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent" data-testid="counter-years">
                {time.years}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {time.years === 1 ? 'Year' : 'Years'}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-card-border min-w-[100px]">
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent" data-testid="counter-days">
              {time.days}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {time.days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-card-border min-w-[90px]">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent" data-testid="counter-hours">
              {time.hours}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {time.hours === 1 ? 'Hour' : 'Hours'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-card-border min-w-[90px]">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent" data-testid="counter-minutes">
              {time.minutes}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {time.minutes === 1 ? 'Minute' : 'Minutes'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
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
