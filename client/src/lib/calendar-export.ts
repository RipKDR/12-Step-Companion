/**
 * Calendar export utility for meetings
 * Generates .ics (iCalendar) files for importing into calendar apps
 */

import type { Meeting } from '@/types';
import { format } from 'date-fns';

/**
 * Escape text for ICS format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Format date for ICS (YYYYMMDDTHHmmssZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Get next occurrence of a meeting based on day of week and time
 */
function getNextMeetingDate(meeting: Meeting): Date {
  const now = new Date();
  const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
  const [hours, minutes] = meeting.time.split(':').map(Number);
  
  // Create date for this week's occurrence
  const meetingDate = new Date(now);
  meetingDate.setDate(now.getDate() + ((meeting.dayOfWeek - currentDay + 7) % 7));
  meetingDate.setHours(hours, minutes, 0, 0);
  
  // If the meeting time has already passed today, move to next week
  if (meeting.dayOfWeek === currentDay && meetingDate <= now) {
    meetingDate.setDate(meetingDate.getDate() + 7);
  }
  
  return meetingDate;
}

/**
 * Generate ICS content for a single meeting
 */
export function exportMeetingToCalendar(meeting: Meeting): string {
  const startDate = getNextMeetingDate(meeting);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const uid = `meeting-${meeting.id}-${Date.now()}@recovery-companion.app`;
  const summary = escapeICS(meeting.name);
  
  // Build location string
  let location = '';
  if (meeting.location) {
    const parts: string[] = [];
    if (meeting.location.name) parts.push(meeting.location.name);
    if (meeting.location.address) parts.push(meeting.location.address);
    if (meeting.location.city) parts.push(meeting.location.city);
    if (meeting.location.state) parts.push(meeting.location.state);
    location = escapeICS(parts.join(', '));
  } else if (meeting.onlineDetails?.link) {
    location = escapeICS(meeting.onlineDetails.link);
  }
  
  // Build description
  const descriptionParts: string[] = [];
  descriptionParts.push(`${meeting.program} Meeting`);
  descriptionParts.push(`Format: ${meeting.format}`);
  descriptionParts.push(`Type: ${meeting.type}`);
  
  if (meeting.onlineDetails) {
    if (meeting.onlineDetails.link) {
      descriptionParts.push(`Online Link: ${meeting.onlineDetails.link}`);
    }
    if (meeting.onlineDetails.phone) {
      descriptionParts.push(`Phone: ${meeting.onlineDetails.phone}`);
    }
    if (meeting.onlineDetails.accessCode) {
      descriptionParts.push(`Access Code: ${meeting.onlineDetails.accessCode}`);
    }
  }
  
  if (meeting.notes) {
    descriptionParts.push(`Notes: ${meeting.notes}`);
  }
  
  const description = escapeICS(descriptionParts.join('\\n'));
  
  // Generate RRULE for weekly recurrence
  const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${dayNames[meeting.dayOfWeek]}`;
  
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Recovery Companion//Meeting Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${summary}`,
    location ? `LOCATION:${location}` : '',
    `DESCRIPTION:${description}`,
    rrule,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(line => line !== '').join('\r\n');
  
  return ics;
}

/**
 * Generate ICS content for multiple meetings
 */
export function exportMeetingsToCalendar(meetings: Meeting[]): string {
  const events = meetings.map(meeting => {
    const startDate = getNextMeetingDate(meeting);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const uid = `meeting-${meeting.id}-${Date.now()}@recovery-companion.app`;
    const summary = escapeICS(meeting.name);
    
    let location = '';
    if (meeting.location) {
      const parts: string[] = [];
      if (meeting.location.name) parts.push(meeting.location.name);
      if (meeting.location.address) parts.push(meeting.location.address);
      if (meeting.location.city) parts.push(meeting.location.city);
      if (meeting.location.state) parts.push(meeting.location.state);
      location = escapeICS(parts.join(', '));
    } else if (meeting.onlineDetails?.link) {
      location = escapeICS(meeting.onlineDetails.link);
    }
    
    const descriptionParts: string[] = [];
    descriptionParts.push(`${meeting.program} Meeting`);
    descriptionParts.push(`Format: ${meeting.format}`);
    if (meeting.onlineDetails?.link) {
      descriptionParts.push(`Online Link: ${meeting.onlineDetails.link}`);
    }
    const description = escapeICS(descriptionParts.join('\\n'));
    
    const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${dayNames[meeting.dayOfWeek]}`;
    
    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${summary}`,
      location ? `LOCATION:${location}` : '',
      `DESCRIPTION:${description}`,
      rrule,
      'END:VEVENT',
    ].filter(line => line !== '').join('\r\n');
  });
  
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Recovery Companion//Meeting Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
  
  return ics;
}

/**
 * Download ICS file
 */
export function downloadICS(icsContent: string, filename: string = 'meetings.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

