import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In monorepos, we often want to load from the root .env
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
// Fallback if running from a different context
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  CLIENT_URL: string;
  GLM_API_KEY: string;
  GLM_BASE_URL: string;
  GLM_MODEL: string;
  GITHUB_TOKEN: string;
  REDIS_URL: string;
  LOG_LEVEL: string;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'production') {
    // Suppress crash to allow the ide to boot without AI features
    // throw new Error(`Missing required environment variable: ${key}`);
    return '';
  }
  return (value || '').trim();
}

export const config: EnvConfig = {
  NODE_ENV: (process.env.NODE_ENV || 'development').trim(),
  PORT: process.env.NODE_ENV === 'production' ? 7860 : parseInt(process.env.PORT || '3001', 10),
  CLIENT_URL: (process.env.NODE_ENV === 'production' ? '*' : (process.env.CLIENT_URL || 'http://localhost:5173')).trim(),
  GLM_API_KEY: required('GLM_API_KEY'),
  GLM_BASE_URL: (process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/').trim(),
  GLM_MODEL: (process.env.GLM_MODEL || 'glm-5').trim(),
  GITHUB_TOKEN: (process.env.GITHUB_TOKEN || '').trim(),
  REDIS_URL: (process.env.REDIS_URL || 'redis://localhost:6379').trim(),
  LOG_LEVEL: (process.env.LOG_LEVEL || 'debug').trim(),
};
