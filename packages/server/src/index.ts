import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { apiRoutes } from './routes/index.js';
import { setupWebSocketHandlers } from './websocket/handler.js';
import { logger } from './utils/logger.js';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: config.CLIENT_URL === '*' ? true : config.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', apiRoutes);

// Error handler
app.use(errorHandler);

// Serve static frontend in production
if (config.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // In dist/index.js, __dirname is packages/server/dist
  // So we go up 3 levels: dist -> server -> packages -> then into client/dist
  const clientPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// WebSocket
setupWebSocketHandlers(io);

httpServer.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(
      `Port ${config.PORT} is already in use (another GLMPilot server or app is listening). ` +
        `Stop that process, or set a different PORT in .env (e.g. PORT=3002). ` +
        `Find PID: lsof -nP -iTCP:${config.PORT} -sTCP:LISTEN`
    );
  } else {
    logger.error('HTTP server failed to start', err);
  }
  process.exit(1);
});

// Start server
httpServer.listen(config.PORT, '0.0.0.0', () => {
  logger.info(`🚀 GLMPilot server running on port ${config.PORT}`);
  logger.info(`   Environment: ${config.NODE_ENV}`);
  logger.info(`   Client URL: ${config.CLIENT_URL}`);
});

export { app, httpServer, io };
