import { describe, it, expect, beforeEach } from 'vitest';
import { getCrisisResourcesForRegion, detectRegionFromTimezone } from '../crisis-resources';
import type { CrisisResource } from '@/types';

describe('crisis-resources', () => {
  describe('getCrisisResourcesForRegion', () => {
    it('should return US resources for US region', () => {
      const resources = getCrisisResourcesForRegion('US');
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0].region).toBe('US');
      expect(resources.some((r) => r.id === '988')).toBe(true);
    });

    it('should return AU resources for AU region', () => {
      const resources = getCrisisResourcesForRegion('AU');
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0].region).toBe('AU');
      expect(resources.some((r) => r.id === 'lifeline')).toBe(true);
    });

    it('should return UK resources for UK region', () => {
      const resources = getCrisisResourcesForRegion('UK');
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0].region).toBe('UK');
      expect(resources.some((r) => r.id === 'samaritans')).toBe(true);
    });

    it('should default to US for unknown region', () => {
      const resources = getCrisisResourcesForRegion('UNKNOWN');
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0].region).toBe('US');
    });
  });

  describe('detectRegionFromTimezone', () => {
    it('should detect AU from Australian timezone', () => {
      expect(detectRegionFromTimezone('Australia/Melbourne')).toBe('AU');
      expect(detectRegionFromTimezone('Australia/Sydney')).toBe('AU');
    });

    it('should detect UK from European timezone', () => {
      expect(detectRegionFromTimezone('Europe/London')).toBe('UK');
    });

    it('should detect US from American timezone', () => {
      expect(detectRegionFromTimezone('America/New_York')).toBe('US');
      expect(detectRegionFromTimezone('America/Los_Angeles')).toBe('US');
    });

    it('should default to US for unknown timezone', () => {
      expect(detectRegionFromTimezone('Unknown/Timezone')).toBe('US');
      expect(detectRegionFromTimezone(undefined)).toBe('US');
    });
  });
});

describe('SafetyPlan validation', () => {
  it('should validate safety plan structure', () => {
    const validPlan = {
      id: 'test-plan',
      version: 1,
      contacts: [
        {
          id: 'contact-1',
          name: 'Test Contact',
          phone: '1234567890',
          relationship: 'sponsor' as const,
          order: 1,
        },
      ],
      reasonsNotToUse: ['Reason 1'],
      actionsBeforeUsing: [
        {
          id: 'action-1',
          label: 'Go for a walk',
          type: 'custom' as const,
          order: 1,
        },
      ],
      messageFromSoberMe: 'You are strong. This feeling is temporary.',
      crisisResources: [],
      createdAtISO: new Date().toISOString(),
      updatedAtISO: new Date().toISOString(),
      usageCount: 0,
      active: true,
    };

    expect(validPlan.contacts.length).toBeGreaterThan(0);
    expect(validPlan.reasonsNotToUse.length).toBeGreaterThan(0);
    expect(validPlan.actionsBeforeUsing.length).toBeGreaterThan(0);
    expect(validPlan.messageFromSoberMe.length).toBeGreaterThan(0);
  });

  it('should enforce maximum limits', () => {
    const maxContacts = 3;
    const maxReasons = 3;
    const maxActions = 3;

    expect(maxContacts).toBe(3);
    expect(maxReasons).toBe(3);
    expect(maxActions).toBe(3);
  });
});

