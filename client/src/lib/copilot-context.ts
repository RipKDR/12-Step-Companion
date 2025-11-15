import type {
  CopilotContext,
  CopilotSettings,
  JournalEntry,
  StepAnswer,
  RecoveryScene,
  DailyCard,
  Streaks,
} from '@/types';

/**
 * Summarizes step work entries for context window
 * Returns last 5 step entries as concise summaries
 */
export function summarizeStepWork(
  stepAnswers: Record<string, StepAnswer>,
  maxEntries: number = 5
): string[] {
  const entries = Object.values(stepAnswers)
    .sort((a, b) => new Date(b.updatedAtISO).getTime() - new Date(a.updatedAtISO).getTime())
    .slice(0, maxEntries);

  return entries.map((answer) => {
    const answerPreview = answer.answer.length > 150
      ? answer.answer.substring(0, 150) + '...'
      : answer.answer;
    return `Step ${answer.stepNumber}: ${answerPreview}`;
  });
}

/**
 * Summarizes journal entries for context window
 * Returns last 5 journal entries as concise summaries
 */
export function summarizeJournalEntries(
  journalEntries: Record<string, JournalEntry>,
  maxEntries: number = 5
): string[] {
  const entries = Object.values(journalEntries)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxEntries);

  return entries.map((entry) => {
    const date = new Date(entry.date).toLocaleDateString();
    const contentPreview = entry.content.length > 200
      ? entry.content.substring(0, 200) + '...'
      : entry.content;
    const moodStr = entry.mood !== undefined ? ` (Mood: ${entry.mood}/10)` : '';
    const triggerStr = entry.isTrigger ? ' [Trigger]' : '';
    return `${date}${moodStr}${triggerStr}: ${contentPreview}`;
  });
}

/**
 * Extracts active Recovery Scenes for context
 */
export function extractActiveScenes(
  recoveryScenes: Record<string, RecoveryScene>
): string[] {
  const activeScenes = Object.values(recoveryScenes)
    .filter((scene) => scene.active)
    .map((scene) => {
      const triggers = scene.triggers.join(', ');
      const actions = scene.actions.map((a) => a.label).join(', ');
      return `${scene.label}: Triggers (${triggers}), Actions (${actions})`;
    });

  return activeScenes;
}

/**
 * Gets current streak data for context
 */
export function getStreakData(streaks: Streaks): Record<string, number> {
  return {
    journaling: streaks.journaling.current,
    dailyCards: streaks.dailyCards.current,
    meetings: streaks.meetings.current,
    stepWork: streaks.stepWork.current,
    recoveryRhythm: streaks.recoveryRhythm.current,
  };
}

/**
 * Gets mood trend from daily cards (last 7 days)
 */
export function getMoodTrend(
  dailyCards: Record<string, DailyCard>,
  days: number = 7
): number[] {
  const now = new Date();
  const trend: number[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const card = dailyCards[dateStr];

    if (card?.middayPulseCheck?.mood) {
      trend.push(card.middayPulseCheck.mood);
    }
  }

  return trend;
}

/**
 * Gets cravings trend from daily cards (last 7 days)
 */
export function getCravingsTrend(
  dailyCards: Record<string, DailyCard>,
  days: number = 7
): number[] {
  const now = new Date();
  const trend: number[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const card = dailyCards[dateStr];

    if (card?.middayPulseCheck?.craving !== undefined) {
      trend.push(card.middayPulseCheck.craving);
    }
  }

  return trend;
}

/**
 * Gathers context for copilot based on settings
 */
export function gatherContextForCopilot(
  settings: CopilotSettings,
  data: {
    stepAnswers: Record<string, StepAnswer>;
    journalEntries: Record<string, JournalEntry>;
    recoveryScenes: Record<string, RecoveryScene>;
    dailyCards: Record<string, DailyCard>;
    streaks: Streaks;
  }
): CopilotContext {
  const context: CopilotContext = {};

  if (settings.includeStepWork) {
    context.recentStepWork = summarizeStepWork(data.stepAnswers);
  }

  if (settings.includeJournals) {
    context.recentJournals = summarizeJournalEntries(data.journalEntries);
  }

  if (settings.includeScenes) {
    context.activeScenes = extractActiveScenes(data.recoveryScenes);
  }

  if (settings.includeDailyCards) {
    context.recentMoodTrend = getMoodTrend(data.dailyCards);
    context.recentCravingsTrend = getCravingsTrend(data.dailyCards);
  }

  context.currentStreaks = getStreakData(data.streaks);

  return context;
}

/**
 * Builds a formatted context prompt string for AI
 */
export function buildContextPrompt(context: CopilotContext): string {
  const parts: string[] = [];

  if (context.recentStepWork && context.recentStepWork.length > 0) {
    parts.push('## Recent Step Work');
    context.recentStepWork.forEach((summary, idx) => {
      parts.push(`${idx + 1}. ${summary}`);
    });
  }

  if (context.recentJournals && context.recentJournals.length > 0) {
    parts.push('\n## Recent Journal Entries');
    context.recentJournals.forEach((summary, idx) => {
      parts.push(`${idx + 1}. ${summary}`);
    });
  }

  if (context.activeScenes && context.activeScenes.length > 0) {
    parts.push('\n## Active Recovery Scenes');
    context.activeScenes.forEach((scene, idx) => {
      parts.push(`${idx + 1}. ${scene}`);
    });
  }

  if (context.currentStreaks) {
    parts.push('\n## Current Streaks');
    Object.entries(context.currentStreaks).forEach(([type, count]) => {
      if (count > 0) {
        parts.push(`- ${type}: ${count} days`);
      }
    });
  }

  if (context.recentMoodTrend && context.recentMoodTrend.length > 0) {
    const avgMood = context.recentMoodTrend.reduce((a, b) => a + b, 0) / context.recentMoodTrend.length;
    parts.push(`\n## Mood Trend (Last 7 Days)`);
    parts.push(`Average mood: ${avgMood.toFixed(1)}/5`);
  }

  if (context.recentCravingsTrend && context.recentCravingsTrend.length > 0) {
    const avgCravings = context.recentCravingsTrend.reduce((a, b) => a + b, 0) / context.recentCravingsTrend.length;
    parts.push(`\n## Cravings Trend (Last 7 Days)`);
    parts.push(`Average cravings intensity: ${avgCravings.toFixed(1)}/10`);
  }

  return parts.join('\n');
}

