import type { Request, Response, NextFunction } from "express";

/**
 * Typed Express Request handler
 * @template TBody - Type of request body
 * @template TParams - Type of route parameters
 * @template TQuery - Type of query parameters
 */
export type TypedRequestHandler<
  TBody = unknown,
  TParams = Record<string, string>,
  TQuery = Record<string, unknown>
> = (
  req: Request<TParams, unknown, TBody, TQuery>,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Typed Express Request with body type
 * @template TBody - Type of request body
 */
export type TypedRequest<TBody = unknown> = Request<
  Record<string, string>,
  unknown,
  TBody,
  Record<string, unknown>
>;

/**
 * Typed Express Response
 */
export type TypedResponse = Response;

