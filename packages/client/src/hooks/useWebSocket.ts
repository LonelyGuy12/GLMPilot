import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '@/services/socket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket: socketRef.current, isConnected };
}
