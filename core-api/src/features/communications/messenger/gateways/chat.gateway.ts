import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from 'src/entities/message.entity';
import { WsJwtGuard } from 'src/features/auth/public-api';

@WebSocketGateway({ namespace: '/chat', cors: true })
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected to /chat: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected from /chat: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) {
      return { event: 'error', message: 'conversationId is required' };
    }
    const room = `conversation:${data.conversationId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return;
    const room = `conversation:${data.conversationId}`;
    client.leave(room);
    this.logger.debug(`Client ${client.id} left room ${room}`);
    return { event: 'left', room };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    if (!data?.conversationId) return;
    const user = client.data?.user as { id?: string; uid?: string } | undefined;
    const userId = user?.id || user?.uid;
    const room = `conversation:${data.conversationId}`;

    client.to(room).emit('chat:typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: !!data.isTyping,
    });
  }

  notifyMessageSent(conversationId: string, message: Message): void {
    if (!this.server || !conversationId) return;
    const payload = {
      event: 'chat:message_sent',
      conversationId,
      message,
      sentAt: new Date().toISOString(),
    };
    this.server.to(`conversation:${conversationId}`).emit('chat:message_sent', payload);
  }

  notifyMessagesRead(conversationId: string, userId?: string): void {
    if (!this.server || !conversationId) return;
    const payload = {
      event: 'chat:messages_read',
      conversationId,
      userId,
      readAt: new Date().toISOString(),
    };
    this.server.to(`conversation:${conversationId}`).emit('chat:messages_read', payload);
  }
}
