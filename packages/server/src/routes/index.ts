import { Router } from 'express';
import { chatRoutes } from './chat.routes.js';
import { completeRoutes } from './complete.routes.js';
import { analyzeRoutes } from './analyze.routes.js';
import { githubRoutes } from './github.routes.js';
import { docsRoutes } from './docs.routes.js';

const router = Router();

router.use('/chat', chatRoutes);
router.use('/complete', completeRoutes);
router.use('/analyze', analyzeRoutes);
router.use('/github', githubRoutes);
router.use('/docs', docsRoutes);

export { router as apiRoutes };
