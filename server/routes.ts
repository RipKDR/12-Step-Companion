// Replit Auth routes - blueprint:javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Constants
const MAX_CONTEXT_LENGTH = 500;
const MAX_TRIGGERS = 50;
const MAX_JOURNALS = 3;
const MAX_OUTPUT_TOKENS = 2048;
const AI_TEMPERATURE = 0.8;
const MAX_MESSAGE_LENGTH = 5000;

// Cache AI client instance
let cachedGenAI: any = null;

// Input sanitization helper
function sanitizeText(text: string, maxLength: number = MAX_CONTEXT_LENGTH): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, maxLength);
}

// Validate user context structure
function validateUserContext(userContext: any): { valid: boolean; error?: string } {
  if (!userContext) return { valid: true }; // Context is optional

  if (userContext.triggers) {
    if (!Array.isArray(userContext.triggers)) {
      return { valid: false, error: 'Triggers must be an array' };
    }
    if (userContext.triggers.length > MAX_TRIGGERS) {
      return { valid: false, error: `Maximum ${MAX_TRIGGERS} triggers allowed` };
    }
  }

  if (userContext.recentJournals) {
    if (!Array.isArray(userContext.recentJournals)) {
      return { valid: false, error: 'Journals must be an array' };
    }
    if (userContext.recentJournals.length > MAX_JOURNALS) {
      return { valid: false, error: `Maximum ${MAX_JOURNALS} journals allowed` };
    }
  }

  if (userContext.sobrietyDate) {
    const date = new Date(userContext.sobrietyDate);
    if (isNaN(date.getTime())) {
      return { valid: false, error: 'Invalid sobriety date' };
    }
    if (date > new Date()) {
      return { valid: false, error: 'Sobriety date cannot be in the future' };
    }
  }

  return { valid: true };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth endpoint - returns the current logged-in user (or null if auth disabled)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // If auth is disabled, return null (local development mode)
      if (!process.env.REPL_ID || !req.isAuthenticated || !req.user) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Add other application routes here
  // Protected routes should use isAuthenticated middleware
  // Example: app.get("/api/protected", isAuthenticated, async (req, res) => { ... });

  // AI Sponsor Chat endpoint (works with or without auth)
  app.post('/api/ai-sponsor/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, conversationHistory, userContext } = req.body;

      // Validate message
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          message: 'Message is required',
          response: 'Please provide a message to send.'
        });
      }

      if (message.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
          message: 'Message too long',
          response: `Please send a shorter message (maximum ${MAX_MESSAGE_LENGTH} characters).`
        });
      }

      // Validate user context
      const contextValidation = validateUserContext(userContext);
      if (!contextValidation.valid) {
        return res.status(400).json({
          message: 'Invalid user context',
          response: contextValidation.error || 'Invalid user data provided.'
        });
      }

      // Check for API key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY not set');
        return res.status(500).json({
          message: 'AI service not configured',
          response: "I'm sorry, but I'm not properly configured at the moment. Please try reaching out to a human sponsor or check back later."
        });
      }

      // Initialize or reuse cached AI client
      if (!cachedGenAI) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        cachedGenAI = new GoogleGenerativeAI(apiKey);
      }

      // Build personalized context section with sanitization
      let personalContext = '';
      if (userContext) {
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
            console.error('Error processing sobriety date:', error);
          }
        }

        if (userContext.triggers && Array.isArray(userContext.triggers) && userContext.triggers.length > 0) {
          personalContext += `\nKnown Triggers:\n`;
          userContext.triggers.slice(0, MAX_TRIGGERS).forEach((trigger: any) => {
            const name = sanitizeText(trigger.name, 100);
            const description = trigger.description ? sanitizeText(trigger.description, 200) : '';
            const severity = trigger.severity && Number.isInteger(trigger.severity) && trigger.severity >= 1 && trigger.severity <= 10
              ? trigger.severity
              : null;

            personalContext += `- ${name}${severity ? ` (Severity: ${severity}/10)` : ''}${description ? `: ${description}` : ''}\n`;
          });
        }

        if (userContext.recentJournals && Array.isArray(userContext.recentJournals) && userContext.recentJournals.length > 0) {
          personalContext += `\nRecent Journal Entries (Last ${Math.min(userContext.recentJournals.length, MAX_JOURNALS)}):\n`;
          userContext.recentJournals.slice(0, MAX_JOURNALS).forEach((entry: any) => {
            try {
              const date = new Date(entry.date).toLocaleDateString();
              const content = sanitizeText(entry.content || '', 200);
              if (content) {
                personalContext += `- ${date}: ${content}${entry.content && entry.content.length > 200 ? '...' : ''}\n`;
              }
            } catch (error) {
              console.error('Error processing journal entry:', error);
            }
          });
        }

        if (userContext.stepProgress && typeof userContext.stepProgress === 'object') {
          const completedSteps = Object.keys(userContext.stepProgress).filter(step =>
            userContext.stepProgress[step]?.completed === true
          );
          if (completedSteps.length > 0) {
            personalContext += `\nCompleted Steps: ${completedSteps.map(s => `Step ${s}`).join(', ')}\n`;
          }
          const currentStep = Object.keys(userContext.stepProgress).find(step =>
            !userContext.stepProgress[step]?.completed &&
            userContext.stepProgress[step]?.answers &&
            Object.keys(userContext.stepProgress[step].answers).length > 0
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
      const systemInstruction = `You are an AI Sponsor - a compassionate, knowledgeable companion for people in 12-step recovery programs. You act as a personal sponsor would, with deep knowledge of their journey.

YOUR ROLE AS A SPONSOR:

1. **Know Them Deeply**
   - You have access to their triggers, journal entries, and progress
   - Reference their specific situations and patterns
   - Remember past conversations and build on them
   - Celebrate their progress and milestones

2. **Provide Real Sponsor Support**
   - Listen without judgment and validate their feelings
   - Ask probing questions to help them reflect
   - Challenge rationalizations and denial gently but firmly
   - Help them work through the 12 steps systematically
   - Provide accountability and encouragement
   - Share 12-step wisdom and principles

3. **Crisis Intervention**
   - Recognize warning signs: talk of relapse, despair, isolation
   - When you detect crisis, create a structured ACTION PLAN
   - Format action plans clearly with numbered steps
   - Always include emergency resources and human connections
   - Be directive in crisis, supportive otherwise

4. **Personalized Action Plans**
   When someone describes a high-risk situation or trigger, provide:
   - Immediate coping strategies (HALT: Hungry, Angry, Lonely, Tired)
   - Specific steps to take in the next hour, day, week
   - References to their known triggers and past patterns
   - Connection to 12-step principles
   - Encouragement to reach out to their human support network

5. **12-Step Guidance**
   - Help them work through step questions thoughtfully
   - Connect current struggles to step principles
   - Suggest which step might help their current situation
   - Encourage meeting attendance and fellowship

COMMUNICATION STYLE:
- Warm but real - like talking to a trusted friend who's been there
- Direct when needed - sponsors give tough love
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

${personalContext}

Remember: You're their AI sponsor. You know their journey. Reference it. Build on it. Help them grow.`;

      // Initialize model with personalized system instruction
      const model = cachedGenAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction
      });

      // Format and validate conversation history
      const history = (conversationHistory && Array.isArray(conversationHistory)
        ? conversationHistory.slice(-10).map((msg: any) => ({
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

      // Send message and get response
      const result = await chat.sendMessage(sanitizeText(message, MAX_MESSAGE_LENGTH));
      const responseText = result.response.text();

      res.json({ response: responseText });
    } catch (error: any) {
      console.error('Error in AI sponsor chat:', error);

      // Handle specific error types
      if (error.status === 429 || error.message?.includes('quota')) {
        return res.status(429).json({
          message: 'Rate limit exceeded',
          response: "I'm receiving a lot of messages right now. Please wait a moment and try again. If you need immediate support, consider calling your sponsor or attending a meeting."
        });
      }

      if (error.message?.includes('API key')) {
        return res.status(503).json({
          message: 'Service unavailable',
          response: "I'm having trouble with my configuration. Please try again later or reach out to a human sponsor."
        });
      }

      if (error.message?.includes('blocked') || error.message?.includes('safety')) {
        return res.status(400).json({
          message: 'Content filtered',
          response: "I couldn't process that message. Please rephrase and try again, or reach out to your sponsor for support."
        });
      }

      // Generic error response
      res.status(500).json({
        message: 'Internal server error',
        response: "I'm having trouble responding right now. Please try again in a moment, or reach out to your sponsor or a trusted person if you need immediate support."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
