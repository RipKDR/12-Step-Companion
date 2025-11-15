import type { CrisisResource } from '@/types';

export const CRISIS_RESOURCES: Record<string, CrisisResource[]> = {
  US: [
    {
      id: '988',
      name: '988 Suicide & Crisis Lifeline',
      phone: '988',
      text: '988',
      description: 'Free, confidential support available 24/7',
      region: 'US',
    },
    {
      id: 'crisis-text',
      name: 'Crisis Text Line',
      text: '741741',
      description: 'Text HOME to 741741 for 24/7 crisis support',
      region: 'US',
    },
    {
      id: 'samhsa',
      name: 'SAMHSA National Helpline',
      phone: '18006624357',
      description: 'Free, confidential treatment referral and information service',
      region: 'US',
    },
    {
      id: 'veterans-crisis',
      name: 'Veterans Crisis Line',
      phone: '18002738255',
      text: '838255',
      description: 'Press 1 for support, text 838255, or chat online',
      region: 'US',
    },
  ],
  AU: [
    {
      id: 'lifeline',
      name: 'Lifeline',
      phone: '131114',
      description: '24/7 crisis support and suicide prevention',
      region: 'AU',
    },
    {
      id: 'beyond-blue',
      name: 'Beyond Blue',
      phone: '1300224636',
      description: 'Depression, anxiety and mental health support',
      region: 'AU',
    },
    {
      id: 'suicide-callback',
      name: 'Suicide Call Back Service',
      phone: '1300659467',
      description: '24/7 suicide prevention counselling',
      region: 'AU',
    },
    {
      id: 'adf',
      name: 'Alcohol & Drug Info Service',
      phone: '1800250015',
      description: '24/7 information and support',
      region: 'AU',
    },
  ],
  UK: [
    {
      id: 'samaritans',
      name: 'Samaritans',
      phone: '116123',
      description: 'Free, confidential support available 24/7',
      region: 'UK',
    },
    {
      id: 'shout',
      name: 'Shout',
      text: '85258',
      description: 'Text SHOUT to 85258 for 24/7 crisis support',
      region: 'UK',
    },
    {
      id: 'mind',
      name: 'Mind Infoline',
      phone: '03001233393',
      description: 'Mental health information and support',
      region: 'UK',
    },
  ],
};

/**
 * Get crisis resources for a specific region
 * @param region - Region code (US, AU, UK, etc.)
 * @returns Array of crisis resources for the region, or US defaults if region not found
 */
export function getCrisisResourcesForRegion(region: string): CrisisResource[] {
  return CRISIS_RESOURCES[region] || CRISIS_RESOURCES['US'];
}

/**
 * Detect user's region from timezone or profile settings
 * @param timezone - User's timezone (e.g., 'Australia/Melbourne', 'America/New_York')
 * @returns Region code (US, AU, UK, etc.)
 */
export function detectRegionFromTimezone(timezone?: string): string {
  if (!timezone) return 'US'; // Default to US
  
  if (timezone.includes('Australia') || timezone.includes('Pacific/Auckland')) {
    return 'AU';
  }
  if (timezone.includes('Europe/London') || timezone.includes('Europe/')) {
    return 'UK';
  }
  if (timezone.includes('America/') || timezone.includes('US/')) {
    return 'US';
  }
  
  return 'US'; // Default to US
}

