export interface SobrietyTime {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
}

/**
 * Calculate sobriety time from clean date to now
 * Handles DST transitions correctly by using actual time difference
 */
export function calculateSobriety(cleanDateISO: string): SobrietyTime {
  const cleanDate = new Date(cleanDateISO);
  const now = new Date();
  
  // Calculate total difference in milliseconds
  const diffMs = now.getTime() - cleanDate.getTime();
  
  // Convert to various units
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Calculate display units
  const minutes = totalMinutes % 60;
  const hours = totalHours % 24;
  const days = totalDays % 365;
  const years = Math.floor(totalDays / 365);
  
  return {
    years,
    days,
    hours,
    minutes,
    totalDays,
    totalHours,
    totalMinutes,
  };
}

/**
 * Format a date/time for display in a specific timezone
 */
export function formatDateTime(
  dateISO: string,
  timezone: string = 'Australia/Melbourne',
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateISO);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-AU', defaultOptions).format(date);
}

/**
 * Get relative time description (e.g., "3d 4h ago")
 */
export function getRelativeTime(dateISO: string): string {
  const sobriety = calculateSobriety(dateISO);
  
  if (sobriety.years > 0) {
    return `${sobriety.years}y ${sobriety.days}d`;
  }
  if (sobriety.totalDays > 0) {
    return `${sobriety.totalDays}d ${sobriety.hours}h`;
  }
  if (sobriety.totalHours > 0) {
    return `${sobriety.totalHours}h ${sobriety.minutes}m`;
  }
  return `${sobriety.totalMinutes}m`;
}

/**
 * Get today's date in YYYY-MM-DD format for the given timezone
 */
export function getTodayDate(timezone: string = 'Australia/Melbourne'): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  return formatter.format(now); // Returns YYYY-MM-DD
}

/**
 * Detect user's timezone
 */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Australia/Melbourne'; // Fallback
  }
}
