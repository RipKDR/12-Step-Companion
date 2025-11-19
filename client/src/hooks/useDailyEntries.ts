/**
 * Daily Entries Hook - tRPC Integration Example
 * 
 * Example hook showing how to use tRPC for daily entries
 */

import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import { format, startOfDay, endOfDay } from "date-fns";

/**
 * Get all daily entries (optionally filtered by date range)
 */
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

/**
 * Get daily entry for a specific date
 */
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

/**
 * Get today's entry
 */
export function useTodaysEntry(timezone: string = "UTC") {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  }, [timezone]);

  return useDailyEntry(today);
}

/**
 * Mutation hook for creating/updating daily entry
 */
export function useUpsertDailyEntry() {
  const utils = trpc.useUtils();

  const mutation = trpc.dailyEntries.upsert.useMutation({
    onSuccess: () => {
      // Invalidate and refetch daily entries
      utils.dailyEntries.getAll.invalidate();
      utils.dailyEntries.getByDate.invalidate();
    },
  });

  return mutation;
}

/**
 * Delete daily entry mutation
 */
export function useDeleteDailyEntry() {
  const utils = trpc.useUtils();

  const mutation = trpc.dailyEntries.delete.useMutation({
    onSuccess: () => {
      utils.dailyEntries.getAll.invalidate();
    },
  });

  return mutation;
}

/**
 * Get entries for current week
 */
export function useWeeklyEntries(timezone: string = "UTC") {
  const weekStart = useMemo(() => {
    const now = new Date();
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const day = tzDate.getDay();
    const diff = tzDate.getDate() - day; // Sunday = 0
    return startOfDay(new Date(tzDate.setDate(diff)));
  }, [timezone]);

  const weekEnd = useMemo(() => {
    return endOfDay(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
  }, [weekStart]);

  return useDailyEntries({
    startDate: weekStart,
    endDate: weekEnd,
  });
}

