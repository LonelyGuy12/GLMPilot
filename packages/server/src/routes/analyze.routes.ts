import { Router, Request, Response } from 'express';
import { orchestrator } from '../agents/orchestrator.js';
import { analyzeLimiter } from '../middleware/rate-limit.middleware.js';
import type { AgentType } from '@glmpilot/shared';

const router = Router();

router.post('/', analyzeLimiter, async (req: Request, res: Response) => {
  try {
    const { files, agents, mode = 'full' } = req.body;

    if (!files || typeof files !== 'object') {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Files object is required' } });
    }

    const fileMap = new Map(Object.entries(files as Record<string, string>));
    const result = await orchestrator.reviewCodebase(fileMap, {
      agents: agents as AgentType[],
      mode: mode as 'full' | 'quick',
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ANALYZE_ERROR', message: (error as Error).message } });
  }
});

router.post('/file', analyzeLimiter, async (req: Request, res: Response) => {
  try {
    const { filePath, content } = req.body;

    if (!filePath || !content) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'filePath and content are required' } });
    }

    const result = await orchestrator.reviewSingleFile(filePath, content);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ANALYZE_ERROR', message: (error as Error).message } });
  }
});

export { router as analyzeRoutes };
