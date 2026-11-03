'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from '@/shared/socket/socket-manager';
import { NotificationReceivedPayload } from '@/shared/socket/types';

export interface UseNotificationSocketOptions {
  userId?: string;
  autoJoin?: boolean;
  onNotification?: (payload: NotificationReceivedPayload) => void;
}

export function useNotificationSocket(options: UseNotificationSocketOptions = {}) {
  const { userId, autoJoin = true, onNotification } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestNotification, setLatestNotification] = useState<NotificationReceivedPayload | null>(null);
  const [notifications, setNotifications] = useState<NotificationReceivedPayload[]>([]);

  const onNotificationRef = useRef(onNotification);
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const joinNotifications = useCallback((id?: string) => {
    const socket = socketManager.getSocket('/notifications');
    if (socket) {
      socket.emit('joinNotifications', id ? { userId: id } : {});
    }
  }, []);

  const leaveNotifications = useCallback((id?: string) => {
    const socket = socketManager.getSocket('/notifications');
    if (socket) {
      socket.emit('leaveNotifications', id ? { userId: id } : {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = socketManager.getSocket('/notifications');
    if (!socket) return;

    setIsConnected(socket.connected);

    const syncRoom = () => {
      setIsConnected(true);
      if (autoJoin) {
        socket.emit('joinNotifications', userId ? { userId } : {});
      }
    };

    const handleConnect = () => syncRoom();
    const handleDisconnect = () => setIsConnected(false);

    const handleReceived = (payload: NotificationReceivedPayload) => {
      setLatestNotification(payload);
      setNotifications((prev) => [payload, ...prev]);
      if (onNotificationRef.current) {
        onNotificationRef.current(payload);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('notification:received', handleReceived);

    if (socket.connected) {
      syncRoom();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('notification:received', handleReceived);

      if (autoJoin) {
        socket.emit('leaveNotifications', userId ? { userId } : {});
      }
    };
  }, [userId, autoJoin]);

  return {
    isConnected,
    latestNotification,
    notifications,
    clearNotifications,
    joinNotifications,
    leaveNotifications,
  };
}

