/**
 * Pattern Analysis Library
 *
 * On-device pattern recognition for recovery insights
 * All analysis happens locally for privacy
 */

// Daily entry structure for pattern analysis
export interface DailyEntry {
  id: string;
  entry_date: string;
  cravings_intensity: number | null;
  feelings: string[] | null;
  triggers: string[] | null;
  coping_actions: string[] | null;
  gratitude: string | null;
  notes: string | null;
  created_at?: string;
}

export interface PatternInsight {
  type: "day_of_week" | "time_of_day" | "trigger_correlation" | "sentiment_trend";
  title: string;
  description: string;
  confidence: number; // 0-1
  data: any;
}

export interface DayOfWeekPattern {
  day: string;
  avgCravings: number;
  entryCount: number;
  commonFeelings: string[];
  commonTriggers: string[];
}

export interface TimeOfDayPattern {
  hour: number;
  avgCravings: number;
  entryCount: number;
}

export interface TriggerCorrelation {
  trigger: string;
  avgCravings: number;
  frequency: number;
  coOccurringTriggers: string[];
}

export interface SentimentTrend {
  period: string;
  avgSentiment: number; // -1 to 1, negative to positive
  entryCount: number;
}

/**
 * Analyze day-of-week patterns
 */
export function analyzeDayOfWeekPatterns(
  entries: DailyEntry[]
): DayOfWeekPattern[] {
  const dayMap = new Map<string, DailyEntry[]>();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Group entries by day of week
  entries.forEach((entry) => {
    try {
      const date = new Date(entry.entry_date);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date in entry:", entry.entry_date);
        return;
      }
      const dayName = dayNames[date.getDay()];
      if (!dayMap.has(dayName)) {
        dayMap.set(dayName, []);
      }
      dayMap.get(dayName)!.push(entry);
    } catch (error) {
      console.warn("Error processing entry for day-of-week analysis:", error, entry.entry_date);
    }
  });

  // Calculate patterns for each day
  return dayNames.map((day) => {
    const dayEntries = dayMap.get(day) || [];
    const avgCravings =
      dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + (e.cravings_intensity || 0), 0) /
          dayEntries.length
        : 0;

    // Find common feelings
    const feelingCounts = new Map<string, number>();
    dayEntries.forEach((entry) => {
      (entry.feelings || []).forEach((feeling) => {
        feelingCounts.set(feeling, (feelingCounts.get(feeling) || 0) + 1);
      });
    });
    const commonFeelings = Array.from(feelingCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([feeling]) => feeling);

    // Find common triggers
    const triggerCounts = new Map<string, number>();
    dayEntries.forEach((entry) => {
      (entry.triggers || []).forEach((trigger) => {
        triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + 1);
      });
    });
    const commonTriggers = Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);

    return {
      day,
      avgCravings,
      entryCount: dayEntries.length,
      commonFeelings,
      commonTriggers,
    };
  });
}

/**
 * Analyze time-of-day patterns (based on entry creation time if available)
 */
export function analyzeTimeOfDayPatterns(
  entries: DailyEntry[]
): TimeOfDayPattern[] {
  const hourMap = new Map<number, DailyEntry[]>();

  entries.forEach((entry) => {
    try {
      // Use created_at if available, otherwise entry_date
      const timestamp = (entry as any).created_at || entry.entry_date;
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn("Invalid timestamp in entry:", timestamp);
        return;
      }
      const hour = date.getHours();
      if (!hourMap.has(hour)) {
        hourMap.set(hour, []);
      }
      hourMap.get(hour)!.push(entry);
    } catch (error) {
      console.warn("Error processing entry for time-of-day analysis:", error);
    }
  });

  return Array.from({ length: 24 }, (_, hour) => {
    const hourEntries = hourMap.get(hour) || [];
    const avgCravings =
      hourEntries.length > 0
        ? hourEntries.reduce((sum, e) => sum + (e.cravings_intensity || 0), 0) /
          hourEntries.length
        : 0;

    return {
      hour,
      avgCravings,
      entryCount: hourEntries.length,
    };
  });
}

/**
 * Analyze trigger correlations
 */
export function analyzeTriggerCorrelations(
  entries: DailyEntry[]
): TriggerCorrelation[] {
  const triggerMap = new Map<string, { entries: DailyEntry[]; cravings: number[] }>();

  entries.forEach((entry) => {
    (entry.triggers || []).forEach((trigger) => {
      if (!triggerMap.has(trigger)) {
        triggerMap.set(trigger, { entries: [], cravings: [] });
      }
      const data = triggerMap.get(trigger)!;
      data.entries.push(entry);
      if (entry.cravings_intensity !== null) {
        data.cravings.push(entry.cravings_intensity);
      }
    });
  });

  return Array.from(triggerMap.entries()).map(([trigger, data]) => {
    const avgCravings =
      data.cravings.length > 0
        ? data.cravings.reduce((sum, c) => sum + c, 0) / data.cravings.length
        : 0;

    // Find co-occurring triggers
    const coOccurringMap = new Map<string, number>();
    data.entries.forEach((entry) => {
      (entry.triggers || []).forEach((otherTrigger) => {
        if (otherTrigger !== trigger) {
          coOccurringMap.set(
            otherTrigger,
            (coOccurringMap.get(otherTrigger) || 0) + 1
          );
        }
      });
    });
    const coOccurringTriggers = Array.from(coOccurringMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);

    return {
      trigger,
      avgCravings,
      frequency: data.entries.length,
      coOccurringTriggers,
    };
  });
}

/**
 * Analyze sentiment trends (simple sentiment analysis based on feelings and notes)
 */
export function analyzeSentimentTrends(
  entries: DailyEntry[],
  period: "week" | "month" = "week"
): SentimentTrend[] {
  // Simple sentiment mapping
  const positiveFeelings = ["Grateful", "Peaceful", "Hopeful", "Excited", "Content"];
  const negativeFeelings = ["Anxious", "Angry", "Sad", "Tired", "Frustrated"];

  const periodMap = new Map<string, DailyEntry[]>();

  entries.forEach((entry) => {
    try {
      const date = new Date(entry.entry_date);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date in entry:", entry.entry_date);
        return;
      }

      let periodKey: string;

      if (period === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split("T")[0];
      } else {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, []);
      }
      periodMap.get(periodKey)!.push(entry);
    } catch (error) {
      console.warn("Error processing entry date:", error, entry.entry_date);
    }
  });

  return Array.from(periodMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([periodKey, periodEntries]) => {
      let sentimentSum = 0;
      let sentimentCount = 0;

      periodEntries.forEach((entry) => {
        const feelings = entry.feelings || [];
        const positiveCount = feelings.filter((f) =>
          positiveFeelings.includes(f)
        ).length;
        const negativeCount = feelings.filter((f) =>
          negativeFeelings.includes(f)
        ).length;

        if (feelings.length > 0) {
          const sentiment = (positiveCount - negativeCount) / feelings.length;
          sentimentSum += sentiment;
          sentimentCount++;
        }
      });

      const avgSentiment =
        sentimentCount > 0 ? sentimentSum / sentimentCount : 0;

      return {
        period: periodKey,
        avgSentiment,
        entryCount: periodEntries.length,
      };
    });
}

/**
 * Generate insights from patterns
 */
export function generatePatternInsights(
  entries: DailyEntry[]
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  if (entries.length < 7) {
    return insights; // Need at least a week of data
  }

  // Day of week insights
  const dayPatterns = analyzeDayOfWeekPatterns(entries);
  const highestDay = dayPatterns.reduce((max, day) =>
    day.avgCravings > max.avgCravings ? day : max
  );
  if (highestDay && highestDay.entryCount >= 3 && highestDay.avgCravings > 5) {
    insights.push({
      type: "day_of_week",
      title: `Higher cravings on ${highestDay.day}s`,
      description: `Your average craving intensity is ${highestDay.avgCravings.toFixed(1)}/10 on ${highestDay.day}s. Common triggers: ${highestDay.commonTriggers.join(", ") || "none"}`,
      confidence: Math.min(highestDay.entryCount / 10, 1),
      data: highestDay,
    });
  }

  // Trigger correlation insights
  const triggerCorrelations = analyzeTriggerCorrelations(entries);
  const highImpactTriggers = triggerCorrelations.filter(
    (t) => t.avgCravings > 6 && t.frequency >= 3
  );
  if (highImpactTriggers.length > 0) {
    const topTrigger = highImpactTriggers[0];
    insights.push({
      type: "trigger_correlation",
      title: `${topTrigger.trigger} is a high-impact trigger`,
      description: `When ${topTrigger.trigger} occurs, your average craving intensity is ${topTrigger.avgCravings.toFixed(1)}/10. It often co-occurs with: ${topTrigger.coOccurringTriggers.join(", ") || "none"}`,
      confidence: Math.min(topTrigger.frequency / 10, 1),
      data: topTrigger,
    });
  }

  // Sentiment trend insights
  const sentimentTrends = analyzeSentimentTrends(entries, "week");
  if (sentimentTrends.length >= 2) {
    const recent = sentimentTrends[sentimentTrends.length - 1];
    const previous = sentimentTrends[sentimentTrends.length - 2];
    const trend = recent.avgSentiment - previous.avgSentiment;
    if (Math.abs(trend) > 0.2) {
      insights.push({
        type: "sentiment_trend",
        title: trend > 0 ? "Improving mood trend" : "Declining mood trend",
        description: `Your overall mood has ${trend > 0 ? "improved" : "declined"} compared to last week.`,
        confidence: 0.7,
        data: { recent, previous, trend },
      });
    }
  }

  return insights;
}

