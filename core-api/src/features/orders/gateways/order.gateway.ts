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
import { Order } from 'src/entities/order.entity';
import { WsJwtGuard } from 'src/features/auth/public-api';

@WebSocketGateway({ namespace: '/orders', cors: true })
@UseGuards(WsJwtGuard)
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected to /orders: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected from /orders: ${client.id}`);
  }

  @SubscribeMessage('joinOrderTracking')
  handleJoinOrderTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (!data?.orderId) {
      return { event: 'error', message: 'orderId is required' };
    }
    const room = `order:${data.orderId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('leaveOrderTracking')
  handleLeaveOrderTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (!data?.orderId) return;
    const room = `order:${data.orderId}`;
    client.leave(room);
    this.logger.debug(`Client ${client.id} left room ${room}`);
    return { event: 'left', room };
  }

  @SubscribeMessage('joinRestaurantOrders')
  handleJoinRestaurantOrders(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (!data?.restaurantId) {
      return { event: 'error', message: 'restaurantId is required' };
    }
    const room = `restaurant:${data.restaurantId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('leaveRestaurantOrders')
  handleLeaveRestaurantOrders(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (!data?.restaurantId) return;
    const room = `restaurant:${data.restaurantId}`;
    client.leave(room);
    this.logger.debug(`Client ${client.id} left room ${room}`);
    return { event: 'left', room };
  }

  @SubscribeMessage('joinUserOrders')
  handleJoinUserOrders(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (!data?.userId) {
      return { event: 'error', message: 'userId is required' };
    }
    const room = `user:${data.userId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('leaveUserOrders')
  handleLeaveUserOrders(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (!data?.userId) return;
    const room = `user:${data.userId}`;
    client.leave(room);
    this.logger.debug(`Client ${client.id} left room ${room}`);
    return { event: 'left', room };
  }

  notifyOrderCreated(order: Order): void {
    if (!this.server) return;
    const payload = {
      event: 'order:created',
      orderId: order.id,
      order,
      createdAt: new Date().toISOString(),
    };

    if (order.restaurant?.id) {
      this.server.to(`restaurant:${order.restaurant.id}`).emit('order:created', payload);
    }
    if (order.user?.id) {
      this.server.to(`user:${order.user.id}`).emit('order:created', payload);
    }
  }

  notifyOrderStatusUpdated(order: Order): void {
    if (!this.server) return;
    const payload = {
      event: 'order:status_updated',
      orderId: order.id,
      status: order.status,
      order,
      updatedAt: new Date().toISOString(),
    };

    this.server.to(`order:${order.id}`).emit('order:status_updated', payload);

    if (order.user?.id) {
      this.server.to(`user:${order.user.id}`).emit('order:status_updated', payload);
    }

    if (order.restaurant?.id) {
      this.server.to(`restaurant:${order.restaurant.id}`).emit('order:status_updated', payload);
    }
  }
}
