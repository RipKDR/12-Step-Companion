import type { Pattern, JournalEntry, StepAnswer, DailyCard, CopilotContext } from '@/types';
import { buildPatternDetectionPrompt } from './copilot-prompts';

/**
 * Detects patterns in journal entries and step work
 */
export async function detectPatterns(
  context: CopilotContext
): Promise<Pattern[]> {
  const prompt = buildPatternDetectionPrompt(context);

  try {
    const response = await fetch('/api/ai-sponsor/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        conversationHistory: [],
        userContext: {},
        promptType: 'pattern-detection',
        contextWindow: context,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.response || 'Failed to detect patterns');
    }

    const data = await response.json();
    const patternsText = data.response || '';

    return parsePatternsResponse(patternsText);
  } catch (error) {
    console.error('Error detecting patterns:', error);
    throw error;
  }
}

/**
 * Detects mood patterns from daily cards
 */
export function detectMoodPatterns(
  dailyCards: Record<string, DailyCard>
): Pattern[] {
  const patterns: Pattern[] = [];
  const moodData: number[] = [];

  // Collect mood data
  Object.values(dailyCards).forEach((card) => {
    if (card.middayPulseCheck?.mood) {
      moodData.push(card.middayPulseCheck.mood);
    }
  });

  if (moodData.length < 3) {
    return patterns; // Need at least 3 data points
  }

  // Calculate average mood
  const avgMood = moodData.reduce((a, b) => a + b, 0) / moodData.length;

  // Detect low mood days
  const lowMoodDays = moodData.filter((m) => m <= 2).length;
  if (lowMoodDays >= moodData.length * 0.3) {
    patterns.push({
      id: `pattern_mood_low_${Date.now()}`,
      type: 'mood',
      description: `You've had ${lowMoodDays} low mood days (mood ≤ 2) out of ${moodData.length} tracked days`,
      frequency: lowMoodDays,
      examples: [],
      detectedAtISO: new Date().toISOString(),
    });
  }

  // Detect improving trend
  if (moodData.length >= 7) {
    const firstHalf = moodData.slice(0, Math.floor(moodData.length / 2));
    const secondHalf = moodData.slice(Math.floor(moodData.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.5) {
      patterns.push({
        id: `pattern_mood_improving_${Date.now()}`,
        type: 'mood',
        description: `Your mood has been improving over time (from ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)} average)`,
        frequency: moodData.length,
        examples: [],
        detectedAtISO: new Date().toISOString(),
      });
    }
  }

  return patterns;
}

/**
 * Detects trigger patterns from journal entries
 */
export function detectTriggerPatterns(
  journalEntries: Record<string, JournalEntry>
): Pattern[] {
  const patterns: Pattern[] = [];
  const triggerEntries = Object.values(journalEntries).filter((entry) => entry.isTrigger);

  if (triggerEntries.length === 0) {
    return patterns;
  }

  // Group by trigger type
  const triggerTypes: Record<string, JournalEntry[]> = {};
  triggerEntries.forEach((entry) => {
    const type = entry.triggerType || 'Unknown';
    if (!triggerTypes[type]) {
      triggerTypes[type] = [];
    }
    triggerTypes[type].push(entry);
  });

  // Create patterns for recurring triggers
  Object.entries(triggerTypes).forEach(([type, entries]) => {
    if (entries.length >= 2) {
      const avgIntensity = entries.reduce((sum, e) => sum + (e.triggerIntensity || 5), 0) / entries.length;
      
      patterns.push({
        id: `pattern_trigger_${type}_${Date.now()}`,
        type: 'trigger',
        description: `"${type}" appears as a trigger ${entries.length} times`,
        frequency: entries.length,
        examples: entries.slice(0, 3).map((e) => {
          const date = new Date(e.date).toLocaleDateString();
          return `${date}: ${e.content.substring(0, 100)}${e.content.length > 100 ? '...' : ''}`;
        }),
        detectedAtISO: new Date().toISOString(),
        relatedEntries: entries.map((e) => e.id),
      });
    }
  });

  return patterns;
}

/**
 * Parses AI response to extract patterns
 */
function parsePatternsResponse(text: string): Pattern[] {
  const patterns: Pattern[] = [];
  const lines = text.split('\n');

  let currentPattern: Partial<Pattern> | null = null;
  let currentSection = '';

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Detect pattern start (usually a heading or numbered item)
    if (trimmed.match(/^\d+\.|^[-•*]/) || trimmed.match(/^##|^###/)) {
      if (currentPattern && currentPattern.description) {
        patterns.push({
          id: `pattern_${Date.now()}_${patterns.length}`,
          type: currentPattern.type || 'theme',
          description: currentPattern.description,
          frequency: currentPattern.frequency || 1,
          examples: currentPattern.examples || [],
          detectedAtISO: new Date().toISOString(),
        });
      }

      currentPattern = {
        type: detectPatternType(trimmed),
        description: trimmed.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').replace(/^##+\s*/, '').trim(),
        frequency: 1,
        examples: [],
      };
      currentSection = 'description';
    } else if (currentPattern) {
      // Continue building current pattern
      if (trimmed.toLowerCase().includes('frequency') || trimmed.toLowerCase().includes('appears')) {
        const freqMatch = trimmed.match(/\d+/);
        if (freqMatch) {
          currentPattern.frequency = parseInt(freqMatch[0], 10);
        }
      } else if (trimmed.toLowerCase().includes('example')) {
        currentSection = 'examples';
      } else if (trimmed.length > 20 && currentSection === 'examples') {
        currentPattern.examples = currentPattern.examples || [];
        currentPattern.examples.push(trimmed.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      } else if (trimmed.length > 10 && currentSection === 'description') {
        currentPattern.description += ' ' + trimmed;
      }
    }
  });

  // Add last pattern
  if (currentPattern && currentPattern.description) {
    patterns.push({
      id: `pattern_${Date.now()}_${patterns.length}`,
      type: currentPattern.type || 'theme',
      description: currentPattern.description,
      frequency: currentPattern.frequency || 1,
      examples: currentPattern.examples || [],
      detectedAtISO: new Date().toISOString(),
    });
  }

  return patterns.slice(0, 10); // Max 10 patterns
}

/**
 * Detects pattern type from text
 */
function detectPatternType(text: string): Pattern['type'] {
  const lower = text.toLowerCase();
  if (lower.includes('mood') || lower.includes('feeling')) return 'mood';
  if (lower.includes('trigger') || lower.includes('situation')) return 'trigger';
  if (lower.includes('behavior') || lower.includes('action')) return 'behavior';
  if (lower.includes('phrase') || lower.includes('word')) return 'phrase';
  return 'theme';
}

