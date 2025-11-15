import type { CopilotContext, SponsorSummary } from '@/types';
import { buildSponsorSummaryPrompt } from './copilot-prompts';

/**
 * Generates a summary for sponsor (week or month)
 */
export async function generateSponsorSummary(
  context: CopilotContext,
  period: 'week' | 'month',
  periodStartDate: string,
  periodEndDate: string
): Promise<SponsorSummary> {
  const prompt = buildSponsorSummaryPrompt(context, periodStartDate, periodEndDate, period);

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
        promptType: 'summary',
        contextWindow: context,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.response || 'Failed to generate sponsor summary');
    }

    const data = await response.json();
    const summaryText = data.response || '';

    // Parse the summary response
    const parsed = parseSummaryResponse(summaryText);

    return {
      id: `summary_${Date.now()}`,
      periodStartISO: periodStartDate,
      periodEndISO: periodEndDate,
      summary: parsed.summary,
      themes: parsed.themes,
      questions: parsed.questions,
      concerns: parsed.concerns,
      generatedAtISO: new Date().toISOString(),
      editedByUser: false,
    };
  } catch (error) {
    console.error('Error generating sponsor summary:', error);
    throw error;
  }
}

/**
 * Parses the AI response to extract structured summary components
 */
function parseSummaryResponse(text: string): {
  summary: string;
  themes: string[];
  questions?: string[];
  concerns?: string[];
} {
  const themes: string[] = [];
  let summary = '';
  const questions: string[] = [];
  const concerns: string[] = [];

  // Extract themes
  const themesMatch = text.match(/(?:themes?|key points?)[:\n]+(.*?)(?:\n\n##|\n###|$)/is);
  if (themesMatch) {
    const themesText = themesMatch[1];
    const lines = themesText.split('\n').filter((line) => line.trim());
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 10) {
        themes.push(cleaned);
      }
    });
  }

  // Extract summary (main body)
  const summaryMatch = text.match(/(?:summary|overview|assessment)[:\n]+(.*?)(?:\n\n##|\n###|$)/is);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  } else {
    // Fallback: use first substantial paragraph
    const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 50);
    if (paragraphs.length > 0) {
      summary = paragraphs[0].trim();
    }
  }

  // Extract questions
  const questionsMatch = text.match(/(?:questions?|areas for guidance)[:\n]+(.*?)(?:\n\n##|\n###|$)/is);
  if (questionsMatch) {
    const questionsText = questionsMatch[1];
    const lines = questionsText.split('\n').filter((line) => line.trim());
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/^\?+\s*/, '').trim();
      if (cleaned && cleaned.length > 15) {
        questions.push(cleaned);
      }
    });
  }

  // Extract concerns
  const concernsMatch = text.match(/(?:concerns?|challenges?)[:\n]+(.*?)(?:\n\n##|\n###|$)/is);
  if (concernsMatch) {
    const concernsText = concernsMatch[1];
    const lines = concernsText.split('\n').filter((line) => line.trim());
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 15) {
        concerns.push(cleaned);
      }
    });
  }

  // Fallback: if no themes found, try to extract from the beginning
  if (themes.length === 0) {
    const lines = text.split('\n').slice(0, 5);
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 15 && cleaned.length < 100) {
        themes.push(cleaned);
      }
    });
  }

  // Ensure we have at least a summary
  if (!summary) {
    summary = text.substring(0, 1000).trim();
  }

  return {
    summary,
    themes: themes.slice(0, 5), // Max 5 themes
    questions: questions.length > 0 ? questions.slice(0, 5) : undefined,
    concerns: concerns.length > 0 ? concerns.slice(0, 5) : undefined,
  };
}

/**
 * Gets date range for period
 */
export function getPeriodDates(period: 'week' | 'month'): { start: string; end: string } {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (period === 'week') {
    const dayOfWeek = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else {
    // Month
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

