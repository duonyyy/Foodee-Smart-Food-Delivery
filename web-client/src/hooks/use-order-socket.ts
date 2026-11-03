'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from '@/shared/socket/socket-manager';
import { OrderCreatedPayload, OrderStatusUpdatedPayload } from '@/shared/socket/types';

export interface UseOrderSocketOptions {
  orderId?: string;
  restaurantId?: string;
  userId?: string;
  autoJoin?: boolean;
  onOrderCreated?: (payload: OrderCreatedPayload) => void;
  onStatusUpdated?: (payload: OrderStatusUpdatedPayload) => void;
}

export function useOrderSocket(options: UseOrderSocketOptions = {}) {
  const {
    orderId,
    restaurantId,
    userId,
    autoJoin = true,
    onOrderCreated,
    onStatusUpdated,
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestCreatedOrder, setLatestCreatedOrder] = useState<OrderCreatedPayload | null>(null);
  const [latestStatusUpdate, setLatestStatusUpdate] = useState<OrderStatusUpdatedPayload | null>(null);

  const callbacksRef = useRef({ onOrderCreated, onStatusUpdated });
  useEffect(() => {
    callbacksRef.current = { onOrderCreated, onStatusUpdated };
  }, [onOrderCreated, onStatusUpdated]);

  const joinOrder = useCallback((id: string) => {
    const socket = socketManager.getSocket('/orders');
    if (socket && id) {
      socket.emit('joinOrderTracking', { orderId: id });
    }
  }, []);

  const leaveOrder = useCallback((id: string) => {
    const socket = socketManager.getSocket('/orders');
    if (socket && id) {
      socket.emit('leaveOrderTracking', { orderId: id });
    }
  }, []);

  const joinRestaurant = useCallback((id: string) => {
    const socket = socketManager.getSocket('/orders');
    if (socket && id) {
      socket.emit('joinRestaurantOrders', { restaurantId: id });
    }
  }, []);

  const leaveRestaurant = useCallback((id: string) => {
    const socket = socketManager.getSocket('/orders');
    if (socket && id) {
      socket.emit('leaveRestaurantOrders', { restaurantId: id });
    }
  }, []);

  const joinUser = useCallback((id: string) => {
    const socket = socketManager.getSocket('/orders');
    if (socket && id) {
      socket.emit('joinUserOrders', { userId: id });
    }
  }, []);

  const leaveUser = useCallback((id: string) => {
    const socket = socketManager.getSocket('/orders');
    if (socket && id) {
      socket.emit('leaveUserOrders', { userId: id });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = socketManager.getSocket('/orders');
    if (!socket) return;

    setIsConnected(socket.connected);

    const syncRooms = () => {
      setIsConnected(true);
      if (!autoJoin) return;
      if (orderId) socket.emit('joinOrderTracking', { orderId });
      if (restaurantId) socket.emit('joinRestaurantOrders', { restaurantId });
      if (userId) socket.emit('joinUserOrders', { userId });
    };

    const handleConnect = () => syncRooms();
    const handleDisconnect = () => setIsConnected(false);

    const handleOrderCreated = (payload: OrderCreatedPayload) => {
      setLatestCreatedOrder(payload);
      if (callbacksRef.current.onOrderCreated) {
        callbacksRef.current.onOrderCreated(payload);
      }
    };

    const handleOrderStatusUpdated = (payload: OrderStatusUpdatedPayload) => {
      setLatestStatusUpdate(payload);
      if (callbacksRef.current.onStatusUpdated) {
        callbacksRef.current.onStatusUpdated(payload);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('order:created', handleOrderCreated);
    socket.on('order:status_updated', handleOrderStatusUpdated);

    if (socket.connected) {
      syncRooms();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('order:created', handleOrderCreated);
      socket.off('order:status_updated', handleOrderStatusUpdated);

      if (autoJoin) {
        if (orderId) socket.emit('leaveOrderTracking', { orderId });
        if (restaurantId) socket.emit('leaveRestaurantOrders', { restaurantId });
        if (userId) socket.emit('leaveUserOrders', { userId });
      }
    };
  }, [orderId, restaurantId, userId, autoJoin]);

  return {
    isConnected,
    latestCreatedOrder,
    latestStatusUpdate,
    joinOrder,
    leaveOrder,
    joinRestaurant,
    leaveRestaurant,
    joinUser,
    leaveUser,
  };
}

