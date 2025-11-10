import { useMemo } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import type { AppState, AnalyticsEvent } from '@/types';

interface UserJourneyFunnelProps {
  analyticsEvents: Record<string, AnalyticsEvent>;
  appState: AppState;
}

const JOURNEY_STEPS = [
  { id: 'onboarding', label: 'Onboarding Complete', event: 'profile_created' },
  { id: 'first_journal', label: 'First Journal Entry', event: 'journal_entry_created' },
  { id: 'first_step', label: 'First Step Answer', event: 'step_answer_saved' },
  { id: 'first_meeting', label: 'First Meeting Logged', event: 'meeting_logged' },
  { id: 'first_challenge', label: 'First Challenge', event: 'daily_challenge_completed' },
  { id: 'first_achievement', label: 'First Achievement', event: 'achievement_unlocked' },
] as const;

export function UserJourneyFunnel({ analyticsEvents, appState }: UserJourneyFunnelProps) {
  const funnelData = useMemo(() => {
    const events = Object.values(analyticsEvents);
    // For single-user app: check if user has completed onboarding
    const hasCompletedOnboarding = appState.onboardingComplete || !!appState.profile;
    
    if (!hasCompletedOnboarding) {
      return JOURNEY_STEPS.map((step) => ({
        ...step,
        count: 0,
        percentage: 0,
      }));
    }

    // For single-user app: count is 1 if event exists, 0 otherwise
    let previousCount = 1; // Start with onboarding complete = 1
    return JOURNEY_STEPS.map((step) => {
      const hasEvent = events.some((e) => e.type === step.event);
      const count = hasEvent ? 1 : 0;
      const percentage = previousCount > 0 ? (count / previousCount) * 100 : 0;
      previousCount = count;
      
      return {
        ...step,
        count,
        percentage: Math.round(percentage),
      };
    });
  }, [analyticsEvents, appState]);

  const maxCount = Math.max(...funnelData.map((d) => d.count), 1);

  // Color gradient for funnel
  const getColor = (index: number) => {
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
      'hsl(var(--primary))',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      {funnelData.length === 0 || maxCount === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Complete onboarding to start tracking your journey
        </p>
      ) : (
        <>
          <ChartContainer
            config={JOURNEY_STEPS.reduce(
              (acc, step, index) => ({
                ...acc,
                [step.id]: {
                  label: step.label,
                  color: getColor(index),
                },
              }),
              {} as Record<string, { label: string; color: string }>
            )}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  domain={[0, maxCount]}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  width={150}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={entry.id} fill={getColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="space-y-2 text-sm">
            {funnelData.map((step, index) => {
              const widthPercentage = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
              return (
                <div key={step.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{step.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{step.count}</span>
                      {index > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({step.percentage}% of previous)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${widthPercentage}%`,
                        backgroundColor: getColor(index),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

