import { Server, Socket } from 'socket.io';
import { Order } from 'src/entities/order.entity';
import { OrderGateway } from '../../../../../src/features/orders/gateways/order.gateway';

describe('OrderGateway', () => {
  let gateway: OrderGateway;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;

  beforeEach(() => {
    gateway = new OrderGateway();

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      id: 'client-socket-1',
      join: jest.fn(),
      leave: jest.fn(),
    };

    gateway.server = mockServer as Server;
  });

  describe('room subscriptions', () => {
    it('should join order tracking room', () => {
      const response = gateway.handleJoinOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-123');
      expect(response).toEqual({ event: 'joined', room: 'order:order-123' });
    });

    it('should return error when joining order tracking without orderId', () => {
      const response = gateway.handleJoinOrderTracking(
        mockClient as Socket,
        {} as { orderId: string },
      );

      expect(response).toEqual({ event: 'error', message: 'orderId is required' });
    });

    it('should leave order tracking room', () => {
      const response = gateway.handleLeaveOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('order:order-123');
      expect(response).toEqual({ event: 'left', room: 'order:order-123' });
    });

    it('should join restaurant orders room', () => {
      const response = gateway.handleJoinRestaurantOrders(mockClient as Socket, {
        restaurantId: 'rest-456',
      });

      expect(mockClient.join).toHaveBeenCalledWith('restaurant:rest-456');
      expect(response).toEqual({ event: 'joined', room: 'restaurant:rest-456' });
    });

    it('should join user orders room', () => {
      const response = gateway.handleJoinUserOrders(mockClient as Socket, {
        userId: 'user-789',
      });

      expect(mockClient.join).toHaveBeenCalledWith('user:user-789');
      expect(response).toEqual({ event: 'joined', room: 'user:user-789' });
    });
  });

  describe('notifications emission', () => {
    it('should emit order:created to restaurant and user rooms', () => {
      const mockOrder = {
        id: 'order-123',
        status: 'pending',
        restaurant: { id: 'rest-456' },
        user: { id: 'user-789' },
      } as unknown as Order;

      gateway.notifyOrderCreated(mockOrder);

      expect(mockServer.to).toHaveBeenCalledWith('restaurant:rest-456');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-789');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'order:created',
        expect.objectContaining({
          event: 'order:created',
          orderId: 'order-123',
          order: mockOrder,
        }),
      );
    });

    it('should emit order:status_updated to order, user, and restaurant rooms', () => {
      const mockOrder = {
        id: 'order-123',
        status: 'confirmed',
        restaurant: { id: 'rest-456' },
        user: { id: 'user-789' },
      } as unknown as Order;

      gateway.notifyOrderStatusUpdated(mockOrder);

      expect(mockServer.to).toHaveBeenCalledWith('order:order-123');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-789');
      expect(mockServer.to).toHaveBeenCalledWith('restaurant:rest-456');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'order:status_updated',
        expect.objectContaining({
          event: 'order:status_updated',
          orderId: 'order-123',
          status: 'confirmed',
          order: mockOrder,
        }),
      );
    });
  });
});
