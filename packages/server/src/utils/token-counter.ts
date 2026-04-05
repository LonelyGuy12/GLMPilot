import { estimateTokens } from '@glmpilot/shared';
import { logger } from './logger.js';

/**
 * Estimate token count and warn if approaching limits.
 */
export function countTokens(text: string, context?: string): number {
  const count = estimateTokens(text);
  if (count > 25000) {
    logger.warn(`High token count: ~${count} tokens${context ? ` for ${context}` : ''}`);
  }
  return count;
}

/**
 * Check if text would exceed a token limit.
 */
export function wouldExceedTokenLimit(text: string, limit: number): boolean {
  return estimateTokens(text) > limit;
}
