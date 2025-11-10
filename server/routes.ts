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
      const { message, conversationHistory } = req.body;

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

      // Build conversation context
      const systemInstruction = `You are a compassionate, supportive AI sponsor for people in 12-step recovery programs. Your role is to:

1. Provide emotional support and validation
2. Listen without judgment
3. Offer gentle guidance based on 12-step principles
4. Help users work through difficult moments
5. Encourage reaching out to human sponsors and meetings when appropriate
6. Remind users that you're here to support, not replace, human connection

Key principles:
- Be warm, empathetic, and understanding
- Use a conversational, friendly tone
- Acknowledge feelings and validate experiences
- Suggest coping strategies and self-care when appropriate
- Recognize when professional help or emergency services may be needed
- Never claim to be human or have personal recovery experience
- Respect anonymity and confidentiality
- Encourage connection with the recovery community

If someone is in crisis or danger, always encourage them to:
- Call their sponsor
- Attend a meeting
- Contact emergency services (988 for mental health crisis, 911 for emergencies)
- Reach out to a trusted person

Remember: You're a supportive tool, available 24/7, but you complement—not replace—human sponsors and fellowship.`;

      // Initialize model with system instruction
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
          maxOutputTokens: 1024,
          temperature: 0.7,
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
