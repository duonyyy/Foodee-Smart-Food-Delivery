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
import { Notification } from 'src/entities/notification.entity';
import { WsJwtGuard } from 'src/features/auth/public-api';

@WebSocketGateway({ namespace: '/notifications', cors: true })
@UseGuards(WsJwtGuard)
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected to /notifications: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected from /notifications: ${client.id}`);
  }

  @SubscribeMessage('joinNotifications')
  handleJoinNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data?: { userId?: string },
  ) {
    const user = client.data?.user as { id?: string } | undefined;
    const userId = data?.userId || user?.id;
    if (!userId) {
      return { event: 'error', message: 'userId is required' };
    }
    const room = `user:${userId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('leaveNotifications')
  handleLeaveNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data?: { userId?: string },
  ) {
    const user = client.data?.user as { id?: string } | undefined;
    const userId = data?.userId || user?.id;
    if (!userId) return;
    const room = `user:${userId}`;
    client.leave(room);
    this.logger.debug(`Client ${client.id} left room ${room}`);
    return { event: 'left', room };
  }

  sendNotification(userId: string, notification: Notification): void {
    if (!this.server || !userId) return;
    const payload = {
      event: 'notification:received',
      notification,
      receivedAt: new Date().toISOString(),
    };
    this.server.to(`user:${userId}`).emit('notification:received', payload);
  }
}
