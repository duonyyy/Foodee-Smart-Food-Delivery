import { Server, Socket } from 'socket.io';
import { Message } from 'src/entities/message.entity';
import { ChatGateway } from '../../../../../../src/features/communications/messenger/gateways/chat.gateway';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;

  beforeEach(() => {
    gateway = new ChatGateway();

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      id: 'client-chat-1',
      data: {
        user: { id: 'user-chat-1' },
      },
      join: jest.fn(),
      leave: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    gateway.server = mockServer as Server;
  });

  describe('conversation rooms', () => {
    it('should join conversation room', () => {
      const response = gateway.handleJoinConversation(mockClient as Socket, {
        conversationId: 'conv-100',
      });

      expect(mockClient.join).toHaveBeenCalledWith('conversation:conv-100');
      expect(response).toEqual({ event: 'joined', room: 'conversation:conv-100' });
    });

    it('should return error if conversationId is missing', () => {
      const response = gateway.handleJoinConversation(
        mockClient as Socket,
        {} as { conversationId: string },
      );

      expect(response).toEqual({ event: 'error', message: 'conversationId is required' });
    });

    it('should leave conversation room', () => {
      const response = gateway.handleLeaveConversation(mockClient as Socket, {
        conversationId: 'conv-100',
      });

      expect(mockClient.leave).toHaveBeenCalledWith('conversation:conv-100');
      expect(response).toEqual({ event: 'left', room: 'conversation:conv-100' });
    });

    it('should broadcast typing event to conversation room excluding sender', () => {
      gateway.handleTyping(mockClient as Socket, {
        conversationId: 'conv-100',
        isTyping: true,
      });

      expect(mockClient.to).toHaveBeenCalledWith('conversation:conv-100');
      expect(mockClient.emit).toHaveBeenCalledWith('chat:typing', {
        conversationId: 'conv-100',
        userId: 'user-chat-1',
        isTyping: true,
      });
    });
  });

  describe('notifications', () => {
    it('should notify when message is sent', () => {
      const mockMessage = {
        id: 'msg-1',
        content: 'Hello there',
        createdAt: new Date().toISOString(),
      } as unknown as Message;

      gateway.notifyMessageSent('conv-100', mockMessage);

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-100');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'chat:message_sent',
        expect.objectContaining({
          event: 'chat:message_sent',
          conversationId: 'conv-100',
          message: mockMessage,
        }),
      );
    });

    it('should notify when messages are read', () => {
      gateway.notifyMessagesRead('conv-100', 'user-reader-1');

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-100');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'chat:messages_read',
        expect.objectContaining({
          event: 'chat:messages_read',
          conversationId: 'conv-100',
          userId: 'user-reader-1',
        }),
      );
    });
  });
});
