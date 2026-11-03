import { Server, Socket } from 'socket.io';
import { DeliveryGateway } from '../../../../../src/features/delivery/gateways/delivery.gateway';

describe('DeliveryGateway', () => {
  let gateway: DeliveryGateway;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;

  beforeEach(() => {
    gateway = new DeliveryGateway();

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      id: 'shipper-client-socket-1',
      data: {
        user: { id: 'shipper-123' },
      },
      join: jest.fn(),
      leave: jest.fn(),
    };

    gateway.server = mockServer as Server;
  });

  describe('channel subscriptions', () => {
    it('should join shipper channel using authenticated user id', () => {
      const response = gateway.handleJoinShipperChannel(mockClient as Socket);

      expect(mockClient.join).toHaveBeenCalledWith('shipper:shipper-123');
      expect(response).toEqual({ event: 'joined', room: 'shipper:shipper-123' });
    });

    it('should join shipper channel with explicit shipperId', () => {
      const response = gateway.handleJoinShipperChannel(mockClient as Socket, {
        shipperId: 'explicit-shipper-456',
      });

      expect(mockClient.join).toHaveBeenCalledWith('shipper:explicit-shipper-456');
      expect(response).toEqual({ event: 'joined', room: 'shipper:explicit-shipper-456' });
    });

    it('should return error if shipperId cannot be resolved', () => {
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

    it('should join order tracking room', () => {
      const response = gateway.handleTrackDelivery(mockClient as Socket, {
        orderId: 'order-999',
      });

      expect(mockClient.join).toHaveBeenCalledWith('order:order-999');
      expect(response).toEqual({ event: 'joined', room: 'order:order-999' });
    });

    it('should leave order tracking room', () => {
      const response = gateway.handleUntrackDelivery(mockClient as Socket, {
        orderId: 'order-999',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('order:order-999');
      expect(response).toEqual({ event: 'left', room: 'order:order-999' });
    });
  });

  describe('updateLocation message', () => {
    it('should update location and broadcast to rooms', () => {
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
