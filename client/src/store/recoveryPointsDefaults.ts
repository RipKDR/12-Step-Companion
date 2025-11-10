import type { RecoveryPointLedger, RecoveryPointReward } from '@/types';

export const defaultRewardsCatalog: Record<string, RecoveryPointReward> = {
  'premium-meditations': {
    id: 'premium-meditations',
    name: 'Premium Meditation Pack',
    description: 'Unlock guided meditations curated by peers in long-term recovery.',
    cost: 150,
    category: 'content',
    available: true,
    tags: ['mindfulness', 'audio'],
  },
  'sober-companion-checkin': {
    id: 'sober-companion-checkin',
    name: 'Companion Check-In Template',
    description: 'Download a structured check-in guide to use with your sponsor or support network.',
    cost: 120,
    category: 'support',
    available: true,
    tags: ['accountability'],
  },
  'breathwork-session': {
    id: 'breathwork-session',
    name: 'Guided Breathwork Audio',
    description: 'Access a premium breathwork session for grounding during cravings.',
    cost: 90,
    category: 'content',
    available: true,
    tags: ['regulation'],
  },
  'gratitude-coaching': {
    id: 'gratitude-coaching',
    name: 'Gratitude Micro-Coaching',
    description: 'Receive a sequence of micro-prompts to deepen your gratitude practice.',
    cost: 110,
    category: 'coaching',
    available: true,
    tags: ['journaling'],
  },
};

export function createInitialRecoveryPoints(): RecoveryPointLedger {
  return {
    balance: {
      current: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
    },
    transactions: {},
    rewards: { ...defaultRewardsCatalog },
    redemptions: {},
  };
}
