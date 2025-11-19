import type { CopilotContext } from '@/types';
import { buildContextPrompt } from './copilot-context';

/**
 * System prompt for Recovery Copilot
 * CRITICAL: Never quote copyrighted NA/AA literature verbatim.
 * Use neutral, paraphrased language only.
 */
const SYSTEM_PROMPT_TEXT = `You are a recovery companion helping someone in 12-step recovery.

YOUR ROLE:
- You are NOT a therapist or sponsor - you're a digital companion
- Always encourage human connection (sponsor, meetings, recovery friends)
- Never quote copyrighted recovery literature - paraphrase and summarize only
- Ground your responses in the user's own data (step work, journals, scenes, daily check-ins)
- Be supportive, empathetic, and recovery-focused
- Help users process their own thoughts, not give medical advice

COMMUNICATION STYLE:
- Warm but real - like talking to a trusted friend who's been there
- Direct when needed - recovery companions give honest feedback
- Reference their personal data to show you know them
- Ask follow-up questions about previous conversations
- Use "we" and "us" language (the recovery community)
- Be conversational, not clinical

CRISIS DETECTION:
If you detect any of these, provide an immediate action plan:
- Mention of using or strong cravings
- Suicidal thoughts or self-harm
- Extreme isolation or hopelessness
- Talk of giving up on recovery
- Dangerous situations

EMERGENCY RESOURCES TO SHARE IN CRISIS:
- 988 - Mental Health Crisis Lifeline
- 911 - Immediate emergency
- Their sponsor (encourage them to call NOW)
- NA/AA Hotline: 1-800-662-4357
- Go to a meeting immediately
- Text a fellowship friend right now

Remember: You're their recovery companion. You know their journey. Reference it. Build on it. Help them grow.`;

// Internal function to get system prompt (for use in other functions)
function getSystemPrompt(): string {
  return SYSTEM_PROMPT_TEXT;
}

// Export SYSTEM_PROMPT as a const - initialized directly from the template string
// This avoids any function calls during module initialization that could cause temporal dead zone issues
export const SYSTEM_PROMPT: string = SYSTEM_PROMPT_TEXT;

/**
 * Builds a chat prompt with context
 */
export function buildChatPrompt(
  userMessage: string,
  context: CopilotContext
): string {
  const contextStr = buildContextPrompt(context);
  
  let prompt = `${getSystemPrompt()}\n\n`;
  
  if (contextStr.trim()) {
    prompt += `## USER'S RECOVERY CONTEXT\n${contextStr}\n\n`;
  }
  
  prompt += `## CURRENT CONVERSATION\nUser: ${userMessage}\n\n`;
  prompt += `Please respond as their recovery companion, using the context above to provide personalized support.`;
  
  return prompt;
}

/**
 * Builds a weekly digest generation prompt
 */
export function buildDigestPrompt(
  context: CopilotContext,
  weekStartDate: string,
  weekEndDate: string
): string {
  const contextStr = buildContextPrompt(context);
  
  let prompt = `${getSystemPrompt()}\n\n`;
  prompt += `## TASK: Generate Weekly Recovery Digest\n`;
  prompt += `Period: ${weekStartDate} to ${weekEndDate}\n\n`;
  
  if (contextStr.trim()) {
    prompt += `## USER'S WEEKLY DATA\n${contextStr}\n\n`;
  }
  
  prompt += `Please analyze this week's recovery data and generate a digest that includes:\n`;
  prompt += `1. 2-3 key themes you notice in their recovery journey this week\n`;
  prompt += `2. A brief summary (2-3 paragraphs) of their week\n`;
  prompt += `3. 2-3 insights or observations about patterns or progress\n`;
  prompt += `4. 2-3 gentle suggestions for the week ahead\n\n`;
  prompt += `Write in a warm, supportive tone. Celebrate progress, acknowledge challenges, and encourage continued growth.`;
  
  return prompt;
}

/**
 * Builds a meeting prep prompt
 */
export function buildMeetingPrepPrompt(
  userShare: string,
  context?: CopilotContext
): string {
  let prompt = `${getSystemPrompt()}\n\n`;
  prompt += `## TASK: Help Prepare Share for Meeting\n\n`;
  prompt += `The user wants to share this at a meeting:\n"${userShare}"\n\n`;
  
  if (context) {
    const contextStr = buildContextPrompt(context);
    if (contextStr.trim()) {
      prompt += `## CONTEXT\n${contextStr}\n\n`;
    }
  }
  
  prompt += `Please help them:\n`;
  prompt += `1. Phrase their share in a clear, honest way\n`;
  prompt += `2. Identify 2-3 key points they might want to emphasize\n`;
  prompt += `3. Suggest how to connect their share to recovery principles\n`;
  prompt += `4. Provide encouragement and support\n\n`;
  prompt += `Remember: Meeting shares should be honest, brief, and focused on recovery. Help them find their voice.`;
  
  return prompt;
}

/**
 * Builds a sponsor summary prompt
 */
export function buildSponsorSummaryPrompt(
  context: CopilotContext,
  periodStartDate: string,
  periodEndDate: string,
  period: 'week' | 'month'
): string {
  const contextStr = buildContextPrompt(context);
  
  let prompt = `${getSystemPrompt()}\n\n`;
  prompt += `## TASK: Generate Summary for Sponsor\n`;
  prompt += `Period: ${periodStartDate} to ${periodEndDate} (${period})\n\n`;
  
  if (contextStr.trim()) {
    prompt += `## USER'S RECOVERY DATA\n${contextStr}\n\n`;
  }
  
  prompt += `Please create a summary that includes:\n`;
  prompt += `1. Key themes from this ${period}\n`;
  prompt += `2. Progress made (celebrate wins)\n`;
  prompt += `3. Challenges or concerns that came up\n`;
  prompt += `4. Questions or areas where they'd like sponsor guidance\n`;
  prompt += `5. Overall assessment of their recovery journey\n\n`;
  prompt += `Write in a clear, honest tone suitable for sharing with a sponsor.`;
  prompt += `Be respectful of the sponsor-sponsee relationship.`;
  
  return prompt;
}

/**
 * Builds a pattern detection prompt
 */
export function buildPatternDetectionPrompt(
  context: CopilotContext
): string {
  const contextStr = buildContextPrompt(context);
  
  let prompt = `${getSystemPrompt()}\n\n`;
  prompt += `## TASK: Detect Patterns in Recovery Journey\n\n`;
  
  if (contextStr.trim()) {
    prompt += `## USER'S RECOVERY DATA\n${contextStr}\n\n`;
  }
  
  prompt += `Please analyze the user's recovery data and identify:\n`;
  prompt += `1. Recurring phrases or themes in their journal entries\n`;
  prompt += `2. Mood patterns (when do they tend to feel better/worse?)\n`;
  prompt += `3. Trigger patterns (what situations or feelings recur?)\n`;
  prompt += `4. Behavioral patterns (what actions do they take consistently?)\n`;
  prompt += `5. Progress patterns (what improvements do you notice?)\n\n`;
  prompt += `For each pattern, provide:\n`;
  prompt += `- A clear description\n`;
  prompt += `- How often it appears\n`;
  prompt += `- 2-3 examples from their data\n`;
  prompt += `- A gentle suggestion for exploration\n\n`;
  prompt += `Be supportive and non-judgmental. Patterns are opportunities for growth.`;
  
  return prompt;
}

