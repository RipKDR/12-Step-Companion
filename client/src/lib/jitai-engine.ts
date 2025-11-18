import type {
  DailyCard,
  JournalEntry,
  Meeting,
  RecoveryScene,
  SceneUsage,
  RiskSignal,
  JITAIRule,
} from '@/types';

export interface RiskDetectionContext {
  dailyCards: Record<string, DailyCard>;
  journalEntries: Record<string, JournalEntry>;
  meetings: Meeting[];
  recoveryScenes: Record<string, RecoveryScene>;
  sceneUsages: Record<string, SceneUsage>;
  jitaiRules: Record<string, JITAIRule>;
}

/**
 * Calculate risk score (0-100) based on various factors
 */
export function calculateRiskScore(
  recentCravings: number[],
  recentMood: number[],
  meetingGap: number,
  sceneUsage: number
): number {
  let score = 0;

  // High cravings contribute up to 40 points
  if (recentCravings.length > 0) {
    const avgCraving = recentCravings.reduce((a, b) => a + b, 0) / recentCravings.length;
    score += Math.min(40, (avgCraving / 10) * 40);
  }

  // Low mood contributes up to 30 points
  if (recentMood.length > 0) {
    const avgMood = recentMood.reduce((a, b) => a + b, 0) / recentMood.length;
    // Mood is 1-5, lower is worse, so invert: (6 - avgMood) / 5 * 30
    score += Math.min(30, ((6 - avgMood) / 5) * 30);
  }

  // Meeting gap contributes up to 20 points
  // 7+ days gap = 20 points, linear scale
  score += Math.min(20, (meetingGap / 7) * 20);

  // Frequent scene usage contributes up to 10 points
  // 3+ activations in 7 days = 10 points
  score += Math.min(10, (sceneUsage / 3) * 10);

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Generate user-friendly explanation for a risk signal
 */
export function generateExplanation(
  type: RiskSignal['type'],
  inputs: Record<string, any>
): string {
  switch (type) {
    case 'high-cravings':
      const days = inputs.days || 0;
      const avgCraving = inputs.avgCraving || 0;
      return `I noticed you've logged high cravings (${avgCraving.toFixed(1)}/10) ${days} ${days === 1 ? 'night' : 'nights'} in a row.`;
    
    case 'low-mood':
      const moodDays = inputs.days || 0;
      const avgMood = inputs.avgMood || 0;
      return `I noticed your mood has been low (${avgMood.toFixed(1)}/5) for ${moodDays} ${moodDays === 1 ? 'day' : 'days'} in a row.`;
    
    case 'skipped-meetings':
      const gap = inputs.gapDays || 0;
      return `I noticed it's been ${gap} ${gap === 1 ? 'day' : 'days'} since your last meeting.`;
    
    case 'isolation':
      const isolationDays = inputs.days || 0;
      return `I noticed you haven't journaled in ${isolationDays} ${isolationDays === 1 ? 'day' : 'days'}.`;
    
    case 'trigger-scene':
      const sceneCount = inputs.activationCount || 0;
      return `I noticed you've activated a recovery scene ${sceneCount} ${sceneCount === 1 ? 'time' : 'times'} recently.`;
    
    case 'custom':
      return inputs.explanation || 'A pattern you defined has been detected.';
    
    default:
      return 'A risk pattern has been detected.';
  }
}

/**
 * Match a rule condition against current data
 */
export function matchRule(
  rule: JITAIRule,
  context: RiskDetectionContext
): boolean {
  if (!rule.enabled) return false;

  const { condition } = rule;
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - condition.windowDays);

  switch (condition.type) {
    case 'craving-threshold': {
      const recentCravings: number[] = [];
      Object.values(context.dailyCards).forEach((card) => {
        if (card.middayPulseCheck?.timestampISO) {
          const cardDate = new Date(card.middayPulseCheck.timestampISO);
          if (cardDate >= windowStart) {
            recentCravings.push(card.middayPulseCheck.craving);
          }
        }
      });

      if (recentCravings.length === 0) return false;

      const avgCraving = recentCravings.reduce((a, b) => a + b, 0) / recentCravings.length;
      
      switch (condition.operator) {
        case 'greater-than':
          return avgCraving >= condition.threshold;
        case 'less-than':
          return avgCraving < condition.threshold;
        case 'equals':
          return Math.abs(avgCraving - condition.threshold) < 0.5;
        default:
          return false;
      }
    }

    case 'mood-trend': {
      const recentMoods: number[] = [];
      Object.values(context.dailyCards).forEach((card) => {
        if (card.middayPulseCheck?.timestampISO) {
          const cardDate = new Date(card.middayPulseCheck.timestampISO);
          if (cardDate >= windowStart) {
            recentMoods.push(card.middayPulseCheck.mood);
          }
        }
      });

      if (recentMoods.length < 2) return false;

      switch (condition.operator) {
        case 'trending-down': {
          // Check if mood is decreasing
          const firstHalf = recentMoods.slice(0, Math.floor(recentMoods.length / 2));
          const secondHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          return secondAvg < firstAvg - 0.5; // At least 0.5 point decrease
        }
        case 'trending-up': {
          const firstHalf = recentMoods.slice(0, Math.floor(recentMoods.length / 2));
          const secondHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          return secondAvg > firstAvg + 0.5; // At least 0.5 point increase
        }
        case 'less-than': {
          const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
          return avgMood <= condition.threshold;
        }
        default:
          return false;
      }
    }

    case 'meeting-gap': {
      const meetingsWithDates = context.meetings.filter((m) => m.date)

      if (meetingsWithDates.length === 0) {
        // No meetings ever logged
        const daysSinceStart = Math.floor((now.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceStart >= condition.threshold;
      }

      const sortedMeetings = [...meetingsWithDates].sort(
        (a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime(),
      )
      const lastMeetingDate = new Date(sortedMeetings[0].date as string)
      const daysSinceLastMeeting = Math.floor(
        (now.getTime() - lastMeetingDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (condition.operator) {
        case 'greater-than':
          return daysSinceLastMeeting >= condition.threshold;
        default:
          return false;
      }
    }

    case 'scene-usage': {
      const recentUsages = Object.values(context.sceneUsages).filter((usage) => {
        const usageDate = new Date(usage.activatedAtISO);
        return usageDate >= windowStart;
      });

      switch (condition.operator) {
        case 'greater-than':
          return recentUsages.length >= condition.threshold;
        default:
          return false;
      }
    }

    case 'custom':
      // Custom rules would need custom evaluation logic
      // For now, return false
      return false;

    default:
      return false;
  }
}

/**
 * Detect risk signals by analyzing patterns and matching rules
 */
export function detectRiskSignals(context: RiskDetectionContext): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const now = new Date().toISOString();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Pattern 1: High cravings (3+ days with craving >= 7)
  const recentCravings: Array<{ date: Date; craving: number }> = [];
  Object.values(context.dailyCards).forEach((card) => {
    if (card.middayPulseCheck?.timestampISO) {
      const cardDate = new Date(card.middayPulseCheck.timestampISO);
      if (cardDate >= threeDaysAgo) {
        recentCravings.push({
          date: cardDate,
          craving: card.middayPulseCheck.craving,
        });
      }
    }
  });

  if (recentCravings.length >= 3) {
    const highCravings = recentCravings.filter((c) => c.craving >= 7);
    if (highCravings.length >= 3) {
      const avgCraving = highCravings.reduce((a, b) => a + b.craving, 0) / highCravings.length;
      const severity = calculateRiskScore([avgCraving], [], 0, 0);
      
      signals.push({
        id: `signal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'high-cravings',
        severity,
        detectedAtISO: now,
        inputs: {
          days: highCravings.length,
          avgCraving,
        },
        suggestedActions: ['show-safety-plan', 'suggest-meeting', 'suggest-tool'],
      });
    }
  }

  // Pattern 2: Low mood (3+ days with mood <= 2)
  const recentMoods: Array<{ date: Date; mood: number }> = [];
  Object.values(context.dailyCards).forEach((card) => {
    if (card.middayPulseCheck?.timestampISO) {
      const cardDate = new Date(card.middayPulseCheck.timestampISO);
      if (cardDate >= threeDaysAgo) {
        recentMoods.push({
          date: cardDate,
          mood: card.middayPulseCheck.mood,
        });
      }
    }
  });

  if (recentMoods.length >= 3) {
    const lowMoods = recentMoods.filter((m) => m.mood <= 2);
    if (lowMoods.length >= 3) {
      const avgMood = lowMoods.reduce((a, b) => a + b.mood, 0) / lowMoods.length;
      const severity = calculateRiskScore([], [avgMood], 0, 0);
      
      signals.push({
        id: `signal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'low-mood',
        severity,
        detectedAtISO: now,
        inputs: {
          days: lowMoods.length,
          avgMood,
        },
        suggestedActions: ['show-safety-plan', 'suggest-meeting', 'suggest-tool'],
      });
    }
  }

  // Pattern 3: Skipped meetings (7+ days gap)
  const meetingsWithDates = context.meetings.filter((m) => m.date)

  if (meetingsWithDates.length > 0) {
    const sortedMeetings = [...meetingsWithDates].sort(
      (a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime(),
    )
    const lastMeetingDate = new Date(sortedMeetings[0].date as string)
    const daysSinceLastMeeting = Math.floor(
      (new Date().getTime() - lastMeetingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastMeeting >= 7) {
      const severity = calculateRiskScore([], [], daysSinceLastMeeting, 0);
      
      signals.push({
        id: `signal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'skipped-meetings',
        severity,
        detectedAtISO: now,
        inputs: {
          gapDays: daysSinceLastMeeting,
        },
        suggestedActions: ['suggest-meeting'],
      });
    }
  }

  // Pattern 4: Isolation (no journal entries for 3+ days)
  const recentJournalEntries = Object.values(context.journalEntries).filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= threeDaysAgo;
  });

  if (recentJournalEntries.length === 0) {
    const severity = calculateRiskScore([], [], 0, 0);
    
    signals.push({
      id: `signal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'isolation',
      severity: Math.min(severity + 20, 100), // Boost isolation severity
      detectedAtISO: now,
      inputs: {
        days: Math.floor((new Date().getTime() - threeDaysAgo.getTime()) / (1000 * 60 * 60 * 24)),
      },
      suggestedActions: ['suggest-tool'],
    });
  }

  // Pattern 5: Frequent scene usage (3+ activations in 7 days)
  const recentSceneUsages = Object.values(context.sceneUsages).filter((usage) => {
    const usageDate = new Date(usage.activatedAtISO);
    return usageDate >= sevenDaysAgo;
  });

  if (recentSceneUsages.length >= 3) {
    const severity = calculateRiskScore([], [], 0, recentSceneUsages.length);
    
    signals.push({
      id: `signal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'trigger-scene',
      severity,
      detectedAtISO: now,
      inputs: {
        activationCount: recentSceneUsages.length,
      },
      suggestedActions: ['open-scene'],
    });
  }

  // Match against user-defined rules
  const activeRules = Object.values(context.jitaiRules).filter((rule) => rule.enabled);
  for (const rule of activeRules) {
    if (matchRule(rule, context)) {
      const explanation = generateExplanation('custom', { explanation: rule.explanation });
      const severity = calculateRiskScore([], [], 0, 0); // Rule-based severity could be enhanced
      
      signals.push({
        id: `signal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'custom',
        severity: Math.min(severity + rule.action.priority * 10, 100),
        detectedAtISO: now,
        inputs: {
          ruleId: rule.id,
          explanation: rule.explanation,
        },
        suggestedActions: [rule.action.type],
      });

      // Note: Rule trigger count and lastTriggeredAtISO should be updated via store action
      // This is handled by the store when signals are added
    }
  }

  return signals;
}

