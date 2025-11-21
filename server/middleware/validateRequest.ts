import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ChatRequest } from "../types/chat";

/**
 * Zod schema for ChatRequest validation
 */
const chatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  userContext: z
    .object({
      name: z.string().optional(),
      sobrietyDate: z.string().optional(),
      triggers: z
        .array(
          z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            severity: z.number().min(1).max(10).optional(),
          })
        )
        .optional(),
      recentJournals: z
        .array(
          z.object({
            date: z.string().optional(),
            content: z.string().optional(),
          })
        )
        .optional(),
      stepProgress: z.record(z.any()).optional(),
      conversationSummary: z.string().optional(),
    })
    .optional(),
  contextWindow: z
    .object({
      recentStepWork: z.array(z.string()).optional(),
      recentJournals: z.array(z.string()).optional(),
      activeScenes: z.array(z.string()).optional(),
      currentStreaks: z.record(z.number()).optional(),
      recentMoodTrend: z.array(z.number()).optional(),
      recentCravingsTrend: z.array(z.number()).optional(),
    })
    .optional(),
  promptType: z.string().optional(),
});

/**
 * Request validation middleware
 * Validates request body against Zod schema
 */
export function validateChatRequest(
  req: Request<{}, {}, ChatRequest>,
  res: Response,
  next: NextFunction
): void {
  try {
    const result = chatRequestSchema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      res.status(400).json({
        message: "Invalid request data",
        response: "Please check your input and try again.",
        errors,
      });
      return;
    }

    // Replace req.body with validated data
    req.body = result.data as ChatRequest;
    next();
  } catch (error) {
    res.status(400).json({
      message: "Validation error",
      response: "Invalid request format. Please check your input and try again.",
    });
  }
}

