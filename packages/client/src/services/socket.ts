import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || '';
const WS_SESSION_KEY = 'glmpilot:ws-session';

function getWebSocketSessionId(): string {
  try {
    const existing = sessionStorage.getItem(WS_SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(WS_SESSION_KEY, id);
    return id;
  } catch {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const sessionId = getWebSocketSessionId();
    socket = io(WS_URL, {
      query: { sessionId },
      auth: { sessionId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('WebSocket connection error:', error.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
