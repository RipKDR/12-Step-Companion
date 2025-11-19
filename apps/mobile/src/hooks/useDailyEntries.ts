/**
 * Daily Entries Hook for Mobile - tRPC Integration
 */

import { trpc } from "../lib/trpc";
import { useMemo } from "react";

export function useDailyEntries(options?: {
  startDate?: Date;
  endDate?: Date;
}) {
  const { data: entries, isLoading, error } = trpc.dailyEntries.getAll.useQuery({
    startDate: options?.startDate,
    endDate: options?.endDate,
  });

  return {
    entries: entries || [],
    isLoading,
    error,
  };
}

export function useDailyEntry(date: Date) {
  const { data: entry, isLoading, error } = trpc.dailyEntries.getByDate.useQuery({
    date,
  });

  return {
    entry,
    isLoading,
    error,
  };
}

export function useTodaysEntry(timezone: string = "UTC") {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  }, [timezone]);

  return useDailyEntry(today);
}

export function useWeeklyEntries(timezone: string = "UTC") {
  const weekStart = useMemo(() => {
    const now = new Date();
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const day = tzDate.getDay();
    const diff = tzDate.getDate() - day;
    return new Date(tzDate.setDate(diff));
  }, [timezone]);

  const weekEnd = useMemo(() => {
    return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  }, [weekStart]);

  return useDailyEntries({
    startDate: weekStart,
    endDate: weekEnd,
  });
}

export function useUpsertDailyEntry() {
  const utils = trpc.useUtils();

  const mutation = trpc.dailyEntries.upsert.useMutation({
    onSuccess: () => {
      utils.dailyEntries.getAll.invalidate();
      utils.dailyEntries.getByDate.invalidate();
    },
  });

  return mutation;
}

