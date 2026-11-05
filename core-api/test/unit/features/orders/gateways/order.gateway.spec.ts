import { Server, Socket } from 'socket.io';
import { Order } from 'src/entities/order.entity';
import { OrderGateway } from '../../../../../src/features/orders/gateways/order.gateway';

describe('OrderGateway', () => {
  let gateway: OrderGateway;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;
  let mockOrderRepository: { findOne: jest.Mock };
  let mockMerchantRestaurantsService: { assertCanManageRestaurant: jest.Mock };

  beforeEach(() => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      id: 'client-socket-1',
      data: {
        user: { id: 'user-789', role: 'customer' },
      },
      join: jest.fn(),
      leave: jest.fn(),
    };

    mockOrderRepository = {
      findOne: jest.fn(),
    };

    mockMerchantRestaurantsService = {
      assertCanManageRestaurant: jest.fn(),
    };

    gateway = new OrderGateway(
      mockOrderRepository as never,
      mockMerchantRestaurantsService as never,
    );
    gateway.server = mockServer as Server;
  });

  describe('joinOrderTracking - Authorization & IDOR/BOLA Protection', () => {
    it('allows the customer who owns the order to join tracking room', async () => {
      mockOrderRepository.findOne.mockResolvedValue({
        id: 'order-123',
        user: { id: 'user-789' },
        restaurant: { id: 'rest-1', owner: { id: 'owner-1' } },
      });

      const response = await gateway.handleJoinOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-123');
      expect(response).toEqual({ event: 'joined', room: 'order:order-123' });
    });

    it('allows the restaurant owner to join tracking room', async () => {
      mockClient.data = { user: { id: 'owner-1', role: 'restaurant_owner' } };
      mockOrderRepository.findOne.mockResolvedValue({
        id: 'order-123',
        user: { id: 'customer-999' },
        restaurant: { id: 'rest-1', owner: { id: 'owner-1' } },
      });

      const response = await gateway.handleJoinOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-123');
      expect(response).toEqual({ event: 'joined', room: 'order:order-123' });
    });

    it('allows the assigned shipper to join tracking room', async () => {
      mockClient.data = { user: { id: 'shipper-55', role: 'shipper' } };
      mockOrderRepository.findOne.mockResolvedValue({
        id: 'order-123',
        user: { id: 'customer-999' },
        restaurant: { id: 'rest-1', owner: { id: 'owner-1' } },
        shippingDetail: { shipper: { id: 'shipper-55' } },
      });

      const response = await gateway.handleJoinOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-123');
      expect(response).toEqual({ event: 'joined', room: 'order:order-123' });
    });

    it('allows admin users to join any tracking room', async () => {
      mockClient.data = { user: { id: 'admin-1', role: 'admin' } };
      mockOrderRepository.findOne.mockResolvedValue({
        id: 'order-123',
        user: { id: 'stranger-user' },
        restaurant: { id: 'rest-1', owner: { id: 'stranger-owner' } },
      });

      const response = await gateway.handleJoinOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-123');
      expect(response).toEqual({ event: 'joined', room: 'order:order-123' });
    });

    it('rejects an unauthorized user attempting to track another person\'s order (IDOR)', async () => {
      mockClient.data = { user: { id: 'attacker-id', role: 'customer' } };
      mockOrderRepository.findOne.mockResolvedValue({
        id: 'order-123',
        user: { id: 'victim-id' },
        restaurant: { id: 'rest-1', owner: { id: 'victim-owner' } },
      });

      const response = await gateway.handleJoinOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(response).toEqual({
        event: 'error',
        message: 'Forbidden: You do not have permission to track this order',
      });
    });

    it('returns error when order is not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      const response = await gateway.handleJoinOrderTracking(mockClient as Socket, {
        orderId: 'non-existent-order',
      });

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(response).toEqual({ event: 'error', message: 'Order not found' });
    });

    it('returns error when orderId is missing', async () => {
      const response = await gateway.handleJoinOrderTracking(
        mockClient as Socket,
        {} as { orderId: string },
      );

      expect(response).toEqual({ event: 'error', message: 'orderId is required' });
    });

    it('returns error when client has no authenticated user', async () => {
      mockClient.data = {};

      const response = await gateway.handleJoinOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(response).toEqual({
        event: 'error',
        message: 'Unauthorized: No authenticated user',
      });
    });

    it('leaves order tracking room', () => {
      const response = gateway.handleLeaveOrderTracking(mockClient as Socket, {
        orderId: 'order-123',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('order:order-123');
      expect(response).toEqual({ event: 'left', room: 'order:order-123' });
    });
  });

  describe('joinRestaurantOrders - Authorization & BOLA Protection', () => {
    it('allows verified restaurant owner to join restaurant room', async () => {
      mockClient.data = { user: { id: 'owner-123', role: 'restaurant_owner' } };
      mockMerchantRestaurantsService.assertCanManageRestaurant.mockResolvedValue(undefined);

      const response = await gateway.handleJoinRestaurantOrders(mockClient as Socket, {
        restaurantId: 'rest-456',
      });

      expect(mockMerchantRestaurantsService.assertCanManageRestaurant).toHaveBeenCalledWith(
        'rest-456',
        'owner-123',
      );
      expect(mockClient.join).toHaveBeenCalledWith('restaurant:rest-456');
      expect(response).toEqual({ event: 'joined', room: 'restaurant:rest-456' });
    });

    it('allows admin to join restaurant room without ownership check', async () => {
      mockClient.data = { user: { id: 'admin-1', role: 'admin' } };

      const response = await gateway.handleJoinRestaurantOrders(mockClient as Socket, {
        restaurantId: 'rest-456',
      });

      expect(mockMerchantRestaurantsService.assertCanManageRestaurant).not.toHaveBeenCalled();
      expect(mockClient.join).toHaveBeenCalledWith('restaurant:rest-456');
      expect(response).toEqual({ event: 'joined', room: 'restaurant:rest-456' });
    });

    it('rejects unauthorized user trying to listen to restaurant orders', async () => {
      mockClient.data = { user: { id: 'stranger-id', role: 'customer' } };
      mockMerchantRestaurantsService.assertCanManageRestaurant.mockRejectedValue(
        new Error('Forbidden'),
      );

      const response = await gateway.handleJoinRestaurantOrders(mockClient as Socket, {
        restaurantId: 'rest-456',
      });

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(response).toEqual({
        event: 'error',
        message: 'Forbidden: You do not have permission to access this restaurant',
      });
    });

    it('leaves restaurant orders room', () => {
      const response = gateway.handleLeaveRestaurantOrders(mockClient as Socket, {
        restaurantId: 'rest-456',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('restaurant:rest-456');
      expect(response).toEqual({ event: 'left', room: 'restaurant:rest-456' });
    });
  });

  describe('joinUserOrders - Authorization & BOLA Protection', () => {
    it('allows user to join their own room', () => {
      mockClient.data = { user: { id: 'user-789', role: 'customer' } };

      const response = gateway.handleJoinUserOrders(mockClient as Socket, {
        userId: 'user-789',
      });

      expect(mockClient.join).toHaveBeenCalledWith('user:user-789');
      expect(response).toEqual({ event: 'joined', room: 'user:user-789' });
    });

    it('allows admin to join any user room', () => {
      mockClient.data = { user: { id: 'admin-1', role: 'admin' } };

      const response = gateway.handleJoinUserOrders(mockClient as Socket, {
        userId: 'user-789',
      });

      expect(mockClient.join).toHaveBeenCalledWith('user:user-789');
      expect(response).toEqual({ event: 'joined', room: 'user:user-789' });
    });

    it('rejects user attempting to join another user\'s personal order room', () => {
      mockClient.data = { user: { id: 'attacker-id', role: 'customer' } };

      const response = gateway.handleJoinUserOrders(mockClient as Socket, {
        userId: 'victim-id',
      });

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(response).toEqual({
        event: 'error',
        message: 'Forbidden: You cannot subscribe to another user\'s orders',
      });
    });

    it('leaves user orders room', () => {
      const response = gateway.handleLeaveUserOrders(mockClient as Socket, {
        userId: 'user-789',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('user:user-789');
      expect(response).toEqual({ event: 'left', room: 'user:user-789' });
    });
  });

  describe('notifications emission - DTO Sanitization & Leak Prevention', () => {
    it('emits sanitized OrderSocketResponseDto for order:created without internal entity fields', () => {
      const mockRawEntity = {
        id: 'order-123',
        status: 'pending',
        total: 150000,
        shippingFee: 20000,
        restaurant: { id: 'rest-456', name: 'Pho Ha Noi', image: 'pho.jpg' },
        user: { id: 'user-789', name: 'Nguyen Van A', email: 'a@example.com', passwordHash: 'SECRET_HASH' },
      } as unknown as Order;

      gateway.notifyOrderCreated(mockRawEntity);

      expect(mockServer.to).toHaveBeenCalledWith('restaurant:rest-456');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-789');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'order:created',
        expect.objectContaining({
          event: 'order:created',
          orderId: 'order-123',
          order: expect.objectContaining({
            id: 'order-123',
            status: 'pending',
            total: 150000,
            user: {
              id: 'user-789',
              name: 'Nguyen Van A',
              email: 'a@example.com',
            },
          }),
        }),
      );

      // Verify sensitive passwordHash was NOT leaked to the socket event payload
      const emittedPayload = (mockServer.emit as jest.Mock).mock.calls[0][1];
      expect(emittedPayload.order.user.passwordHash).toBeUndefined();
    });

    it('emits sanitized OrderSocketResponseDto for order:status_updated', () => {
      const mockRawEntity = {
        id: 'order-123',
        status: 'confirmed',
        restaurant: { id: 'rest-456', name: 'Pho Ha Noi' },
        user: { id: 'user-789', name: 'Nguyen Van A' },
      } as unknown as Order;

      gateway.notifyOrderStatusUpdated(mockRawEntity);

      expect(mockServer.to).toHaveBeenCalledWith('order:order-123');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-789');
      expect(mockServer.to).toHaveBeenCalledWith('restaurant:rest-456');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'order:status_updated',
        expect.objectContaining({
          event: 'order:status_updated',
          orderId: 'order-123',
          status: 'confirmed',
          order: expect.objectContaining({
            id: 'order-123',
            status: 'confirmed',
          }),
        }),
      );
    });
  });
});
