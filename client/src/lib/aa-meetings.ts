/**
 * AA (Alcoholics Anonymous) Meeting Guide integration
 * Handles deep linking to Meeting Guide app and web fallbacks
 */

/**
 * Detect user's region from timezone or return default
 */
export function detectRegion(timezone?: string): string {
  if (!timezone) {
    // Try to detect from browser
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('America/New_York') || tz.includes('America/Chicago') || 
          tz.includes('America/Denver') || tz.includes('America/Los_Angeles')) {
        return 'US';
      }
      if (tz.includes('America/Toronto') || tz.includes('America/Vancouver')) {
        return 'CA';
      }
      if (tz.includes('Europe/London')) {
        return 'UK';
      }
      if (tz.includes('Australia')) {
        return 'AU';
      }
    } catch {
      // Fallback to US
    }
    return 'US';
  }

  // Parse timezone string
  if (timezone.includes('America/New_York') || timezone.includes('America/Chicago') || 
      timezone.includes('America/Denver') || timezone.includes('America/Los_Angeles')) {
    return 'US';
  }
  if (timezone.includes('America/Toronto') || timezone.includes('America/Vancouver')) {
    return 'CA';
  }
  if (timezone.includes('Europe/London')) {
    return 'UK';
  }
  if (timezone.includes('Australia')) {
    return 'AU';
  }

  return 'US'; // Default
}

/**
 * Get AA intergroup website URL for a region
 */
export function getAAIntergroupUrl(region: string = 'US'): string {
  const intergroupUrls: Record<string, string> = {
    US: 'https://www.aa.org/find-aa/meetings',
    CA: 'https://www.aa.org/find-aa/meetings',
    UK: 'https://www.alcoholics-anonymous.org.uk/find-a-meeting',
    AU: 'https://www.aa.org.au/find-a-meeting',
  };

  return intergroupUrls[region] || intergroupUrls.US;
}

/**
 * Attempt to open Meeting Guide app via deep link
 * Falls back to web intergroup URL if app not installed
 */
export function openMeetingGuide(meetingId?: string, region?: string): void {
  const detectedRegion = region || detectRegion();
  
  // Try deep link first (Meeting Guide app)
  const deepLink = meetingId 
    ? `meetingguide://meeting/${meetingId}`
    : 'meetingguide://';
  
  // Create a hidden link to test if app opens
  const link = document.createElement('a');
  link.href = deepLink;
  link.style.display = 'none';
  document.body.appendChild(link);
  
  let appOpened = false;
  const timeout = setTimeout(() => {
    if (!appOpened) {
      // App didn't open, fallback to web
      const webUrl = getAAIntergroupUrl(detectedRegion);
      window.open(webUrl, '_blank');
    }
    document.body.removeChild(link);
  }, 2000);
  
  // Try to open the deep link
  try {
    link.click();
    appOpened = true;
    clearTimeout(timeout);
    document.body.removeChild(link);
  } catch (error) {
    // If click fails, fallback to web
    clearTimeout(timeout);
    document.body.removeChild(link);
    const webUrl = getAAIntergroupUrl(detectedRegion);
    window.open(webUrl, '_blank');
  }
}

/**
 * Check if Meeting Guide app is likely installed
 * This is a best-effort check based on user agent or previous interactions
 */
export function isMeetingGuideInstalled(): boolean {
  // Check if we've stored a flag that user has the app
  try {
    const stored = localStorage.getItem('meeting-guide-installed');
    return stored === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark Meeting Guide app as installed (call this if deep link succeeds)
 */
export function markMeetingGuideInstalled(): void {
  try {
    localStorage.setItem('meeting-guide-installed', 'true');
  } catch {
    // Ignore storage errors
  }
}

