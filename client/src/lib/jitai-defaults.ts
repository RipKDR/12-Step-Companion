import type { JITAIRule } from '@/types';

/**
 * Create sensible default JITAI rules that users can modify
 */
export function createDefaultJITAIRules(): Omit<JITAIRule, 'id' | 'createdAtISO' | 'triggerCount'>[] {
  const now = new Date().toISOString();

  return [
    {
      name: 'High Cravings Alert',
      enabled: true,
      condition: {
        type: 'craving-threshold',
        threshold: 7,
        windowDays: 3,
        operator: 'greater-than',
      },
      action: {
        type: 'show-safety-plan',
        data: '',
        priority: 4,
      },
      explanation: 'I noticed you\'ve logged high cravings 3 nights in a row. Consider reviewing your safety plan.',
    },
    {
      name: 'Low Mood Support',
      enabled: true,
      condition: {
        type: 'mood-trend',
        threshold: 2,
        windowDays: 3,
        operator: 'less-than',
      },
      action: {
        type: 'suggest-meeting',
        data: '',
        priority: 3,
      },
      explanation: 'I noticed your mood has been low for a few days. A meeting might help.',
    },
    {
      name: 'Meeting Reminder',
      enabled: true,
      condition: {
        type: 'meeting-gap',
        threshold: 7,
        windowDays: 7,
        operator: 'greater-than',
      },
      action: {
        type: 'suggest-meeting',
        data: '',
        priority: 2,
      },
      explanation: 'It\'s been a while since your last meeting. Connection is important in recovery.',
    },
    {
      name: 'Isolation Check',
      enabled: true,
      condition: {
        type: 'scene-usage', // Using scene-usage as proxy for isolation (frequent scene use = struggling)
        threshold: 3,
        windowDays: 7,
        operator: 'greater-than',
      },
      action: {
        type: 'suggest-tool',
        data: 'journal',
        priority: 2,
      },
      explanation: 'I noticed you\'ve been using recovery scenes frequently. Journaling might help process what\'s happening.',
    },
  ];
}

