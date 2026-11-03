import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useOrderSocket } from './use-order-socket';

interface OrderStatusUpdate {
  id: string;
  status: string;
  updatedAt: string;
}

export function useOrderStatusSubscription() {
  const { user } = useAuth();
  const [orderStatusUpdate, setOrderStatusUpdate] = useState<OrderStatusUpdate | null>(null);

  const { isConnected } = useOrderSocket({
    userId: user?.id,
    onStatusUpdated: (payload) => {
      if (payload) {
        setOrderStatusUpdate({
          id: payload.orderId,
          status: payload.status,
          updatedAt: payload.updatedAt,
        });
      }
    },
  });

  return {
    orderStatusUpdate,
    loading: !isConnected,
    error: null,
  };
}
