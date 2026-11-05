import { Server, Socket } from 'socket.io';
import { DeliveryGateway } from '../../../../../src/features/delivery/gateways/delivery.gateway';

describe('DeliveryGateway', () => {
  let gateway: DeliveryGateway;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;
  let mockShippingDetailRepository: { findOne: jest.Mock };

  beforeEach(() => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      id: 'shipper-client-socket-1',
      data: {
        user: { id: 'shipper-123', role: 'shipper' },
      },
      join: jest.fn(),
      leave: jest.fn(),
    };

    mockShippingDetailRepository = {
      findOne: jest.fn(),
    };

    gateway = new DeliveryGateway(mockShippingDetailRepository as never);
    gateway.server = mockServer as Server;
  });

  describe('channel subscriptions - IDOR / BOLA Hardening', () => {
    it('should join shipper channel using authenticated user id', () => {
      const response = gateway.handleJoinShipperChannel(mockClient as Socket);

      expect(mockClient.join).toHaveBeenCalledWith('shipper:shipper-123');
      expect(response).toEqual({ event: 'joined', room: 'shipper:shipper-123' });
    });

    it('rejects non-admin attempting to join another shipper\'s channel with explicit shipperId', () => {
      const response = gateway.handleJoinShipperChannel(mockClient as Socket, {
        shipperId: 'another-shipper-456',
      });

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(response).toEqual({
        event: 'error',
        message: 'Forbidden: You cannot subscribe to another shipper\'s channel',
      });
    });

    it('allows admin to join another shipper\'s channel with explicit shipperId', () => {
      mockClient.data = { user: { id: 'admin-1', role: 'admin' } };

      const response = gateway.handleJoinShipperChannel(mockClient as Socket, {
        shipperId: 'explicit-shipper-456',
      });

      expect(mockClient.join).toHaveBeenCalledWith('shipper:explicit-shipper-456');
      expect(response).toEqual({ event: 'joined', room: 'shipper:explicit-shipper-456' });
    });

    it('should return error if client has no authenticated user', () => {
      const unauthClient = {
        id: 'anon',
        data: {},
        join: jest.fn(),
        leave: jest.fn(),
      } as unknown as Socket;

      const response = gateway.handleJoinShipperChannel(unauthClient);
      expect(response).toEqual({ event: 'error', message: 'shipperId is required' });
    });

    it('should leave shipper channel', () => {
      const response = gateway.handleLeaveShipperChannel(mockClient as Socket);

      expect(mockClient.leave).toHaveBeenCalledWith('shipper:shipper-123');
      expect(response).toEqual({ event: 'left', room: 'shipper:shipper-123' });
    });
  });

  describe('trackDelivery - Authorization & Ownership Protection', () => {
    it('allows assigned shipper to track delivery', async () => {
      mockShippingDetailRepository.findOne.mockResolvedValue({
        id: 'sd-1',
        shipper: { id: 'shipper-123' },
        order: { id: 'order-999', user: { id: 'customer-1' }, restaurant: { owner: { id: 'owner-1' } } },
      });

      const response = await gateway.handleTrackDelivery(mockClient as Socket, {
        orderId: 'order-999',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-999');
      expect(response).toEqual({ event: 'joined', room: 'order:order-999' });
    });

    it('allows customer to track delivery', async () => {
      mockClient.data = { user: { id: 'customer-1', role: 'customer' } };
      mockShippingDetailRepository.findOne.mockResolvedValue({
        id: 'sd-1',
        shipper: { id: 'shipper-123' },
        order: { id: 'order-999', user: { id: 'customer-1' }, restaurant: { owner: { id: 'owner-1' } } },
      });

      const response = await gateway.handleTrackDelivery(mockClient as Socket, {
        orderId: 'order-999',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-999');
      expect(response).toEqual({ event: 'joined', room: 'order:order-999' });
    });

    it('allows restaurant owner to track delivery', async () => {
      mockClient.data = { user: { id: 'owner-1', role: 'restaurant_owner' } };
      mockShippingDetailRepository.findOne.mockResolvedValue({
        id: 'sd-1',
        shipper: { id: 'shipper-123' },
        order: { id: 'order-999', user: { id: 'customer-1' }, restaurant: { owner: { id: 'owner-1' } } },
      });

      const response = await gateway.handleTrackDelivery(mockClient as Socket, {
        orderId: 'order-999',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-999');
      expect(response).toEqual({ event: 'joined', room: 'order:order-999' });
    });

    it('allows admin to track any delivery', async () => {
      mockClient.data = { user: { id: 'admin-1', role: 'admin' } };
      mockShippingDetailRepository.findOne.mockResolvedValue({
        id: 'sd-1',
        shipper: { id: 'shipper-other' },
        order: { id: 'order-999', user: { id: 'cust-other' }, restaurant: { owner: { id: 'own-other' } } },
      });

      const response = await gateway.handleTrackDelivery(mockClient as Socket, {
        orderId: 'order-999',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-999');
      expect(response).toEqual({ event: 'joined', room: 'order:order-999' });
    });

    it('rejects third-party user from tracking delivery (IDOR)', async () => {
      mockClient.data = { user: { id: 'intruder-id', role: 'customer' } };
      mockShippingDetailRepository.findOne.mockResolvedValue({
        id: 'sd-1',
        shipper: { id: 'shipper-123' },
        order: { id: 'order-999', user: { id: 'customer-1' }, restaurant: { owner: { id: 'owner-1' } } },
      });

      const response = await gateway.handleTrackDelivery(mockClient as Socket, {
        orderId: 'order-999',
      });

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(response).toEqual({
        event: 'error',
        message: 'Forbidden: You do not have permission to track this delivery',
      });
    });

    it('returns error when orderId is missing', async () => {
      const response = await gateway.handleTrackDelivery(
        mockClient as Socket,
        {} as { orderId: string },
      );

      expect(response).toEqual({ event: 'error', message: 'orderId is required' });
    });

    it('should leave order tracking room', () => {
      const response = gateway.handleUntrackDelivery(mockClient as Socket, {
        orderId: 'order-999',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('order:order-999');
      expect(response).toEqual({ event: 'left', room: 'order:order-999' });
    });
  });

  describe('updateLocation message - Spoofing Prevention', () => {
    it('should update location using authenticated shipper identity and broadcast to rooms', () => {
      const response = gateway.handleUpdateLocation(mockClient as Socket, {
        latitude: 10.7769,
        longitude: 106.7009,
        orderId: 'order-999',
      });

      expect(response).toEqual({ event: 'location_updated', success: true });
      expect(mockServer.to).toHaveBeenCalledWith('shipper:shipper-123');
      expect(mockServer.to).toHaveBeenCalledWith('order:order-999');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'delivery:location_updated',
        expect.objectContaining({
          event: 'delivery:location_updated',
          shipperId: 'shipper-123',
          latitude: 10.7769,
          longitude: 106.7009,
          orderId: 'order-999',
        }),
      );
    });

    it('prevents non-admin shipper from spoofing another shipperId in location update', () => {
      gateway.handleUpdateLocation(mockClient as Socket, {
        latitude: 10.7769,
        longitude: 106.7009,
        orderId: 'order-999',
        shipperId: 'spoofed-shipper-id',
      });

      // Must broadcast using authenticated shipper-123, NOT spoofed-shipper-id
      expect(mockServer.to).toHaveBeenCalledWith('shipper:shipper-123');
      expect(mockServer.to).not.toHaveBeenCalledWith('shipper:spoofed-shipper-id');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'delivery:location_updated',
        expect.objectContaining({
          shipperId: 'shipper-123',
        }),
      );
    });
  });

  describe('notifications', () => {
    it('should emit delivery:offer to target shipper room', () => {
      const offerData = { orderId: 'order-123', shippingFee: 25000 };
      gateway.notifyShipperOffer('shipper-123', offerData);

      expect(mockServer.to).toHaveBeenCalledWith('shipper:shipper-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'delivery:offer',
        expect.objectContaining({
          event: 'delivery:offer',
          targetShipperId: 'shipper-123',
          offer: offerData,
        }),
      );
    });

    it('should emit delivery:assigned to shipper and order rooms', () => {
      gateway.notifyOrderAssigned('order-123', 'shipper-123');

      expect(mockServer.to).toHaveBeenCalledWith('shipper:shipper-123');
      expect(mockServer.to).toHaveBeenCalledWith('order:order-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'delivery:assigned',
        expect.objectContaining({
          event: 'delivery:assigned',
          orderId: 'order-123',
          shipperId: 'shipper-123',
        }),
      );
    });
  });
});
