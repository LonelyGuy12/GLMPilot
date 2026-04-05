import { Router, Request, Response } from 'express';
import { github } from '../services/github.service.js';
import { orchestrator } from '../agents/orchestrator.js';
import { defaultLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post('/import', defaultLimiter, async (req: Request, res: Response) => {
  try {
    const { url, branch } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'GitHub URL is required' } });
    }

    const { owner, repo } = github.parseRepoUrl(url);
    const fileTree = await github.getRepoTree(owner, repo, branch);
    const files = await github.getRepoFiles(owner, repo, branch);

    const filesObj: Record<string, string> = {};
    for (const [path, content] of files) {
      filesObj[path] = content;
    }

    res.json({
      success: true,
      data: {
        fileTree,
        files: filesObj,
        totalFiles: files.size,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'GITHUB_ERROR', message: (error as Error).message } });
  }
});

router.post('/pr', defaultLimiter, async (req: Request, res: Response) => {
  try {
    const { owner, repo, baseBranch, changes, title, body } = req.body;

    if (!owner || !repo || !changes) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'owner, repo, and changes are required' } });
    }

    const prUrl = await github.createPR(
      owner, repo, baseBranch || 'main', changes, title || 'GLMPilot Fixes', body || ''
    );

    res.json({ success: true, data: { prUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'GITHUB_ERROR', message: (error as Error).message } });
  }
});

router.get('/repo/:owner/:repo/tree', defaultLimiter, async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch as string | undefined;
    const tree = await github.getRepoTree(owner, repo, branch);
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'GITHUB_ERROR', message: (error as Error).message } });
  }
});

export { router as githubRoutes };
