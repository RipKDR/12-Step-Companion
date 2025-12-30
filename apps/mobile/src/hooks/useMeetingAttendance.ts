/**
 * Meeting Attendance Hook
 *
 * Tracks meeting attendance (local storage for now, can be synced later)
 */

import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const ATTENDANCE_KEY = "meeting_attendance";

interface AttendanceRecord {
  meetingId: string;
  date: string;
  attended: boolean;
}

export function useMeetingAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const stored = await SecureStore.getItemAsync(ATTENDANCE_KEY);
      if (stored) {
        setAttendance(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load attendance:", error);
    }
  };

  const markAttendance = async (meetingId: string, date: string, attended: boolean) => {
    try {
      const newRecord: AttendanceRecord = { meetingId, date, attended };
      const updated = [...attendance.filter(
        (a) => !(a.meetingId === meetingId && a.date === date)
      ), newRecord];
      setAttendance(updated);
      await SecureStore.setItemAsync(ATTENDANCE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save attendance:", error);
    }
  };

  const getAttendance = (meetingId: string, date: string) => {
    return attendance.find(
      (a) => a.meetingId === meetingId && a.date === date
    )?.attended || false;
  };

  const getAttendanceStats = () => {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const recent = attendance.filter(
      (a) => new Date(a.date) >= thisWeek && a.attended
    );
    return {
      thisWeek: recent.length,
      total: attendance.filter((a) => a.attended).length,
    };
  };

  return {
    markAttendance,
    getAttendance,
    getAttendanceStats,
    attendance,
  };
}

