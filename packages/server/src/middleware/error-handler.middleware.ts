import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled error', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
  });

  const statusCode = (err as unknown as Record<string, unknown>).statusCode as number || 500;
  const code = (err as unknown as Record<string, unknown>).code as string || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: process.env.NODE_ENV === 'production' ? 'An internal error occurred' : err.message,
    },
  });
}
