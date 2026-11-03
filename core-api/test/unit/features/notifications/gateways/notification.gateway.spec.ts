import { Server, Socket } from 'socket.io';
import { Notification } from 'src/entities/notification.entity';
import { NotificationGateway } from '../../../../../src/features/notifications/gateways/notification.gateway';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;

  beforeEach(() => {
    gateway = new NotificationGateway();

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      id: 'client-socket-notifications-1',
      data: {
        user: { id: 'auth-user-123' },
      },
      join: jest.fn(),
      leave: jest.fn(),
    };

    gateway.server = mockServer as Server;
  });

  describe('subscriptions', () => {
    it('should join user notification room using client authenticated user id', () => {
      const response = gateway.handleJoinNotifications(mockClient as Socket);

      expect(mockClient.join).toHaveBeenCalledWith('user:auth-user-123');
      expect(response).toEqual({ event: 'joined', room: 'user:auth-user-123' });
    });

    it('should join user notification room with explicit userId from body', () => {
      const response = gateway.handleJoinNotifications(mockClient as Socket, {
        userId: 'custom-user-456',
      });

      expect(mockClient.join).toHaveBeenCalledWith('user:custom-user-456');
      expect(response).toEqual({ event: 'joined', room: 'user:custom-user-456' });
    });

    it('should return error if no userId could be resolved', () => {
      const unauthClient = {
        id: 'anon-client',
        data: {},
        join: jest.fn(),
        leave: jest.fn(),
      } as unknown as Socket;

      const response = gateway.handleJoinNotifications(unauthClient);

      expect(response).toEqual({ event: 'error', message: 'userId is required' });
    });

    it('should leave user notification room', () => {
      const response = gateway.handleLeaveNotifications(mockClient as Socket);

      expect(mockClient.leave).toHaveBeenCalledWith('user:auth-user-123');
      expect(response).toEqual({ event: 'left', room: 'user:auth-user-123' });
    });
  });

  describe('sendNotification', () => {
    it('should emit notification:received to the user room', () => {
      const mockNotification = {
        id: 1,
        receiveUser: 'auth-user-123',
        description: 'New message',
        content: 'You have a message',
        type: 'info',
        createdAt: new Date().toISOString(),
      } as unknown as Notification;

      gateway.sendNotification('auth-user-123', mockNotification);

      expect(mockServer.to).toHaveBeenCalledWith('user:auth-user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'notification:received',
        expect.objectContaining({
          event: 'notification:received',
          notification: mockNotification,
        }),
      );
    });
  });
});
