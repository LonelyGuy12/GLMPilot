import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

/**
 * Optional API key authentication middleware.
 * If AUTH_API_KEY is set in env, requires it in the Authorization header.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = (config as unknown as Record<string, string>)['AUTH_API_KEY'];
  if (!apiKey) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' },
    });
  }
  next();
}
