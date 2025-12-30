/**
 * Streaks Hook
 *
 * Calculates and manages recovery streaks
 */

import { useMemo } from "react";
import { useDailyEntries } from "./useDailyEntries";
import { useSteps, useStepEntries } from "./useSteps";
import { useRoutines } from "./useRoutines";
import { useMeetingAttendance } from "./useMeetingAttendance";
import { trpc } from "../lib/trpc";
import { differenceInDays, isSameDay, startOfDay } from "date-fns";

export function useStreaks() {
  const { entries: dailyEntries } = useDailyEntries();
  const { entries: stepEntries } = useStepEntries();
  const { routines } = useRoutines();
  const { attendance: meetingAttendance } = useMeetingAttendance();

  // Get routine logs for streak calculation
  const { data: routineLogs } = trpc.routines.getLogs.useQuery({});

  const journalingStreak = useMemo(() => {
    if (!dailyEntries.length) return { current: 0, longest: 0 };

    const sorted = [...dailyEntries]
      .map((e) => startOfDay(new Date(e.entry_date)))
      .sort((a, b) => b.getTime() - a.getTime());

    let current = 0;
    let longest = 0;
    let temp = 0;
    let expectedDate = startOfDay(new Date());

    for (const entryDate of sorted) {
      if (isSameDay(entryDate, expectedDate)) {
        temp++;
        longest = Math.max(longest, temp);
        if (current === 0) current = temp;
        expectedDate = new Date(expectedDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        longest = Math.max(longest, temp);
        temp = 0;
        expectedDate = startOfDay(new Date());
      }
    }

    return { current, longest };
  }, [dailyEntries]);

  const stepWorkStreak = useMemo(() => {
    if (!stepEntries.length) return { current: 0, longest: 0 };

    const sorted = [...stepEntries]
      .map((e) => startOfDay(new Date(e.created_at)))
      .sort((a, b) => b.getTime() - a.getTime());

    let current = 0;
    let longest = 0;
    let temp = 0;
    let expectedDate = startOfDay(new Date());

    for (const entryDate of sorted) {
      if (isSameDay(entryDate, expectedDate)) {
        temp++;
        longest = Math.max(longest, temp);
        if (current === 0) current = temp;
        expectedDate = new Date(expectedDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        longest = Math.max(longest, temp);
        temp = 0;
        expectedDate = startOfDay(new Date());
      }
    }

    return { current, longest };
  }, [stepEntries]);

  const routineStreak = useMemo(() => {
    if (!routineLogs || routineLogs.length === 0) return { current: 0, longest: 0 };

    // Filter to only completed routines
    const completedLogs = routineLogs
      .filter((log) => log.status === "completed")
      .map((log) => startOfDay(new Date(log.run_at)))
      .sort((a, b) => b.getTime() - a.getTime());

    let current = 0;
    let longest = 0;
    let temp = 0;
    let expectedDate = startOfDay(new Date());

    for (const logDate of completedLogs) {
      if (isSameDay(logDate, expectedDate)) {
        temp++;
        longest = Math.max(longest, temp);
        if (current === 0) current = temp;
        expectedDate = new Date(expectedDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        longest = Math.max(longest, temp);
        temp = 0;
        expectedDate = startOfDay(new Date());
      }
    }

    return { current, longest };
  }, [routineLogs]);

  const meetingStreak = useMemo(() => {
    if (!meetingAttendance || meetingAttendance.length === 0) return { current: 0, longest: 0 };

    // Filter to only attended meetings and get unique dates
    const attendedDates = Array.from(
      new Set(
        meetingAttendance
          .filter((a) => a.attended)
          .map((a) => startOfDay(new Date(a.date)))
      )
    ).sort((a, b) => b.getTime() - a.getTime());

    let current = 0;
    let longest = 0;
    let temp = 0;
    let expectedDate = startOfDay(new Date());

    for (const attendanceDate of attendedDates) {
      if (isSameDay(attendanceDate, expectedDate)) {
        temp++;
        longest = Math.max(longest, temp);
        if (current === 0) current = temp;
        expectedDate = new Date(expectedDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        longest = Math.max(longest, temp);
        temp = 0;
        expectedDate = startOfDay(new Date());
      }
    }

    return { current, longest };
  }, [meetingAttendance]);

  return {
    journaling: journalingStreak,
    stepWork: stepWorkStreak,
    routines: routineStreak,
    meetings: meetingStreak,
  };
}

