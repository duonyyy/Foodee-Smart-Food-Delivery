'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketManager } from '@/shared/socket/socket-manager';
import {
  DeliveryOfferPayload,
  DeliveryAssignedPayload,
  DeliveryLocationUpdatedPayload,
} from '@/shared/socket/types';

export interface UseDeliverySocketOptions {
  shipperId?: string;
  orderId?: string;
  autoJoin?: boolean;
  onLocationUpdated?: (payload: DeliveryLocationUpdatedPayload) => void;
  onOffer?: (payload: DeliveryOfferPayload) => void;
  onAssigned?: (payload: DeliveryAssignedPayload) => void;
}

export function useDeliverySocket(options: UseDeliverySocketOptions = {}) {
  const {
    shipperId,
    orderId,
    autoJoin = true,
    onLocationUpdated,
    onOffer,
    onAssigned,
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestLocation, setLatestLocation] = useState<DeliveryLocationUpdatedPayload | null>(null);
  const [latestOffer, setLatestOffer] = useState<DeliveryOfferPayload | null>(null);
  const [latestAssigned, setLatestAssigned] = useState<DeliveryAssignedPayload | null>(null);

  const callbacksRef = useRef({ onLocationUpdated, onOffer, onAssigned });
  useEffect(() => {
    callbacksRef.current = { onLocationUpdated, onOffer, onAssigned };
  }, [onLocationUpdated, onOffer, onAssigned]);

  const joinShipperChannel = useCallback((id: string) => {
    const socket = socketManager.getSocket('/delivery');
    if (socket && id) {
      socket.emit('joinShipperChannel', { shipperId: id });
    }
  }, []);

  const leaveShipperChannel = useCallback((id: string) => {
    const socket = socketManager.getSocket('/delivery');
    if (socket && id) {
      socket.emit('leaveShipperChannel', { shipperId: id });
    }
  }, []);

  const trackDelivery = useCallback((id: string) => {
    const socket = socketManager.getSocket('/delivery');
    if (socket && id) {
      socket.emit('trackDelivery', { orderId: id });
    }
  }, []);

  const untrackDelivery = useCallback((id: string) => {
    const socket = socketManager.getSocket('/delivery');
    if (socket && id) {
      socket.emit('untrackDelivery', { orderId: id });
    }
  }, []);

  const updateLocation = useCallback(
    (data: { latitude: number; longitude: number; orderId?: string; shipperId?: string }) => {
      const socket = socketManager.getSocket('/delivery');
      if (socket) {
        socket.emit('updateLocation', data);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = socketManager.getSocket('/delivery');
    if (!socket) return;

    setIsConnected(socket.connected);

    const syncRooms = () => {
      setIsConnected(true);
      if (!autoJoin) return;
      if (shipperId) socket.emit('joinShipperChannel', { shipperId });
      if (orderId) socket.emit('trackDelivery', { orderId });
    };

    const handleConnect = () => syncRooms();
    const handleDisconnect = () => setIsConnected(false);

    const handleLocationUpdated = (payload: DeliveryLocationUpdatedPayload) => {
      // Filter if tracking specific order or shipper
      if (orderId && payload.orderId && payload.orderId !== orderId) return;
      if (shipperId && payload.shipperId !== shipperId) return;

      setLatestLocation(payload);
      if (callbacksRef.current.onLocationUpdated) {
        callbacksRef.current.onLocationUpdated(payload);
      }
    };

    const handleOffer = (payload: DeliveryOfferPayload) => {
      if (shipperId && payload.targetShipperId !== shipperId) return;
      setLatestOffer(payload);
      if (callbacksRef.current.onOffer) {
        callbacksRef.current.onOffer(payload);
      }
    };

    const handleAssigned = (payload: DeliveryAssignedPayload) => {
      if (orderId && payload.orderId !== orderId) return;
      if (shipperId && payload.shipperId !== shipperId) return;
      setLatestAssigned(payload);
      if (callbacksRef.current.onAssigned) {
        callbacksRef.current.onAssigned(payload);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('delivery:location_updated', handleLocationUpdated);
    socket.on('delivery:offer', handleOffer);
    socket.on('delivery:assigned', handleAssigned);

    if (socket.connected) {
      syncRooms();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('delivery:location_updated', handleLocationUpdated);
      socket.off('delivery:offer', handleOffer);
      socket.off('delivery:assigned', handleAssigned);

      if (autoJoin) {
        if (shipperId) socket.emit('leaveShipperChannel', { shipperId });
        if (orderId) socket.emit('untrackDelivery', { orderId });
      }
    };
  }, [shipperId, orderId, autoJoin]);

  return {
    isConnected,
    latestLocation,
    latestOffer,
    latestAssigned,
    updateLocation,
    trackDelivery,
    untrackDelivery,
    joinShipperChannel,
    leaveShipperChannel,
  };
}

