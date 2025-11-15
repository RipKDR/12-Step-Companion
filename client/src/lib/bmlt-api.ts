/**
 * BMLT (Basic Meeting List Tool) API integration
 * Handles searching for NA meetings via BMLT Semantic API
 */

import type { Meeting, MeetingSearchFilters, BMLTConfig, MeetingCache } from '@/types';
import { calculateDistance, type LocationCoordinates } from './location';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on authentication errors or client errors (4xx)
      if (error instanceof Error) {
        if (error.message.includes('authentication') || 
            error.message.includes('401') || 
            error.message.includes('403') ||
            error.message.includes('404')) {
          throw error;
        }
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: delay = initialDelay * 2^attempt
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Failed after retries');
}

/**
 * BMLT API response structure (simplified)
 */
interface BMLTMeetingResponse {
  id_bigint: string;
  meeting_name: string;
  weekday_tinyint: string; // 1-7 (Sunday=1, Monday=2, etc.)
  start_time: string; // HH:MM format
  duration_time: string; // HH:MM format
  location_text: string;
  location_street: string;
  location_city_subsection?: string;
  location_municipality: string;
  location_province?: string;
  location_postal_code_1?: string;
  location_nation: string;
  latitude: string;
  longitude: string;
  format_shared_id_list: string; // Comma-separated format IDs
  service_body_bigint: string;
  comments?: string;
  virtual_meeting_link?: string;
  phone_meeting_number?: string;
  virtual_meeting_additional_info?: string;
}

/**
 * Transform BMLT format ID to meeting format
 */
function mapBMLTFormat(formatId: string): Meeting['format'] {
  // BMLT format IDs (common ones):
  // 4 = In-person
  // 7 = Online
  // 8 = Hybrid
  const id = parseInt(formatId, 10);
  if (id === 7) return 'online';
  if (id === 8) return 'hybrid';
  return 'in-person';
}

/**
 * Transform BMLT format IDs to meeting type
 */
function mapBMLTType(formatIds: string): Meeting['type'] {
  // BMLT format IDs for meeting types:
  // 17 = Open
  // 18 = Closed
  // 19 = Speaker
  // 20 = Discussion
  // 21 = Step Study
  const ids = formatIds.split(',').map(id => parseInt(id.trim(), 10));
  
  if (ids.includes(21)) return 'step-study';
  if (ids.includes(19)) return 'speaker';
  if (ids.includes(20)) return 'discussion';
  if (ids.includes(18)) return 'closed';
  if (ids.includes(17)) return 'open';
  
  return 'other';
}

/**
 * Transform BMLT weekday (1-7, Sunday=1) to JavaScript dayOfWeek (0-6, Sunday=0)
 */
function mapBMLTWeekday(bmltDay: string): number {
  const day = parseInt(bmltDay, 10);
  return day === 7 ? 0 : day; // BMLT Sunday=1, JS Sunday=0
}

/**
 * Transform BMLT API response to Meeting format
 */
function transformBMLTMeeting(
  bmltMeeting: BMLTMeetingResponse,
  userLocation?: LocationCoordinates
): Meeting {
  const lat = parseFloat(bmltMeeting.latitude);
  const lng = parseFloat(bmltMeeting.longitude);
  const formatIds = bmltMeeting.format_shared_id_list || '';
  const formats = formatIds.split(',').map(id => id.trim());
  
  // Determine format (prioritize hybrid, then online, then in-person)
  let format: Meeting['format'] = 'in-person';
  if (formats.includes('8')) format = 'hybrid';
  else if (formats.includes('7')) format = 'online';
  
  const meeting: Meeting = {
    id: `bmlt_${bmltMeeting.id_bigint}`,
    name: bmltMeeting.meeting_name || 'NA Meeting',
    dayOfWeek: mapBMLTWeekday(bmltMeeting.weekday_tinyint),
    time: bmltMeeting.start_time || '00:00',
    format,
    type: mapBMLTType(formatIds),
    program: 'NA',
    source: 'bmlt',
    sourceId: bmltMeeting.id_bigint,
    isFavorite: false,
    reminderEnabled: false,
    reminderMinutesBefore: 30,
    createdAtISO: new Date().toISOString(),
    updatedAtISO: new Date().toISOString(),
  };

  // Add location details
  if (lat && lng) {
    meeting.location = {
      name: bmltMeeting.location_text || '',
      address: bmltMeeting.location_street || '',
      city: bmltMeeting.location_municipality || '',
      state: bmltMeeting.location_province,
      zip: bmltMeeting.location_postal_code_1,
      country: bmltMeeting.location_nation || 'US',
      lat,
      lng,
    };

    // Calculate distance if user location provided
    if (userLocation) {
      meeting.distanceKm = calculateDistance(userLocation, { lat, lng });
    }
  }

  // Add online details if virtual meeting
  if (format === 'online' || format === 'hybrid') {
    meeting.onlineDetails = {
      platform: 'other',
      link: bmltMeeting.virtual_meeting_link,
      phone: bmltMeeting.phone_meeting_number,
      accessCode: bmltMeeting.virtual_meeting_additional_info,
    };
  }

  // Add notes
  if (bmltMeeting.comments) {
    meeting.notes = bmltMeeting.comments;
  }

  return meeting;
}

/**
 * Search for BMLT meetings near a location
 */
export async function searchBMLTMeetings(
  config: BMLTConfig,
  location: LocationCoordinates,
  radiusKm: number = 25,
  filters?: MeetingSearchFilters
): Promise<Meeting[]> {
  if (!config.apiRoot) {
    throw new Error('BMLT API root not configured. Please set up your BMLT API root in Settings.');
  }

  // Validate location
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number' ||
      isNaN(location.lat) || isNaN(location.lng)) {
    throw new Error('Invalid location coordinates');
  }

  // Validate radius
  if (radiusKm <= 0 || radiusKm > 100) {
    throw new Error('Search radius must be between 1 and 100 km');
  }

  try {
    // Build API URL
    const url = new URL(`${config.apiRoot}/client_interface/json/`);
    url.searchParams.set('switcher', 'GetSearchResults');
    url.searchParams.set('geo_width', radiusKm.toString());
    url.searchParams.set('geo_lat', location.lat.toString());
    url.searchParams.set('geo_lng', location.lng.toString());
    
    // Add format filters if specified
    if (filters?.format && filters.format.length > 0) {
      // Map our format types to BMLT format IDs
      filters.format.forEach(format => {
        if (format === 'online') url.searchParams.append('formats[]', '7');
        if (format === 'hybrid') url.searchParams.append('formats[]', '8');
        if (format === 'in-person') url.searchParams.append('formats[]', '4');
      });
    }

    // Add API key if provided
    const headers: HeadersInit = {};
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      // Some BMLT servers use query parameter instead
      url.searchParams.set('key', config.apiKey);
    }

    // Retry logic with exponential backoff
    const response = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return res;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            throw new Error('BMLT API request timed out. Please try again.');
          }
          throw new Error(`Network error: ${fetchError.message}`);
        }
        throw new Error('Failed to connect to BMLT API');
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('BMLT API authentication failed. Please check your API key in Settings.');
      }
      if (response.status === 404) {
        throw new Error('BMLT API endpoint not found. Please verify your API root URL.');
      }
      throw new Error(`BMLT API error: ${response.status} ${response.statusText}`);
    }

    let data: BMLTMeetingResponse[];
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid JSON response from BMLT API');
    }
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid BMLT API response format');
    }

    // Transform to Meeting format
    const meetings = data.map(meeting => transformBMLTMeeting(meeting, location));

    // Apply filters
    let filteredMeetings = meetings;

    if (filters) {
      // Filter by program (already filtered by source='bmlt' = NA)
      if (filters.program === 'AA') {
        return []; // BMLT is for NA only
      }

      // Filter by day of week
      if (filters.dayOfWeek && filters.dayOfWeek.length > 0) {
        filteredMeetings = filteredMeetings.filter(m =>
          filters.dayOfWeek!.includes(m.dayOfWeek)
        );
      }

      // Filter by time range
      if (filters.timeRange) {
        filteredMeetings = filteredMeetings.filter(m => {
          const meetingTime = m.time;
          const { start, end } = filters.timeRange!;
          return meetingTime >= start && meetingTime <= end;
        });
      }

      // Filter by type
      if (filters.type && filters.type.length > 0) {
        filteredMeetings = filteredMeetings.filter(m =>
          filters.type!.includes(m.type)
        );
      }

      // Filter by max distance
      if (filters.maxDistanceKm) {
        filteredMeetings = filteredMeetings.filter(m =>
          !m.distanceKm || m.distanceKm <= filters.maxDistanceKm!
        );
      }

      // Filter "starts soon" (<60 minutes)
      if (filters.startsSoon) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const oneHourLaterTime = `${String(oneHourLater.getHours()).padStart(2, '0')}:${String(oneHourLater.getMinutes()).padStart(2, '0')}`;

        filteredMeetings = filteredMeetings.filter(m => {
          if (m.dayOfWeek !== currentDay) return false;
          return m.time >= currentTime && m.time <= oneHourLaterTime;
        });
      }
    }

    // Sort by distance if available
    filteredMeetings.sort((a, b) => {
      if (a.distanceKm && b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm) return -1;
      if (b.distanceKm) return 1;
      return 0;
    });

    return filteredMeetings;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    }
    console.error('Error searching BMLT meetings:', error);
    throw new Error('An unexpected error occurred while searching for meetings');
  }
}

/**
 * Cache meetings locally with expiration
 */
export function cacheBMLTMeetings(
  meetings: Meeting[],
  location: LocationCoordinates,
  radiusKm: number
): MeetingCache {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

  return {
    meetings,
    cachedAtISO: now.toISOString(),
    expiresAtISO: expiresAt.toISOString(),
    location,
    radiusKm,
  };
}

/**
 * Check if cache is still valid
 */
export function isCacheValid(cache: MeetingCache | undefined): boolean {
  if (!cache) return false;
  
  const now = new Date();
  const expiresAt = new Date(cache.expiresAtISO);
  
  return now < expiresAt;
}

/**
 * Get cached meetings if still valid
 */
export function getCachedMeetings(
  cache: MeetingCache | undefined,
  location: LocationCoordinates,
  radiusKm: number,
  maxDistanceDiff: number = 5 // Allow 5km difference in location
): Meeting[] | null {
  if (!cache) {
    return null;
  }

  if (!isCacheValid(cache)) {
    return null;
  }

  // Check if location is similar enough
  if (cache.location) {
    const distanceDiff = Math.abs(
      Math.sqrt(
        Math.pow(cache.location.lat - location.lat, 2) +
        Math.pow(cache.location.lng - location.lng, 2)
      ) * 111 // Rough conversion to km
    );

    if (distanceDiff > maxDistanceDiff || Math.abs(cache.radiusKm - radiusKm) > 10) {
      return null; // Location changed significantly
    }
  }

  return cache.meetings;
}

