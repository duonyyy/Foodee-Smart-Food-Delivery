import { io, Socket } from 'socket.io-client';
import { SocketNamespace } from './types';

/**
 * Retrieves the JWT authentication token from localStorage or cookies.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const local = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
    if (local && local.trim() !== '') return local.trim();

    const cookieMatch = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token=') || row.startsWith('authToken='));
    if (cookieMatch) {
      const val = cookieMatch.split('=')[1];
      if (val) return decodeURIComponent(val.trim());
    }
  } catch (err) {
    console.warn('[SocketManager] Failed to read auth token:', err);
  }

  return null;
}

export function formatAuthHeader(token: string | null): string {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

export class SocketManager {
  private sockets: Map<SocketNamespace, Socket> = new Map();
  private baseUrl: string;

  constructor() {
    const rawUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001';
    this.baseUrl = rawUrl.replace(/\/$/, '');
  }

  /**
   * Lazily retrieves or establishes a Socket.io connection for a given namespace.
   */
  public getSocket(namespace: SocketNamespace = '/orders'): Socket | null {
    if (typeof window === 'undefined') {
      return null;
    }

    let socket = this.sockets.get(namespace);

    if (!socket) {
      const namespacePath = namespace === '/' ? '' : namespace;
      const url = `${this.baseUrl}${namespacePath}`;

      socket = io(url, {
        auth: (cb) => {
          const token = getAuthToken();
          cb({ token: formatAuthHeader(token) });
        },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socket.on('connect', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`📶 [Socket.io] Connected to ${namespace} (id: ${socket?.id})`);
        }
      });

      socket.on('disconnect', (reason) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`📶 [Socket.io] Disconnected from ${namespace}: ${reason}`);
        }
      });

      socket.on('connect_error', (error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`📶 [Socket.io] Connect error on ${namespace}:`, error.message);
        }
        // Refresh token on error so reconnect attempt carries latest token
        const freshToken = getAuthToken();
        if (socket) {
          socket.auth = { token: formatAuthHeader(freshToken) };
        }
      });

      this.sockets.set(namespace, socket);
    } else if (!socket.connected && !socket.active) {
      const freshToken = getAuthToken();
      socket.auth = { token: formatAuthHeader(freshToken) };
      socket.connect();
    }

    return socket;
  }

  /**
   * Disconnects a specific namespace socket and removes it from cache.
   */
  public disconnect(namespace: SocketNamespace): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(namespace);
    }
  }

  /**
   * Disconnects all active namespace connections.
   */
  public disconnectAll(): void {
    for (const [ns, socket] of this.sockets.entries()) {
      try {
        socket.disconnect();
      } catch (err) {
        console.warn(`[SocketManager] Error disconnecting ${ns}:`, err);
      }
    }
    this.sockets.clear();
  }
}

export const socketManager = new SocketManager();

