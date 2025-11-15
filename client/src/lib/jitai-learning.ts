import type {
  JITAIRule,
  InterventionFeedback,
} from '@/types';

/**
 * Calculate effectiveness score for a rule based on feedback
 */
export function updateRuleEffectiveness(
  ruleId: string,
  feedback: InterventionFeedback[]
): number {
  const ruleFeedback = feedback.filter((f) => f.ruleId === ruleId);

  if (ruleFeedback.length === 0) {
    return 0;
  }

  const helpfulCount = ruleFeedback.filter((f) => f.helpful).length;
  const effectivenessScore = Math.round((helpfulCount / ruleFeedback.length) * 100);

  return effectivenessScore;
}

/**
 * Get effectiveness score for a specific action
 */
export function getActionEffectiveness(
  actionId: string,
  feedback: InterventionFeedback[]
): number {
  const actionFeedback = feedback.filter((f) => f.interventionType === actionId);

  if (actionFeedback.length === 0) {
    return 0;
  }

  const helpfulCount = actionFeedback.filter((f) => f.helpful).length;
  return Math.round((helpfulCount / actionFeedback.length) * 100);
}

/**
 * Personalize suggestions based on what has worked before
 */
export function personalizeSuggestions(
  context: { mood?: number; craving?: number; scene?: string },
  rules: JITAIRule[],
  feedback: InterventionFeedback[]
): string[] {
  // Get active rules that match the context
  const matchingRules = rules.filter((rule) => {
    if (!rule.enabled) return false;

    // Simple context matching - could be enhanced
    if (context.craving !== undefined && rule.condition.type === 'craving-threshold') {
      return true;
    }
    if (context.mood !== undefined && rule.condition.type === 'mood-trend') {
      return true;
    }
    if (context.scene && rule.action.type === 'open-scene') {
      return true;
    }

    return true; // Default: include all active rules
  });

  // Sort by effectiveness score (higher is better)
  const sortedRules = matchingRules.sort((a, b) => {
    const scoreA = a.effectivenessScore ?? 0;
    const scoreB = b.effectivenessScore ?? 0;
    return scoreB - scoreA;
  });

  // Extract suggested actions, prioritizing effective ones
  const suggestions: string[] = [];
  const seenActions = new Set<string>();

  for (const rule of sortedRules) {
    const action = rule.action.type;
    if (!seenActions.has(action)) {
      suggestions.push(action);
      seenActions.add(action);
    }
  }

  // If no rules match, return default suggestions
  if (suggestions.length === 0) {
    return ['show-safety-plan', 'suggest-meeting'];
  }

  return suggestions;
}

