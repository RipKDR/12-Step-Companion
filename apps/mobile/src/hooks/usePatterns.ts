/**
 * Patterns Hook
 *
 * React hook for pattern recognition and insights
 */

import { useMemo } from "react";
import { useDailyEntries } from "./useDailyEntries";
import {
  generatePatternInsights,
  analyzeDayOfWeekPatterns,
  analyzeTimeOfDayPatterns,
  analyzeTriggerCorrelations,
  analyzeSentimentTrends,
  PatternInsight,
  DayOfWeekPattern,
  TimeOfDayPattern,
  TriggerCorrelation,
  SentimentTrend,
} from "../lib/pattern-analysis";

export function usePatterns() {
  // Get entries from last 90 days for pattern analysis
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const { entries, isLoading } = useDailyEntries({
    startDate,
    endDate,
  });

  const insights = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return generatePatternInsights(entries);
  }, [entries]);

  const dayOfWeekPatterns = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return analyzeDayOfWeekPatterns(entries);
  }, [entries]);

  const timeOfDayPatterns = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return analyzeTimeOfDayPatterns(entries);
  }, [entries]);

  const triggerCorrelations = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return analyzeTriggerCorrelations(entries);
  }, [entries]);

  const sentimentTrends = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return analyzeSentimentTrends(entries, "week");
  }, [entries]);

  return {
    insights,
    dayOfWeekPatterns,
    timeOfDayPatterns,
    triggerCorrelations,
    sentimentTrends,
    isLoading,
    entryCount: entries?.length || 0,
  };
}

