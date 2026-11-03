'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketManager } from './socket-manager';
import { SocketNamespace } from './types';

interface SocketContextValue {
  getSocket: (namespace?: SocketNamespace) => Socket | null;
  disconnect: (namespace: SocketNamespace) => void;
  disconnectAll: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  getSocket: (namespace = '/orders') => socketManager.getSocket(namespace),
  disconnect: (namespace) => socketManager.disconnect(namespace),
  disconnectAll: () => socketManager.disconnectAll(),
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      socketManager.disconnectAll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        getSocket: (namespace = '/orders') => socketManager.getSocket(namespace),
        disconnect: (namespace) => socketManager.disconnect(namespace),
        disconnectAll: () => socketManager.disconnectAll(),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to access a namespace socket and track its connection state.
 */
export function useSocket(namespace: SocketNamespace = '/orders') {
  const { getSocket } = useContext(SocketContext);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const s = getSocket(namespace);
    setSocket(s);

    if (!s) return;

    setIsConnected(s.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
    };
  }, [namespace, getSocket]);

  return { socket, isConnected };
}

