// API Routes - Standalone mode (no authentication required)
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import type { GoogleGenerativeAI } from "@google/generative-ai";
import type { TypedRequest } from "./types/express";
import { isStringArray, isNumberArray, isValidContextWindow } from "./types/guards";
import { log } from "./lib/logger";
import { authenticatedRateLimiter } from "./middleware/rateLimit";
import { validateChatRequest } from "./middleware/validateRequest";
import { sanitizeError } from "./utils/sanitizeError";
import {
  MAX_CONTEXT_LENGTH,
  MAX_TRIGGERS,
  MAX_JOURNALS,
  MAX_OUTPUT_TOKENS,
  AI_TEMPERATURE,
  MAX_MESSAGE_LENGTH,
  CACHE_TTL_MS,
  REQUEST_TIMEOUT_MS,
} from "./constants";

import type { ChatRequest, ChatMessage, UserContext, ContextWindow } from "./types/chat";

// Cache AI client instance with proper typing and expiration
interface CachedAIClient {
  client: GoogleGenerativeAI;
  createdAt: number;
}

let cachedGenAI: CachedAIClient | null = null;

/**
 * Input sanitization helper
 * Removes HTML tags, normalizes whitespace, and limits length
 * @param text - Text to sanitize
 * @param maxLength - Maximum length (defaults to MAX_CONTEXT_LENGTH)
 * @returns Sanitized text string
 */
function sanitizeText(text: string, maxLength: number = MAX_CONTEXT_LENGTH): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, maxLength);
}

/**
 * Validate user context structure
 * Checks that userContext is a valid object with proper structure
 * @param userContext - User context object to validate
 * @returns Object with valid flag and optional error message
 */
function validateUserContext(userContext: unknown): { valid: boolean; error?: string } {
  if (!userContext) return { valid: true }; // Context is optional

  // Type guard to check if userContext is an object
  if (typeof userContext !== 'object' || userContext === null) {
    return { valid: false, error: 'User context must be an object' };
  }

  const ctx = userContext as UserContext;

  if (ctx.triggers) {
    if (!Array.isArray(ctx.triggers)) {
      return { valid: false, error: 'Triggers must be an array' };
    }
    if (ctx.triggers.length > MAX_TRIGGERS) {
      return { valid: false, error: `Maximum ${MAX_TRIGGERS} triggers allowed` };
    }
  }

  if (ctx.recentJournals) {
    if (!Array.isArray(ctx.recentJournals)) {
      return { valid: false, error: 'Journals must be an array' };
    }
    if (ctx.recentJournals.length > MAX_JOURNALS) {
      return { valid: false, error: `Maximum ${MAX_JOURNALS} journals allowed` };
    }
  }

  if (ctx.sobrietyDate) {
    const date = new Date(ctx.sobrietyDate);
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'Invalid sobriety date' };
    }
    if (date > new Date()) {
      return { valid: false, error: 'Sobriety date cannot be in the future' };
    }
  }

  return { valid: true };
}

/**
 * Register all application routes
 * Sets up authentication, API endpoints, and returns HTTP server
 * @param app - Express application instance
 * @returns Promise resolving to HTTP server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware (no-op in standalone mode)
  await setupAuth(app);

  // Mount tRPC router at /api/trpc (before other routes to avoid conflicts)
  try {
    const { mountTRPC } = await import("./routes-trpc");
    mountTRPC(app);
  } catch (error) {
    log(`Warning: Failed to mount tRPC router: ${error}`, "routes");
  }

  // Auth endpoint - always returns null (no auth in standalone mode)
  app.get('/api/auth/user', isAuthenticated, async (_req: Request, res: Response) => {
    // Always return null - app works without authentication
    return res.json(null);
  });

  // Add other application routes here
  // Protected routes should use isAuthenticated middleware
  // Example: app.get("/api/protected", isAuthenticated, async (req, res) => { ... });

  // AI Sponsor Chat endpoint (works with or without auth)
  app.post('/api/ai-sponsor/chat', authenticatedRateLimiter, isAuthenticated, validateChatRequest, async (req: TypedRequest<ChatRequest>, res: Response) => {
    try {
      const { message, conversationHistory, userContext, contextWindow, promptType } = req.body;

      // Note: Message and userContext validation is handled by validateChatRequest middleware
      // Additional validation for userContext structure (if needed)
      const contextValidation = validateUserContext(userContext);
      if (!contextValidation.valid) {
        res.status(400).json({
          message: 'Invalid user context',
          response: contextValidation.error || 'Invalid user data provided.'
        });
        return;
      }

      // Check for API key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        log('GEMINI_API_KEY not set', 'routes');
        res.status(500).json({
          message: 'AI service not configured',
          response: "I'm sorry, but I'm not properly configured at the moment. Please try reaching out to a human sponsor or check back later."
        });
        return;
      }

      // Initialize or reuse cached AI client (with expiration check)
      const now = Date.now();
      if (!cachedGenAI || (now - cachedGenAI.createdAt) > CACHE_TTL_MS) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        cachedGenAI = {
          client: new GoogleGenerativeAI(apiKey) as GoogleGenerativeAI,
          createdAt: now,
        };
        log('AI client cache initialized', 'routes');
      }

      // Build personalized context section with sanitization
      // Support both old userContext format and new contextWindow format
      let personalContext = '';
      
      // Use structured contextWindow if provided, otherwise fall back to userContext
      if (contextWindow && isValidContextWindow(contextWindow)) {
        personalContext = '\n\n--- RECOVERY CONTEXT ---\n';
        
        if (contextWindow.recentStepWork && isStringArray(contextWindow.recentStepWork) && contextWindow.recentStepWork.length > 0) {
          personalContext += `\nRecent Step Work:\n`;
          contextWindow.recentStepWork.forEach((summary: string, idx: number) => {
            personalContext += `${idx + 1}. ${sanitizeText(summary, 300)}\n`;
          });
        }
        
        if (contextWindow.recentJournals && isStringArray(contextWindow.recentJournals) && contextWindow.recentJournals.length > 0) {
          personalContext += `\nRecent Journal Entries:\n`;
          contextWindow.recentJournals.forEach((summary: string, idx: number) => {
            personalContext += `${idx + 1}. ${sanitizeText(summary, 300)}\n`;
          });
        }
        
        if (contextWindow.activeScenes && isStringArray(contextWindow.activeScenes) && contextWindow.activeScenes.length > 0) {
          personalContext += `\nActive Recovery Scenes:\n`;
          contextWindow.activeScenes.forEach((scene: string, idx: number) => {
            personalContext += `${idx + 1}. ${sanitizeText(scene, 200)}\n`;
          });
        }
        
        if (contextWindow.currentStreaks && typeof contextWindow.currentStreaks === 'object' && contextWindow.currentStreaks !== null) {
          personalContext += `\nCurrent Streaks:\n`;
          Object.entries(contextWindow.currentStreaks).forEach(([type, count]) => {
            if (typeof count === 'number' && count > 0) {
              personalContext += `- ${type}: ${count} days\n`;
            }
          });
        }
        
        if (contextWindow.recentMoodTrend && isNumberArray(contextWindow.recentMoodTrend) && contextWindow.recentMoodTrend.length > 0) {
          const avgMood = contextWindow.recentMoodTrend.reduce((a: number, b: number) => a + b, 0) / contextWindow.recentMoodTrend.length;
          personalContext += `\nMood Trend (Last 7 Days): Average ${avgMood.toFixed(1)}/5\n`;
        }
        
        if (contextWindow.recentCravingsTrend && isNumberArray(contextWindow.recentCravingsTrend) && contextWindow.recentCravingsTrend.length > 0) {
          const avgCravings = contextWindow.recentCravingsTrend.reduce((a: number, b: number) => a + b, 0) / contextWindow.recentCravingsTrend.length;
          personalContext += `\nCravings Trend (Last 7 Days): Average ${avgCravings.toFixed(1)}/10\n`;
        }
        
        personalContext += '--- END CONTEXT ---\n';
      } else if (userContext) {
        // Fallback to old userContext format for backward compatibility
        personalContext = '\n\n--- PERSONAL CONTEXT ---\n';

        if (userContext.name) {
          personalContext += `Name: ${sanitizeText(userContext.name, 100)}\n`;
        }

        if (userContext.sobrietyDate) {
          try {
            const cleanDate = new Date(userContext.sobrietyDate);
            const daysClean = Math.max(0, Math.floor((Date.now() - cleanDate.getTime()) / (1000 * 60 * 60 * 24)));
            personalContext += `Clean Date: ${cleanDate.toLocaleDateString()} (${daysClean} days clean)\n`;
          } catch (error) {
            log(`Error processing sobriety date: ${error instanceof Error ? error.message : String(error)}`, 'routes');
          }
        }

        if (userContext.triggers && Array.isArray(userContext.triggers) && userContext.triggers.length > 0) {
          personalContext += `\nKnown Triggers:\n`;
          userContext.triggers.slice(0, MAX_TRIGGERS).forEach((trigger: { name?: string; description?: string; severity?: number }) => {
            const name = sanitizeText(trigger.name || '', 100);
            const description = trigger.description ? sanitizeText(trigger.description, 200) : '';
            const severity = trigger.severity && Number.isInteger(trigger.severity) && trigger.severity >= 1 && trigger.severity <= 10
              ? trigger.severity
              : null;

            personalContext += `- ${name}${severity ? ` (Severity: ${severity}/10)` : ''}${description ? `: ${description}` : ''}\n`;
          });
        }

        if (userContext.recentJournals && Array.isArray(userContext.recentJournals) && userContext.recentJournals.length > 0) {
          personalContext += `\nRecent Journal Entries (Last ${Math.min(userContext.recentJournals.length, MAX_JOURNALS)}):\n`;
          userContext.recentJournals.slice(0, MAX_JOURNALS).forEach((entry: { date?: string; content?: string }) => {
            try {
              const date = entry.date ? new Date(entry.date).toLocaleDateString() : 'Unknown date';
              const content = sanitizeText(entry.content || '', 200);
              if (content) {
                personalContext += `- ${date}: ${content}${entry.content && entry.content.length > 200 ? '...' : ''}\n`;
              }
            } catch (error) {
              log(`Error processing journal entry: ${error instanceof Error ? error.message : String(error)}`, 'routes');
            }
          });
        }

        if (userContext.stepProgress && typeof userContext.stepProgress === 'object') {
          const stepProgress = userContext.stepProgress;
          const completedSteps = Object.keys(stepProgress).filter(step =>
            stepProgress[step]?.completed === true
          );
          if (completedSteps.length > 0) {
            personalContext += `\nCompleted Steps: ${completedSteps.map(s => `Step ${s}`).join(', ')}\n`;
          }
          const currentStep = Object.keys(stepProgress).find(step =>
            !stepProgress[step]?.completed &&
            stepProgress[step]?.answers &&
            Object.keys(stepProgress[step].answers || {}).length > 0
          );
          if (currentStep) {
            personalContext += `Currently Working On: Step ${currentStep}\n`;
          }
        }

        if (userContext.conversationSummary) {
          const summary = sanitizeText(userContext.conversationSummary, 500);
          if (summary) {
            personalContext += `\nPrevious Conversation Summary:\n${summary}\n`;
          }
        }

        personalContext += '--- END CONTEXT ---\n';
      }

      // Build enhanced system instruction
      // Use recovery-focused prompt that never quotes copyrighted NA/AA text
      const systemInstruction = `You are a recovery companion helping someone in 12-step recovery.

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

Remember: You're their recovery companion. You know their journey. Reference it. Build on it. Help them grow.

${personalContext}`;

      // Initialize model with personalized system instruction
      const model = cachedGenAI.client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction
      });

      // Format and validate conversation history
      const history = (conversationHistory && Array.isArray(conversationHistory)
        ? conversationHistory.slice(-10).map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: sanitizeText(msg.content || '', MAX_MESSAGE_LENGTH) }]
          }))
        : []
      );

      // Start chat with history
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: AI_TEMPERATURE,
        },
      });

      // Send message and get response with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT_MS);
      });

      const result = await Promise.race([
        chat.sendMessage(sanitizeText(message, MAX_MESSAGE_LENGTH)),
        timeoutPromise,
      ]);
      
      const responseText = result.response.text();

      res.json({ response: responseText });
    } catch (error) {
      // Log full error server-side for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error in AI sponsor chat: ${errorMessage}`, 'routes');

      // Sanitize error for client
      const sanitized = sanitizeError(error, 500);

      // Handle timeout specifically
      if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
        res.status(504).json({
          message: 'Request timeout',
          response: "The request took too long to process. Please try again, or reach out to your sponsor if you need immediate support."
        });
        return;
      }

      // Handle specific error types with sanitized messages
      if (sanitized.statusCode === 429 || errorMessage.includes('quota')) {
        res.status(429).json({
          message: sanitized.message,
          response: "I'm receiving a lot of messages right now. Please wait a moment and try again. If you need immediate support, consider calling your sponsor or attending a meeting."
        });
        return;
      }

      if (errorMessage.includes('API key')) {
        res.status(503).json({
          message: sanitized.message,
          response: "I'm having trouble with my configuration. Please try again later or reach out to a human sponsor."
        });
        return;
      }

      if (errorMessage.includes('blocked') || errorMessage.includes('safety')) {
        res.status(400).json({
          message: sanitized.message,
          response: "I couldn't process that message. Please rephrase and try again, or reach out to your sponsor for support."
        });
        return;
      }

      // Clear cache on API errors to force reinitialization
      if (sanitized.statusCode >= 500) {
        cachedGenAI = null;
        log('AI client cache cleared due to error', 'routes');
      }

      // Generic error response with sanitized message
      res.status(sanitized.statusCode).json({
        message: sanitized.message,
        response: "I'm having trouble responding right now. Please try again in a moment, or reach out to your sponsor or a trusted person if you need immediate support."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
