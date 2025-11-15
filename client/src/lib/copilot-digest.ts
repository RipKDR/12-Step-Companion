import type { CopilotContext, WeeklyDigest } from '@/types';
import { buildDigestPrompt } from './copilot-prompts';

/**
 * Generates a weekly digest using Gemini API
 */
export async function generateWeeklyDigest(
  context: CopilotContext,
  weekStartDate: string,
  weekEndDate: string
): Promise<WeeklyDigest> {
  const prompt = buildDigestPrompt(context, weekStartDate, weekEndDate);

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
        promptType: 'digest',
        contextWindow: context,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.response || 'Failed to generate weekly digest');
    }

    const data = await response.json();
    const digestText = data.response || '';

    // Parse the digest response to extract themes, summary, insights, suggestions
    const parsed = parseDigestResponse(digestText);

    return {
      generatedAtISO: new Date().toISOString(),
      themes: parsed.themes,
      summary: parsed.summary,
      insights: parsed.insights,
      suggestions: parsed.suggestions,
      readyToShare: false,
    };
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    throw error;
  }
}

/**
 * Parses the AI response to extract structured digest components
 */
function parseDigestResponse(text: string): {
  themes: string[];
  summary: string;
  insights?: string[];
  suggestions?: string[];
} {
  const themes: string[] = [];
  let summary = '';
  const insights: string[] = [];
  const suggestions: string[] = [];

  // Try to extract themes (look for numbered lists or bullet points)
  const themeMatches = text.match(/(?:themes?|key points?)[:\n]+(.*?)(?:\n\n|\n##|$)/is);
  if (themeMatches) {
    const themeText = themeMatches[1];
    const lines = themeText.split('\n').filter((line) => line.trim());
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 10) {
        themes.push(cleaned);
      }
    });
  }

  // Extract summary (usually the main body)
  const summaryMatch = text.match(/(?:summary|overview)[:\n]+(.*?)(?:\n\n##|\n###|$)/is);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  } else {
    // Fallback: use first substantial paragraph
    const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 50);
    if (paragraphs.length > 0) {
      summary = paragraphs[0].trim();
    }
  }

  // Extract insights
  const insightsMatch = text.match(/(?:insights?|observations?)[:\n]+(.*?)(?:\n\n##|\n###|$)/is);
  if (insightsMatch) {
    const insightsText = insightsMatch[1];
    const lines = insightsText.split('\n').filter((line) => line.trim());
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 20) {
        insights.push(cleaned);
      }
    });
  }

  // Extract suggestions
  const suggestionsMatch = text.match(/(?:suggestions?|recommendations?)[:\n]+(.*?)(?:\n\n##|\n###|$)/is);
  if (suggestionsMatch) {
    const suggestionsText = suggestionsMatch[1];
    const lines = suggestionsText.split('\n').filter((line) => line.trim());
    lines.forEach((line) => {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 20) {
        suggestions.push(cleaned);
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
    summary = text.substring(0, 500).trim();
  }

  return {
    themes: themes.slice(0, 5), // Max 5 themes
    summary,
    insights: insights.length > 0 ? insights.slice(0, 5) : undefined,
    suggestions: suggestions.length > 0 ? suggestions.slice(0, 5) : undefined,
  };
}

/**
 * Gets the start and end dates for the current week
 */
export function getWeekDates(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek); // Start of week (Sunday)
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // End of week (Saturday)
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

