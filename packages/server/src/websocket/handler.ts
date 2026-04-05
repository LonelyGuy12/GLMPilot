import { Server as SocketServer, Socket } from 'socket.io';
import { WS_EVENTS } from './events.js';
import { glm } from '../services/glm-client.js';
import { orchestrator } from '../agents/orchestrator.js';
import { logger } from '../utils/logger.js';
import { handleCodeExecution, sendProcessInput, cancelGraceKill, scheduleGraceKill } from './execution.js';
import { getStableSessionId } from './session-id.js';
import type { WSCompletionRequest, WSReviewRequest, WSChatMessage, AgentType, WSExecuteRequest } from '@glmpilot/shared';

const activeAbortControllers = new Map<string, AbortController>();

export function setupWebSocketHandlers(io: SocketServer) {
  io.on('connection', (socket: Socket) => {
    const sessionId = getStableSessionId(socket);
    socket.join(sessionId);
    cancelGraceKill(sessionId);
    logger.info(`WebSocket connected: ${socket.id} (session: ${sessionId})`);

    // Code completion
    socket.on(WS_EVENTS.COMPLETION_REQUEST, async (data: WSCompletionRequest) => {
      try {
        const contextStr = data.contextFiles
          ?.slice(0, 3)
          .map(f => f.content.split('\n').slice(0, 100).join('\n'))
          .join('\n\n') || '';

        const suggestion = await glm.completeCode(data.prefix, data.suffix, data.language, contextStr);
        socket.emit(WS_EVENTS.COMPLETION_RESULT, {
          suggestion,
          filePath: data.filePath,
          cursorOffset: data.prefix.length,
        });
      } catch (error) {
        logger.error('Completion error', { error: (error as Error).message });
        socket.emit(WS_EVENTS.COMPLETION_RESULT, { suggestion: '', filePath: data.filePath });
      }
    });

    // Full review
    socket.on(WS_EVENTS.REVIEW_START, async (data: WSReviewRequest) => {
      try {
        const files = new Map(Object.entries(data.files));
        const agents = data.agents as AgentType[] | undefined;

        orchestrator.on('progress', (event) => {
          socket.emit(WS_EVENTS.REVIEW_PROGRESS, event);
        });

        const result = await orchestrator.reviewCodebase(files, { agents });
        socket.emit(WS_EVENTS.REVIEW_COMPLETE, result);

        orchestrator.removeAllListeners('progress');
      } catch (error) {
        logger.error('Review error', { error: (error as Error).message });
        socket.emit(WS_EVENTS.REVIEW_COMPLETE, { error: (error as Error).message });
        orchestrator.removeAllListeners('progress');
      }
    });

    // Single file review
    socket.on(WS_EVENTS.REVIEW_FILE, async (data: { filePath: string; content: string }) => {
      try {
        const result = await orchestrator.reviewSingleFile(data.filePath, data.content);
        socket.emit(WS_EVENTS.REVIEW_FILE_RESULT, result);
      } catch (error) {
        logger.error('File review error', { error: (error as Error).message });
        socket.emit(WS_EVENTS.REVIEW_FILE_RESULT, { error: (error as Error).message });
      }
    });

    // Code execution (use stable sessionId so stdin/output stay matched after socket.io reconnects)
    socket.on(WS_EVENTS.EXECUTE_REQUEST, async (data: WSExecuteRequest) => {
      await handleCodeExecution(io, sessionId, data);
    });

    socket.on(
      WS_EVENTS.EXECUTE_INPUT,
      (data: { runId: string; input: string }, ack?: (r: { ok: boolean }) => void) => {
        logger.debug(`EXECUTE_INPUT run ${data.runId}: ${JSON.stringify(data.input)}`);
        const success = sendProcessInput(data.runId, data.input);
        if (typeof ack === 'function') ack({ ok: success });
        if (!success) {
          logger.warn(`Failed stdin for runId ${data.runId}`);
        }
      }
    );

    // Chat with streaming
    socket.on(WS_EVENTS.CHAT_MESSAGE, async (data: WSChatMessage) => {
      const abortController = new AbortController();
      activeAbortControllers.set(socket.id, abortController);

      try {
        const messages = [
          {
            role: 'system' as const,
            content: 'You are GLMPilot AI, an expert frontend development assistant. You help with HTML, CSS, JavaScript, TypeScript, React, Vue, Svelte, Next.js, Tailwind CSS, and all frontend technologies. Provide clear, concise, and accurate code with explanations. When showing code, use appropriate language tags in code blocks.',
          },
          ...data.history,
          { role: 'user' as const, content: data.message },
        ];

        const stream = glm.chatStream(messages, { temperature: 0.7 }, abortController.signal);
        for await (const token of stream) {
          socket.emit(WS_EVENTS.CHAT_TOKEN, { token });
        }
        socket.emit(WS_EVENTS.CHAT_COMPLETE, {});
      } catch (error) {
        if (!abortController.signal.aborted) {
          logger.error('Chat error', { error: (error as Error).message });
          socket.emit(WS_EVENTS.CHAT_ERROR, { error: (error as Error).message });
        }
      } finally {
        activeAbortControllers.delete(socket.id);
      }
    });

    // Stop chat generation
    socket.on(WS_EVENTS.CHAT_STOP, () => {
      const controller = activeAbortControllers.get(socket.id);
      if (controller) {
        controller.abort();
        activeAbortControllers.delete(socket.id);
      }
    });

    socket.on('disconnect', () => {
      const controller = activeAbortControllers.get(socket.id);
      if (controller) controller.abort();
      activeAbortControllers.delete(socket.id);

      scheduleGraceKill(sessionId);

      logger.info(`WebSocket disconnected: ${socket.id} (session: ${sessionId})`);
    });
  });
}
