// Replit Auth routes - blueprint:javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth endpoint - returns the current logged-in user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
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

  // AI Sponsor Chat endpoint
  app.post('/api/ai-sponsor/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, conversationHistory, userContext } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Message is required' });
      }

      // Check for API key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY not set');
        return res.status(500).json({
          message: 'AI service not configured. Please contact administrator.',
          response: "I'm sorry, but I'm not properly configured at the moment. Please try reaching out to a human sponsor or check back later."
        });
      }

      // Import Google Generative AI SDK dynamically
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);

      // Build personalized context section
      let personalContext = '';
      if (userContext) {
        personalContext = '\n\n--- PERSONAL CONTEXT ---\n';

        if (userContext.name) {
          personalContext += `Name: ${userContext.name}\n`;
        }

        if (userContext.sobrietyDate) {
          const cleanDate = new Date(userContext.sobrietyDate);
          const daysClean = Math.floor((Date.now() - cleanDate.getTime()) / (1000 * 60 * 60 * 24));
          personalContext += `Clean Date: ${cleanDate.toLocaleDateString()} (${daysClean} days clean)\n`;
        }

        if (userContext.triggers && userContext.triggers.length > 0) {
          personalContext += `\nKnown Triggers:\n`;
          userContext.triggers.forEach((trigger: any) => {
            personalContext += `- ${trigger.name}${trigger.severity ? ` (Severity: ${trigger.severity}/10)` : ''}${trigger.description ? `: ${trigger.description}` : ''}\n`;
          });
        }

        if (userContext.recentJournals && userContext.recentJournals.length > 0) {
          personalContext += `\nRecent Journal Entries (Last 3):\n`;
          userContext.recentJournals.forEach((entry: any) => {
            const date = new Date(entry.date).toLocaleDateString();
            personalContext += `- ${date}: ${entry.content.substring(0, 150)}${entry.content.length > 150 ? '...' : ''}\n`;
          });
        }

        if (userContext.stepProgress) {
          const completedSteps = Object.keys(userContext.stepProgress).filter(step =>
            userContext.stepProgress[step].completed
          );
          if (completedSteps.length > 0) {
            personalContext += `\nCompleted Steps: ${completedSteps.map(s => `Step ${s}`).join(', ')}\n`;
          }
          const currentStep = Object.keys(userContext.stepProgress).find(step =>
            !userContext.stepProgress[step].completed &&
            Object.keys(userContext.stepProgress[step].answers || {}).length > 0
          );
          if (currentStep) {
            personalContext += `Currently Working On: Step ${currentStep}\n`;
          }
        }

        if (userContext.conversationSummary) {
          personalContext += `\nPrevious Conversation Summary:\n${userContext.conversationSummary}\n`;
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
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction
      });

      // Format conversation history for Gemini
      const history = conversationHistory?.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })) || [];

      // Start chat with history
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.8,
        },
      });

      // Send message and get response
      const result = await chat.sendMessage(message);
      const responseText = result.response.text();

      res.json({ response: responseText });
    } catch (error: any) {
      console.error('Error in AI sponsor chat:', error);

      // Handle rate limiting
      if (error.status === 429 || error.message?.includes('quota')) {
        return res.status(429).json({
          message: 'Too many requests. Please wait a moment and try again.',
          response: "I'm receiving a lot of messages right now. Please wait a moment and try again. If you need immediate support, consider calling your sponsor or attending a meeting."
        });
      }

      // Generic error response
      res.status(500).json({
        message: 'Failed to get AI response',
        response: "I'm having trouble responding right now. Please try again in a moment, or reach out to your sponsor or a trusted person if you need immediate support."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
