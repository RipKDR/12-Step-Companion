import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart3, TrendingUp, Calendar, Activity, Download, Zap, Keyboard } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getAnalyticsManager } from '@/lib/analytics';
import { UserJourneyFunnel } from '@/components/UserJourneyFunnel';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { AnalyticsEventType } from '@/types';

export default function UsageInsights() {
  const analyticsEvents = useAppStore((state) => state.analyticsEvents || {});
  const analyticsSettings = useAppStore((state) => state.settings.analytics);
  const appState = useAppStore((state) => state);

  const manager = useMemo(() => getAnalyticsManager(), []);
  const metrics = useMemo(() => manager.calculateMetrics(appState), [appState, manager]);

  const dailyCounts = useMemo(
    () => manager.getDailyEventCounts(analyticsEvents, 30),
    [analyticsEvents, manager]
  );

  const handleExport = () => {
    const data = manager.exportAnalyticsData(appState);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!analyticsSettings.enabled) {
    return (
      <div className="max-w-4xl mx-auto px-6 pb-32 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Usage Insights</h1>
          <p className="text-muted-foreground mt-2">
            Privacy-first usage analytics
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Disabled</h3>
              <p className="text-muted-foreground mb-4">
                Enable analytics in Settings to see your usage insights.
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                All analytics data is stored locally on your device and never sent to external servers.
                You have complete control over what is tracked.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventTypeLabels: Record<AnalyticsEventType, string> = {
    app_opened: 'App Sessions',
    profile_created: 'Profile Created',
    journal_entry_created: 'Journal Entries',
    journal_entry_voice_used: 'Voice Transcription',
    journal_entry_audio_recorded: 'Audio Recordings',
    daily_card_morning_completed: 'Morning Cards',
    daily_card_evening_completed: 'Evening Cards',
    step_answer_saved: 'Step Answers',
    meeting_logged: 'Meetings',
    goal_created: 'Goals Created',
    goal_completed: 'Goals Completed',
    crisis_mode_activated: 'Crisis Mode',
    emergency_contact_called: 'Emergency Calls',
    achievement_unlocked: 'Achievements',
    milestone_celebrated: 'Milestones',
    daily_challenge_completed: 'Challenges',
    streak_extended: 'Streaks Extended',
    toast_shown: 'Toast Notifications',
    skeleton_loader_shown: 'Skeleton Loaders',
    empty_state_viewed: 'Empty States',
    keyboard_shortcut_used: 'Keyboard Shortcuts',
    performance_metric: 'Performance Metrics',
    page_view: 'Page Views',
    feature_discovered: 'Features Discovered',
  };

  const topEvents = Object.entries(metrics.eventsByType)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Performance metrics data for chart
  const performanceMetrics = useMemo(() => {
    const perfEvents = Object.values(analyticsEvents).filter(
      (e) => e.type === 'performance_metric'
    );
    
    // Group by metric name and calculate averages
    const grouped: Record<string, { values: number[]; ratings: string[] }> = {};
    perfEvents.forEach((event) => {
      const metricName = event.metadata?.metric as string;
      const value = event.metadata?.value as number;
      const rating = event.metadata?.rating as string;
      
      if (metricName && value !== undefined) {
        if (!grouped[metricName]) {
          grouped[metricName] = { values: [], ratings: [] };
        }
        grouped[metricName].values.push(value);
        if (rating) grouped[metricName].ratings.push(rating);
      }
    });

    // Calculate averages and format for chart
    return Object.entries(grouped).map(([metric, data]) => ({
      metric,
      avgValue: data.values.reduce((a, b) => a + b, 0) / data.values.length,
      count: data.values.length,
      goodRating: data.ratings.filter((r) => r === 'good').length,
      needsImprovement: data.ratings.filter((r) => r === 'needs-improvement').length,
      poorRating: data.ratings.filter((r) => r === 'poor').length,
    }));
  }, [analyticsEvents]);

  // Feature usage data (for heatmap enhancement)
  const featureUsageData = useMemo(() => {
    const featureEvents = Object.values(analyticsEvents).filter(
      (e) => e.type === 'feature_discovered' || e.type === 'keyboard_shortcut_used' || e.type === 'toast_shown'
    );
    
    const usage: Record<string, number> = {};
    featureEvents.forEach((event) => {
      const feature = event.metadata?.feature || event.metadata?.target || 'toast';
      usage[feature] = (usage[feature] || 0) + 1;
    });
    
    return Object.entries(usage)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [analyticsEvents]);

  // Toast notification frequency by day
  const toastFrequencyData = useMemo(() => {
    const toastEvents = Object.values(analyticsEvents).filter(
      (e) => e.type === 'toast_shown'
    );
    
    const dailyToastCounts: Record<string, number> = {};
    toastEvents.forEach((event) => {
      const dateKey = event.timestamp.split('T')[0];
      dailyToastCounts[dateKey] = (dailyToastCounts[dateKey] || 0) + 1;
    });
    
    // Get last 14 days
    const days: Array<{ date: string; count: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dailyToastCounts[dateKey] || 0,
      });
    }
    
    return days;
  }, [analyticsEvents]);

  return (
    <>
      <style>{`
        .progress-bar {
          width: var(--progress-width, 0%);
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-6 pb-32 pt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Usage Insights</h1>
        <p className="text-muted-foreground mt-2">
          Your recovery journey insights (stored locally)
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="mb-6 border-green-500/50 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100">Privacy-First Analytics</h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                All data is stored locally on your device. Nothing is sent to external servers.
                You can export or delete this data at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalEvents}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Streaks</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeStreaks}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sobriety Days</CardDescription>
            <CardTitle className="text-3xl">{metrics.sobrietyDays}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Journal Entries</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalJournalEntries}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Breakdown</CardTitle>
              <CardDescription>Top activities in your recovery journey</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {topEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No activity recorded yet. Start using the app to see your insights!
            </p>
          ) : (
            <div className="space-y-4">
              {topEvents.map(([type, count]) => {
                const percentage = (count / metrics.totalEvents) * 100;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {eventTypeLabels[type as AnalyticsEventType]}
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all progress-bar"
                        style={{ '--progress-width': `${percentage}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Heatmap */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>30-Day Activity Heatmap</CardTitle>
              <CardDescription>Daily event counts for the past month</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(dailyCounts)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .slice(-28)
              .map(([date, count]) => {
                const opacity = count === 0 ? 0.1 : Math.min(0.3 + (count / 20) * 0.7, 1);
                return (
                  <div key={date} className="text-center">
                    <div
                      className="h-10 rounded bg-primary mb-1 transition-opacity hover:opacity-80"
                      style={{ opacity }}
                      title={`${date}: ${count} events`}
                    />
                    <p className="text-xs text-muted-foreground">{count}</p>
                  </div>
                );
              })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0.1, 0.4, 0.7, 1].map((opacity) => (
                <div
                  key={opacity}
                  className="h-3 w-3 rounded bg-primary"
                  style={{ opacity }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Chart */}
      {performanceMetrics.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Web Vitals over time (average values)</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: 'Value (ms)',
                  color: 'hsl(var(--chart-1))',
                },
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="metric"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="avgValue"
                    fill="hsl(var(--chart-1))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              {performanceMetrics.map((metric) => (
                <div key={metric.metric} className="space-y-1">
                  <p className="font-medium">{metric.metric}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className={metric.goodRating > 0 ? 'text-green-600' : ''}>
                      ✓ {metric.goodRating}
                    </span>
                    <span className={metric.needsImprovement > 0 ? 'text-yellow-600' : ''}>
                      ⚠ {metric.needsImprovement}
                    </span>
                    <span className={metric.poorRating > 0 ? 'text-red-600' : ''}>
                      ✗ {metric.poorRating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toast Notification Frequency */}
      {toastFrequencyData.some((d) => d.count > 0) && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Toast Notification Frequency</CardTitle>
                <CardDescription>Daily toast notifications over the past 14 days</CardDescription>
              </div>
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: 'Toasts',
                  color: 'hsl(var(--chart-2))',
                },
              }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={toastFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Feature Usage */}
      {featureUsageData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most used features and shortcuts</CardDescription>
              </div>
              <Keyboard className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featureUsageData.map((item) => {
                const maxCount = Math.max(...featureUsageData.map((d) => d.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.feature} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {item.feature.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all progress-bar"
                        style={{ '--progress-width': `${percentage}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Journey Funnel */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Journey</CardTitle>
              <CardDescription>Feature adoption and onboarding funnel</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <UserJourneyFunnel analyticsEvents={analyticsEvents} appState={appState} />
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export your analytics data for transparency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Export Analytics Data</p>
              <p className="text-sm text-muted-foreground">
                Download all tracked events as JSON
              </p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Separator />

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Retention Period:</strong> {analyticsSettings.retentionDays} days
            </p>
            <p>
              <strong>Usage Data:</strong> {analyticsSettings.collectUsageData ? 'Enabled' : 'Disabled'}
            </p>
            <p>
              <strong>Performance Data:</strong> {analyticsSettings.collectPerformanceData ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
