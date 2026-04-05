import { Router, Request, Response } from 'express';
import { glm } from '../services/glm-client.js';
import { defaultLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post('/generate', defaultLimiter, async (req: Request, res: Response) => {
  try {
    const { code, language, type = 'jsdoc' } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Code is required' } });
    }

    const systemPrompt = type === 'readme'
      ? 'You are a documentation expert. Generate a comprehensive README.md from the provided code. Include: project overview, features, installation, usage, API docs, and contributing guide. Output markdown only.'
      : 'You are a documentation expert. Generate JSDoc/TSDoc comments for all functions, classes, and interfaces in the provided code. Output the fully documented code. Output code only without markdown fencing.';

    const result = await glm.analyzeCode(code, `Generate ${type} documentation for this ${language || 'TypeScript'} code:`, systemPrompt);

    res.json({ success: true, data: { documentation: result } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'DOCS_ERROR', message: (error as Error).message } });
  }
});

export { router as docsRoutes };
