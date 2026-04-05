import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { glm } from '../services/glm-client.js';
import { cache } from '../services/cache.service.js';
import { completionLimiter } from '../middleware/rate-limit.middleware.js';
import { CACHE_TTL } from '@glmpilot/shared';

const router = Router();

router.post('/', completionLimiter, async (req: Request, res: Response) => {
  try {
    const { prefix, suffix, language, contextFiles } = req.body;

    if (!prefix && !suffix) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Prefix or suffix is required' } });
    }

    // Build cache key
    const keyInput = (prefix?.slice(-200) || '') + (suffix?.slice(0, 200) || '') + language;
    const cacheKey = `completion:${crypto.createHash('sha256').update(keyInput).digest('hex')}`;

    const suggestion = await cache.getCachedOrCompute(
      cacheKey,
      async () => {
        const context = contextFiles
          ?.slice(0, 3)
          .map((f: { path: string; content: string }) => f.content.split('\n').slice(0, 100).join('\n'))
          .join('\n\n') || '';

        return glm.completeCode(prefix || '', suffix || '', language || 'javascript', context);
      },
      CACHE_TTL.COMPLETION
    );

    res.json({ success: true, data: { suggestion } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'COMPLETION_ERROR', message: (error as Error).message } });
  }
});

router.post('/chat', completionLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    const response = await glm.chat([
      { role: 'system', content: 'You are a code completion assistant. Provide concise code suggestions.' },
      ...history,
      { role: 'user', content: message },
    ]);

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'COMPLETION_ERROR', message: (error as Error).message } });
  }
});

export { router as completeRoutes };
