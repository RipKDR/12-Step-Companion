import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Activity,
  Download,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getAnalyticsManager } from "@/lib/analytics";
import type { AnalyticsEventType } from "@/types";

export default function UsageInsights() {
  const analyticsEvents = useAppStore((state) => state.analyticsEvents || {});
  const analyticsSettings = useAppStore((state) => state.settings.analytics);
  const appState = useAppStore((state) => state);

  const manager = useMemo(() => getAnalyticsManager(), []);
  const metrics = useMemo(
    () => manager.calculateMetrics(appState),
    [appState, manager],
  );

  const dailyCounts = useMemo(
    () => manager.getDailyEventCounts(analyticsEvents, 30),
    [analyticsEvents, manager],
  );

  const handleExport = () => {
    const data = manager.exportAnalyticsData(appState);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!analyticsSettings.enabled) {
    return (
      <div className="max-w-4xl mx-auto px-6 pb-8 sm:pb-12 pt-8">
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
                All analytics data is stored locally on your device and never
                sent to external servers. You have complete control over what is
                tracked.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventTypeLabels: Record<AnalyticsEventType, string> = {
    app_opened: "App Sessions",
    profile_created: "Profile Created",
    journal_entry_created: "Journal Entries",
    journal_entry_voice_used: "Voice Transcription",
    journal_entry_audio_recorded: "Audio Recordings",
    daily_card_morning_completed: "Morning Cards",
    daily_card_evening_completed: "Evening Cards",
    step_answer_saved: "Step Answers",
    meeting_logged: "Meetings",
    goal_created: "Goals Created",
    goal_completed: "Goals Completed",
    crisis_mode_activated: "Crisis Mode",
    emergency_contact_called: "Emergency Calls",
    achievement_unlocked: "Achievements",
    milestone_celebrated: "Milestones",
    daily_challenge_completed: "Challenges",
    streak_extended: "Streaks Extended",
    recovery_points_awarded: "Points Awarded",
    recovery_reward_redeemed: "Rewards Redeemed",
    recovery_points_summary_exported: "Reward Summary Exports",
  };

  const topEvents = Object.entries(metrics.eventsByType)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto px-6 pb-8 sm:pb-12 pt-8">
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
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Privacy-First Analytics
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                All data is stored locally on your device. Nothing is sent to
                external servers. You can export or delete this data at any
                time.
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
            <CardTitle className="text-3xl">
              {metrics.totalJournalEntries}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Breakdown</CardTitle>
              <CardDescription>
                Top activities in your recovery journey
              </CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {topEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No activity recorded yet. Start using the app to see your
              insights!
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
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
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
              <CardTitle>30-Day Activity</CardTitle>
              <CardDescription>
                Daily event counts for the past month
              </CardDescription>
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
                const opacity =
                  count === 0 ? 0.1 : Math.min(0.3 + (count / 20) * 0.7, 1);
                const day = new Date(date).toLocaleDateString("en-US", {
                  weekday: "short",
                });
                return (
                  <div key={date} className="text-center">
                    <div
                      className="h-10 rounded bg-primary mb-1"
                      style={{ opacity }}
                      title={`${date}: ${count} events`}
                    />
                    <p className="text-xs text-muted-foreground">{count}</p>
                  </div>
                );
              })}
          </div>
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
              <strong>Retention Period:</strong>{" "}
              {analyticsSettings.retentionDays} days
            </p>
            <p>
              <strong>Usage Data:</strong>{" "}
              {analyticsSettings.collectUsageData ? "Enabled" : "Disabled"}
            </p>
            <p>
              <strong>Performance Data:</strong>{" "}
              {analyticsSettings.collectPerformanceData
                ? "Enabled"
                : "Disabled"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
