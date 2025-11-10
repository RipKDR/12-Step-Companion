import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { TrendingUp, Calendar, Smile, Heart } from 'lucide-react';
import type { JournalEntry } from '@/types';

type TimeRange = '7' | '30' | '90';

export default function Analytics() {
  const getJournalEntries = useAppStore((state) => state.getJournalEntries);
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  
  const entries = useMemo(() => getJournalEntries(), [getJournalEntries]);

  // Filter entries by time range
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const daysAgo = parseInt(timeRange);
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  }, [entries, timeRange]);

  // Mood trend data for line chart
  const moodTrendData = useMemo(() => {
    const sortedEntries = [...filteredEntries]
      .filter(e => e.mood !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedEntries.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }),
      mood: entry.mood,
    }));
  }, [filteredEntries]);

  // Mood distribution data for pie chart
  const moodDistributionData = useMemo(() => {
    const moodRanges = {
      'Great (8-10)': 0,
      'Good (6-7)': 0,
      'Okay (4-5)': 0,
      'Struggling (1-3)': 0,
    };

    filteredEntries.forEach(entry => {
      if (entry.mood !== undefined) {
        if (entry.mood >= 8) moodRanges['Great (8-10)']++;
        else if (entry.mood >= 6) moodRanges['Good (6-7)']++;
        else if (entry.mood >= 4) moodRanges['Okay (4-5)']++;
        else moodRanges['Struggling (1-3)']++;
      }
    });

    return Object.entries(moodRanges)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [filteredEntries]);

  // Entry frequency by week
  const entryFrequencyData = useMemo(() => {
    const weekCounts = new Map<string, number>();
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekLabel = weekStart.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
      
      weekCounts.set(weekLabel, (weekCounts.get(weekLabel) || 0) + 1);
    });

    return Array.from(weekCounts.entries())
      .map(([week, count]) => ({ week, count }))
      .slice(-8); // Last 8 weeks
  }, [filteredEntries]);

  // Statistics
  const stats = useMemo(() => {
    const moodEntries = filteredEntries.filter(e => e.mood !== undefined);
    const moods = moodEntries.map(e => e.mood!);
    
    const avgMood = moods.length > 0 
      ? (moods.reduce((sum, m) => sum + m, 0) / moods.length).toFixed(1)
      : 'N/A';
    
    const highMoodDays = moods.filter(m => m >= 8).length;
    const lowMoodDays = moods.filter(m => m <= 3).length;

    return {
      totalEntries: filteredEntries.length,
      avgMood,
      highMoodDays,
      lowMoodDays,
      entriesWithMood: moodEntries.length,
    };
  }, [filteredEntries]);

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

  if (entries.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 pb-20 sm:pb-24 pt-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Mood Analytics
          </h1>
          <p className="text-base text-muted-foreground">
            Track your mood patterns and journal activity
          </p>
        </header>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Smile className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Journal Entries Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start journaling to track your mood and see insights about your recovery journey
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20 sm:pb-24 pt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Mood Analytics
        </h1>
        <p className="text-base text-muted-foreground">
          Track your mood patterns and journal activity over time
        </p>
      </header>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="mb-8">
        <TabsList data-testid="tabs-time-range">
          <TabsTrigger value="7" data-testid="tab-7-days">7 Days</TabsTrigger>
          <TabsTrigger value="30" data-testid="tab-30-days">30 Days</TabsTrigger>
          <TabsTrigger value="90" data-testid="tab-90-days">90 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card data-testid="card-total-entries">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-entries">{stats.totalEntries}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-mood">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-mood">{stats.avgMood}</div>
            <p className="text-xs text-muted-foreground">Out of 10</p>
          </CardContent>
        </Card>

        <Card data-testid="card-high-mood-days">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Great Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-high-mood-days">
              {stats.highMoodDays}
            </div>
            <p className="text-xs text-muted-foreground">Mood 8-10</p>
          </CardContent>
        </Card>

        <Card data-testid="card-low-mood-days">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tough Days</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-low-mood-days">
              {stats.lowMoodDays}
            </div>
            <p className="text-xs text-muted-foreground">Mood 1-3</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend */}
        {moodTrendData.length > 0 && (
          <Card data-testid="card-mood-trend">
            <CardHeader>
              <CardTitle>Mood Over Time</CardTitle>
              <CardDescription>Track your mood changes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Mood Distribution */}
        {moodDistributionData.length > 0 && (
          <Card data-testid="card-mood-distribution">
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>How often you feel each way</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moodDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moodDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Entry Frequency */}
        {entryFrequencyData.length > 0 && (
          <Card className="lg:col-span-2" data-testid="card-entry-frequency">
            <CardHeader>
              <CardTitle>Journal Activity</CardTitle>
              <CardDescription>Number of entries per week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={entryFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="week" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredEntries.length === 0 && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No journal entries in the last {timeRange} days. Try a longer time range.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
