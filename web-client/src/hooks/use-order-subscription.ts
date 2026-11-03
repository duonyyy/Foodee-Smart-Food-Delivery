import { useState } from 'react';
import { useOrderSocket } from './use-order-socket';
import { Order } from '@/interface';

export function useOrderCreatedSubscription(restaurantId: string) {
  const [newOrders, setNewOrders] = useState<Order[]>([]);

  const { isConnected } = useOrderSocket({
    restaurantId,
    onOrderCreated: (payload) => {
      if (payload?.order) {
        setNewOrders((prev) => [payload.order as Order, ...prev]);
      }
    },
  });

  return {
    newOrders,
    loading: !isConnected,
    error: null,
    clearNewOrders: () => setNewOrders([]),
  };
}
