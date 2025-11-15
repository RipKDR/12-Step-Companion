import type {
  CopingToolUsage,
  CopingToolEffectiveness,
  CopingToolRecommendation,
} from '@/types';

export function calculateEffectiveness(
  usages: CopingToolUsage[]
): CopingToolEffectiveness {
  // Filter usages with outcomes
  const usagesWithOutcomes = usages.filter((u) => u.outcome);
  
  if (usagesWithOutcomes.length === 0) {
    return {
      toolName: usages[0]?.toolName || 'unknown',
      totalUses: usages.length,
      betterCount: 0,
      sameCount: 0,
      worseCount: 0,
      effectivenessScore: 0,
      confidenceScore: 0,
      bestContext: {},
      lastUpdatedISO: new Date().toISOString(),
    };
  }
  
  // Count outcomes
  const betterCount = usagesWithOutcomes.filter((u) => u.outcome?.result === 'better').length;
  const sameCount = usagesWithOutcomes.filter((u) => u.outcome?.result === 'same').length;
  const worseCount = usagesWithOutcomes.filter((u) => u.outcome?.result === 'worse').length;
  
  // Calculate effectiveness score (0-2 scale: better=2, same=1, worse=0)
  const effectivenessScore = (betterCount * 2 + sameCount * 1) / usagesWithOutcomes.length;
  
  // Calculate average changes
  const cravingChanges = usagesWithOutcomes
    .map((u) => u.outcome?.cravingChange)
    .filter((c): c is number => c !== undefined);
  const moodChanges = usagesWithOutcomes
    .map((u) => u.outcome?.moodChange)
    .filter((m): m is number => m !== undefined);
  
  const averageCravingChange = cravingChanges.length > 0
    ? cravingChanges.reduce((a, b) => a + b, 0) / cravingChanges.length
    : undefined;
  const averageMoodChange = moodChanges.length > 0
    ? moodChanges.reduce((a, b) => a + b, 0) / moodChanges.length
    : undefined;
  
  // Identify best contexts
  const bestContext = identifyBestContexts(usagesWithOutcomes);
  
  // Calculate confidence score (0-1, based on sample size)
  const confidenceScore = Math.min(1, usagesWithOutcomes.length / 10); // Max confidence at 10+ uses
  
  return {
    toolName: usages[0]?.toolName || 'unknown',
    totalUses: usages.length,
    betterCount,
    sameCount,
    worseCount,
    effectivenessScore,
    averageCravingChange,
    averageMoodChange,
    bestContext,
    confidenceScore,
    lastUpdatedISO: new Date().toISOString(),
  };
}

function identifyBestContexts(usages: CopingToolUsage[]): CopingToolEffectiveness['bestContext'] {
  // Group by outcome result
  const betterUsages = usages.filter((u) => u.outcome?.result === 'better');
  
  // Extract context patterns from successful uses
  const moodRanges: number[] = [];
  const cravingRanges: number[] = [];
  const scenes: string[] = [];
  const triggerTypes: string[] = [];
  
  betterUsages.forEach((usage) => {
    if (usage.context.mood !== undefined) moodRanges.push(usage.context.mood);
    if (usage.context.craving !== undefined) cravingRanges.push(usage.context.craving);
    if (usage.context.sceneId) scenes.push(usage.context.sceneId);
    if (usage.context.triggerType) triggerTypes.push(usage.context.triggerType);
  });
  
  return {
    mood: moodRanges.length > 0 ? [Math.min(...moodRanges), Math.max(...moodRanges)] : undefined,
    craving: cravingRanges.length > 0 ? [Math.min(...cravingRanges), Math.max(...cravingRanges)] : undefined,
    scenes: scenes.length > 0 ? [...new Set(scenes)] : undefined,
    triggerTypes: triggerTypes.length > 0 ? [...new Set(triggerTypes)] : undefined,
  };
}

export function getRecommendations(
  context: { mood?: number; craving?: number; sceneId?: string },
  effectiveness: Record<string, CopingToolEffectiveness>
): CopingToolRecommendation[] {
  const recommendations: CopingToolRecommendation[] = [];
  
  Object.values(effectiveness).forEach((eff) => {
    // Require minimum sample size (3 uses) and confidence
    if (eff.totalUses < 3 || eff.confidenceScore < 0.3) return;
    
    // Check context match - collect all matching contexts
    let contextMatch = false;
    const matchingContexts: string[] = [];
    
    if (context.craving !== undefined && eff.bestContext.craving) {
      const [min, max] = eff.bestContext.craving;
      if (context.craving >= min && context.craving <= max) {
        contextMatch = true;
        matchingContexts.push(`cravings are ${min}-${max}`);
      }
    }
    
    if (context.mood !== undefined && eff.bestContext.mood) {
      const [min, max] = eff.bestContext.mood;
      if (context.mood >= min && context.mood <= max) {
        contextMatch = true;
        matchingContexts.push(`mood is ${min}-${max}`);
      }
    }
    
    if (context.sceneId && eff.bestContext.scenes?.includes(context.sceneId)) {
      contextMatch = true;
      matchingContexts.push('similar situations');
    }
    
    // Build reason from all matching contexts
    let reason = '';
    if (matchingContexts.length > 0) {
      if (matchingContexts.length === 1) {
        reason = `This has helped you before when ${matchingContexts[0]}`;
      } else if (matchingContexts.length === 2) {
        reason = `This has helped you before when ${matchingContexts[0]} and ${matchingContexts[1]}`;
      } else {
        // 3+ contexts: combine with commas and "and"
        const lastContext = matchingContexts.pop();
        reason = `This has helped you before when ${matchingContexts.join(', ')}, and ${lastContext}`;
      }
    } else if (eff.effectivenessScore >= 1.5) {
      // If no context match but tool is effective, still recommend
      reason = `This has helped you ${Math.round((eff.betterCount / eff.totalUses) * 100)}% of the time`;
    }
    
    if (reason) {
      recommendations.push({
        toolName: eff.toolName,
        reason,
        confidence: eff.confidenceScore >= 0.7 ? 'high' : eff.confidenceScore >= 0.4 ? 'medium' : 'low',
        contextMatch,
      });
    }
  });
  
  // Sort by effectiveness score and confidence
  return recommendations.sort((a, b) => {
    const aEff = effectiveness[a.toolName];
    const bEff = effectiveness[b.toolName];
    if (!aEff || !bEff) return 0;
    return bEff.effectivenessScore - aEff.effectivenessScore;
  });
}

export function buildPersonalPlaybook(
  effectiveness: Record<string, CopingToolEffectiveness>
): Record<string, string> {
  const playbook: Record<string, string> = {};
  
  Object.values(effectiveness).forEach((eff) => {
    if (eff.totalUses < 3 || eff.effectivenessScore < 1.5) return;
    
    const contexts: string[] = [];
    if (eff.bestContext.craving) {
      const [min, max] = eff.bestContext.craving;
      contexts.push(`cravings ${min}-${max}`);
    }
    if (eff.bestContext.mood) {
      const [min, max] = eff.bestContext.mood;
      contexts.push(`mood ${min}-${max}`);
    }
    if (eff.bestContext.triggerTypes && eff.bestContext.triggerTypes.length > 0) {
      contexts.push(eff.bestContext.triggerTypes.join(' or '));
    }
    
    if (contexts.length > 0) {
      playbook[eff.toolName] = `When ${contexts.join(' or ')}, try ${eff.toolName}`;
    }
  });
  
  return playbook;
}

