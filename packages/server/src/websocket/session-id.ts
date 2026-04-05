import type { Socket } from 'socket.io';

/** Same logical tab/session as the client sends in `query` + `auth` (must match for stdin + output). */
export function getStableSessionId(socket: Socket): string {
  const auth = socket.handshake.auth as { sessionId?: unknown } | undefined;
  const fromAuth = auth?.sessionId;
  if (typeof fromAuth === 'string' && fromAuth.length > 0) return fromAuth;
  const raw = socket.handshake.query.sessionId;
  const q = Array.isArray(raw) ? raw[0] : raw;
  if (typeof q === 'string' && q.length > 0) return q;
  return socket.id;
}
