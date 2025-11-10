import type { ResetPlan } from '@/types';

export const createDefaultResetPlan = (): ResetPlan => {
  const timestamp = new Date().toISOString();

  return {
    id: 'reset-plan',
    createdAtISO: timestamp,
    updatedAtISO: timestamp,
    checkInActions: [
      'Reach out to your sponsor or trusted support person within the next hour.',
      'Add a meeting or recovery touchpoint to your calendar in the next 24 hours.',
      'Write a brief reflection about what you learned and one need you can meet compassionately.',
    ],
    groundingActions: [
      'Pause for five grounding breaths while naming three things you can see, hear, and feel.',
      'Drink water, eat something nourishing, and move your body for at least five minutes.',
      'Review your top coping tools and choose one you can practice right now.',
    ],
    growthCommitments: [
      'Identify one boundary or routine you can reinforce this week.',
      'Schedule one joy or connection activity to refill your cup.',
    ],
    implementationIntentionTemplate:
      'If I notice cravings building, then I will pause, ground myself with three breaths, and text my sponsor for support.',
    selfCompassionReminder:
      'Slips happen to many people in recovery. This is data, not defeat. You are worthy of patience, support, and a fresh start.',
  };
};
