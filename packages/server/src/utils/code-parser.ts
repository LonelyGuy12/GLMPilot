import { logger } from './logger.js';

/**
 * Extract code blocks from markdown AI responses.
 */
export function extractCodeBlocks(markdown: string): Array<{ language: string; code: string }> {
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({ language: match[1] || 'plaintext', code: match[2].trim() });
  }
  return blocks;
}

/**
 * Parse JSON from potentially malformed AI responses.
 * Attempts multiple strategies: direct parse, markdown extraction, brace matching.
 */
export function parseJSONSafe<T>(raw: string, fallback: T): T {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(raw) as T;
  } catch {
    // continue
  }

  // Strategy 2: Extract from markdown code fence
  const jsonFence = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (jsonFence) {
    try {
      return JSON.parse(jsonFence[1].trim()) as T;
    } catch {
      // continue
    }
  }

  // Strategy 3: Find first { and last }
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.substring(firstBrace, lastBrace + 1)) as T;
    } catch {
      // continue
    }
  }

  // Strategy 4: Find array brackets
  const firstBracket = raw.indexOf('[');
  const lastBracket = raw.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(raw.substring(firstBracket, lastBracket + 1)) as T;
    } catch {
      // continue
    }
  }

  logger.warn('Failed to parse JSON from AI response, using fallback');
  return fallback;
}

/**
 * Strip markdown code fences from a string (for inline completions).
 */
export function stripCodeFences(text: string): string {
  return text.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();
}
