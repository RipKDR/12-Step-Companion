import { describe, it, expect } from 'vitest';
import {
  calculateEffectiveness,
  getRecommendations,
  buildPersonalPlaybook,
} from '../coping-coach';
import type {
  CopingToolUsage,
  CopingToolEffectiveness,
} from '@/types';

describe('coping-coach', () => {
  describe('calculateEffectiveness', () => {
    it('should return default values when no usages with outcomes', () => {
      const usages: CopingToolUsage[] = [
        {
          id: '1',
          toolName: 'breathing',
          usedAtISO: new Date().toISOString(),
          context: { mood: 3, craving: 5 },
        },
      ];

      const result = calculateEffectiveness(usages);

      expect(result.toolName).toBe('breathing');
      expect(result.totalUses).toBe(1);
      expect(result.betterCount).toBe(0);
      expect(result.effectivenessScore).toBe(0);
      expect(result.confidenceScore).toBe(0);
    });

    it('should calculate effectiveness score correctly', () => {
      const usages: CopingToolUsage[] = [
        {
          id: '1',
          toolName: 'breathing',
          usedAtISO: new Date().toISOString(),
          context: { mood: 3, craving: 5 },
          outcome: {
            checkedAtISO: new Date().toISOString(),
            result: 'better',
            cravingChange: -3,
          },
        },
        {
          id: '2',
          toolName: 'breathing',
          usedAtISO: new Date().toISOString(),
          context: { mood: 2, craving: 7 },
          outcome: {
            checkedAtISO: new Date().toISOString(),
            result: 'same',
          },
        },
        {
          id: '3',
          toolName: 'breathing',
          usedAtISO: new Date().toISOString(),
          context: { mood: 4, craving: 6 },
          outcome: {
            checkedAtISO: new Date().toISOString(),
            result: 'better',
            cravingChange: -2,
          },
        },
      ];

      const result = calculateEffectiveness(usages);

      expect(result.totalUses).toBe(3);
      expect(result.betterCount).toBe(2);
      expect(result.sameCount).toBe(1);
      expect(result.worseCount).toBe(0);
      // Effectiveness: (2 * 2 + 1 * 1) / 3 = 5/3 ≈ 1.67
      expect(result.effectivenessScore).toBeCloseTo(1.67, 2);
      expect(result.averageCravingChange).toBe(-2.5);
    });

    it('should identify best contexts from successful uses', () => {
      const usages: CopingToolUsage[] = [
        {
          id: '1',
          toolName: 'breathing',
          usedAtISO: new Date().toISOString(),
          context: { mood: 3, craving: 5, triggerType: 'stress' },
          outcome: {
            checkedAtISO: new Date().toISOString(),
            result: 'better',
          },
        },
        {
          id: '2',
          toolName: 'breathing',
          usedAtISO: new Date().toISOString(),
          context: { mood: 2, craving: 7, triggerType: 'stress' },
          outcome: {
            checkedAtISO: new Date().toISOString(),
            result: 'better',
          },
        },
      ];

      const result = calculateEffectiveness(usages);

      expect(result.bestContext.mood).toEqual([2, 3]);
      expect(result.bestContext.craving).toEqual([5, 7]);
      expect(result.bestContext.triggerTypes).toContain('stress');
    });
  });

  describe('getRecommendations', () => {
    it('should return empty array when no effectiveness data', () => {
      const recommendations = getRecommendations(
        { mood: 3, craving: 5 },
        {}
      );

      expect(recommendations).toEqual([]);
    });

    it('should recommend tools based on context match', () => {
      const effectiveness: Record<string, CopingToolEffectiveness> = {
        breathing: {
          toolName: 'breathing',
          totalUses: 5,
          betterCount: 4,
          sameCount: 1,
          worseCount: 0,
          effectivenessScore: 1.8,
          bestContext: {
            craving: [5, 8],
          },
          confidenceScore: 0.5,
          lastUpdatedISO: new Date().toISOString(),
        },
      };

      const recommendations = getRecommendations(
        { craving: 6 },
        effectiveness
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].toolName).toBe('breathing');
      expect(recommendations[0].contextMatch).toBe(true);
      expect(recommendations[0].reason).toContain('cravings are 5-8');
    });

    it('should combine multiple matching contexts in reason', () => {
      const effectiveness: Record<string, CopingToolEffectiveness> = {
        breathing: {
          toolName: 'breathing',
          totalUses: 5,
          betterCount: 4,
          sameCount: 1,
          worseCount: 0,
          effectivenessScore: 1.8,
          bestContext: {
            craving: [5, 8],
            mood: [2, 4],
          },
          confidenceScore: 0.5,
          lastUpdatedISO: new Date().toISOString(),
        },
      };

      const recommendations = getRecommendations(
        { craving: 6, mood: 3 },
        effectiveness
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].toolName).toBe('breathing');
      expect(recommendations[0].contextMatch).toBe(true);
      expect(recommendations[0].reason).toContain('cravings are 5-8');
      expect(recommendations[0].reason).toContain('mood is 2-4');
      expect(recommendations[0].reason).toContain('and');
    });

    it('should not recommend tools with low sample size', () => {
      const effectiveness: Record<string, CopingToolEffectiveness> = {
        breathing: {
          toolName: 'breathing',
          totalUses: 2, // Below minimum of 3
          betterCount: 2,
          sameCount: 0,
          worseCount: 0,
          effectivenessScore: 2.0,
          bestContext: {},
          confidenceScore: 0.2,
          lastUpdatedISO: new Date().toISOString(),
        },
      };

      const recommendations = getRecommendations(
        { craving: 6 },
        effectiveness
      );

      expect(recommendations).toEqual([]);
    });
  });

  describe('buildPersonalPlaybook', () => {
    it('should build playbook from effective tools', () => {
      const effectiveness: Record<string, CopingToolEffectiveness> = {
        breathing: {
          toolName: 'breathing',
          totalUses: 5,
          betterCount: 4,
          sameCount: 1,
          worseCount: 0,
          effectivenessScore: 1.8,
          bestContext: {
            craving: [5, 8],
            triggerTypes: ['stress'],
          },
          confidenceScore: 0.5,
          lastUpdatedISO: new Date().toISOString(),
        },
      };

      const playbook = buildPersonalPlaybook(effectiveness);

      expect(Object.keys(playbook).length).toBeGreaterThan(0);
      expect(playbook['breathing']).toContain('breathing');
      expect(playbook['breathing']).toContain('cravings 5-8');
    });

    it('should exclude tools with low effectiveness', () => {
      const effectiveness: Record<string, CopingToolEffectiveness> = {
        breathing: {
          toolName: 'breathing',
          totalUses: 5,
          betterCount: 1,
          sameCount: 1,
          worseCount: 3,
          effectivenessScore: 0.6, // Below threshold of 1.5
          bestContext: {},
          confidenceScore: 0.5,
          lastUpdatedISO: new Date().toISOString(),
        },
      };

      const playbook = buildPersonalPlaybook(effectiveness);

      expect(Object.keys(playbook).length).toBe(0);
    });
  });
});

