import { randomUUID } from 'crypto';
import type { Server as SocketServer } from 'socket.io';
import { exec, spawn, type ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { WS_EVENTS } from '@glmpilot/shared';
import { logger } from '../utils/logger.js';
import type { WSExecuteRequest } from '@glmpilot/shared';
import { getStableSessionId } from './session-id.js';

/** Interactive runs may sit on input(); allow long thought + typing. */
const EXECUTION_TIMEOUT_MS = 120_000;

/** Child processes keyed by per-run id (client sends this with stdin). */
const activeChildProcs = new Map<string, ChildProcess>();
/** Latest run id for a browser tab session (cleared when run ends or new run starts). */
const sessionActiveRunId = new Map<string, string>();

const graceKillTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function cancelGraceKill(sessionId: string): void {
  const t = graceKillTimers.get(sessionId);
  if (t !== undefined) {
    clearTimeout(t);
    graceKillTimers.delete(sessionId);
  }
}

export function scheduleGraceKill(sessionId: string, delayMs = 15000): void {
  cancelGraceKill(sessionId);
  const t = setTimeout(() => {
    graceKillTimers.delete(sessionId);
    cleanupProcess(sessionId);
    logger.debug(`Grace-killed runner for session ${sessionId} after disconnect`);
  }, delayMs);
  graceKillTimers.set(sessionId, t);
}

/** Deliver to every socket whose handshake matches this tab session (rooms alone can fail behind some proxies). */
function emitExec(io: SocketServer, sessionId: string, event: string, payload: object) {
  let n = 0;
  for (const socket of io.sockets.sockets.values()) {
    if (getStableSessionId(socket) === sessionId) {
      socket.emit(event, payload);
      n++;
    }
  }
  if (n === 0) {
    logger.warn(`exec ${event}: no socket matched session ${sessionId}; using room fallback`);
    io.to(sessionId).emit(event, payload);
  }
}

export async function handleCodeExecution(io: SocketServer, sessionId: string, data: WSExecuteRequest) {
  const { language, content } = data;
  let tempDir: string | null = null;

  cancelGraceKill(sessionId);
  cleanupProcess(sessionId);

  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'glmpilot-exec-'));

    if (language === 'python') {
      if (!tempDir) throw new Error('Temp dir not created');
      const dir = tempDir;
      const filePath = path.join(dir, 'main.py');
      await fs.writeFile(filePath, content, 'utf-8');

      await runPipedChild(io, sessionId, 'python3', ['-u', filePath], dir);
    } else if (language === 'java') {
      if (!tempDir) throw new Error('Temp dir not created');
      const dir = tempDir;
      const filePath = path.join(dir, 'Main.java');
      await fs.writeFile(filePath, content, 'utf-8');

      await new Promise<void>((resolve, reject) => {
        exec(`javac Main.java`, { cwd: dir, timeout: 5000 }, (error: Error | null, _stdout: string, stderr: string) => {
          if (error) {
            emitExec(io, sessionId, WS_EVENTS.EXECUTE_TOKEN, { token: stderr || error.message, isError: true });
            reject(new Error('Compilation Failed'));
          } else {
            resolve();
          }
        });
      });

      await runPipedChild(io, sessionId, 'java', ['Main'], dir);
    } else {
      emitExec(io, sessionId, WS_EVENTS.EXECUTE_TOKEN, { token: `Unsupported language: ${language}`, isError: true });
      emitExec(io, sessionId, WS_EVENTS.EXECUTE_COMPLETE, {});
    }
  } catch (err) {
    logger.error('Execution setup error', err);
    emitExec(io, sessionId, WS_EVENTS.EXECUTE_ERROR, { error: (err as Error).message });
    emitExec(io, sessionId, WS_EVENTS.EXECUTE_COMPLETE, {});
  } finally {
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        logger.error(`Failed to cleanup temp dir ${tempDir}`, e);
      }
    }
  }
}

function isCurrentRun(sessionId: string, runId: string): boolean {
  return sessionActiveRunId.get(sessionId) === runId;
}

function runPipedChild(
  io: SocketServer,
  sessionId: string,
  command: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd,
      env: { ...process.env, PYTHONUNBUFFERED: '1' } as NodeJS.ProcessEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const runId = randomUUID();
    sessionActiveRunId.set(sessionId, runId);
    activeChildProcs.set(runId, proc);

    emitExec(io, sessionId, WS_EVENTS.EXECUTE_STARTED, { runId });
    logger.debug(`Spawned ${command} run ${runId} for session ${sessionId}: ${args.join(' ')}`);

    let isFinished = false;
    let settled = false;

    const cleanup = () => {
      activeChildProcs.delete(runId);
      if (sessionActiveRunId.get(sessionId) === runId) {
        sessionActiveRunId.delete(sessionId);
      }
    };

    const releaseSuperseded = () => {
      if (settled) return;
      settled = true;
      isFinished = true;
      clearTimeout(timeoutPath);
      activeChildProcs.delete(runId);
      resolve();
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      isFinished = true;
      clearTimeout(timeoutPath);
      cleanup();
      resolve();
    };

    const timeoutPath = setTimeout(() => {
      if (!isFinished && isCurrentRun(sessionId, runId)) {
        proc.kill('SIGKILL');
        emitExec(io, sessionId, WS_EVENTS.EXECUTE_TOKEN, {
          token: `\n[Execution Terminated: Timeout (${EXECUTION_TIMEOUT_MS / 1000}s)]`,
          isError: true,
        });
      }
    }, EXECUTION_TIMEOUT_MS);

    proc.stdout?.on('data', (chunk: Buffer) => {
      if (!isCurrentRun(sessionId, runId)) return;
      emitExec(io, sessionId, WS_EVENTS.EXECUTE_TOKEN, { token: chunk.toString('utf8') });
    });
    proc.stderr?.on('data', (chunk: Buffer) => {
      if (!isCurrentRun(sessionId, runId)) return;
      emitExec(io, sessionId, WS_EVENTS.EXECUTE_TOKEN, { token: chunk.toString('utf8'), isError: true });
    });

    proc.on('error', (err) => {
      if (!isCurrentRun(sessionId, runId)) {
        releaseSuperseded();
        return;
      }
      emitExec(io, sessionId, WS_EVENTS.EXECUTE_ERROR, { error: err.message });
      emitExec(io, sessionId, WS_EVENTS.EXECUTE_COMPLETE, {});
      finish();
    });

    proc.on('close', (code) => {
      if (settled) return;
      if (!isCurrentRun(sessionId, runId)) {
        releaseSuperseded();
        return;
      }
      emitExec(io, sessionId, WS_EVENTS.EXECUTE_TOKEN, { token: `\n[Process exited with code ${code}]` });
      emitExec(io, sessionId, WS_EVENTS.EXECUTE_COMPLETE, {});
      finish();
    });
  });
}

export function sendProcessInput(runId: string, input: string): boolean {
  const child = activeChildProcs.get(runId);
  if (!child?.stdin || child.stdin.destroyed) {
    logger.warn(`No active process for runId ${runId}. procs=${activeChildProcs.size}`);
    return false;
  }

  logger.debug(`stdin for run ${runId}: ${JSON.stringify(input)}`);
  child.stdin.write(Buffer.from(input, 'utf8'));
  return true;
}

export function cleanupProcess(sessionId: string): void {
  cancelGraceKill(sessionId);
  const runId = sessionActiveRunId.get(sessionId);
  if (runId) {
    const child = activeChildProcs.get(runId);
    if (child) {
      child.kill('SIGKILL');
      activeChildProcs.delete(runId);
    }
    sessionActiveRunId.delete(sessionId);
  }
}
