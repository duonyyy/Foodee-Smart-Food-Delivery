import { Logger, Optional, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { WsJwtGuard, type WsAuthenticatedUser } from 'src/features/auth/public-api';
import { MerchantRestaurantsService } from 'src/features/restaurants/public-api';
import { Repository } from 'typeorm';
import { toOrderSocketDto } from '../dto/order-socket-response.dto';

@WebSocketGateway({ namespace: '/orders', cors: true })
@UseGuards(WsJwtGuard)
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderGateway.name);

  constructor(
    @Optional()
    @InjectRepository(Order)
    private readonly orderRepository?: Repository<Order>,
    @Optional()
    private readonly merchantRestaurantsService?: MerchantRestaurantsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected to /orders: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected from /orders: ${client.id}`);
  }

  @SubscribeMessage('joinOrderTracking')
  async handleJoinOrderTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (!data?.orderId) {
      return { event: 'error', message: 'orderId is required' };
    }

    const user = client.data?.user as WsAuthenticatedUser | undefined;
    if (!user?.id) {
      return { event: 'error', message: 'Unauthorized: No authenticated user' };
    }

    if (this.orderRepository) {
      const order = await this.orderRepository.findOne({
        where: { id: data.orderId },
        relations: [
          'user',
          'restaurant',
          'restaurant.owner',
          'shippingDetail',
          'shippingDetail.shipper',
        ],
      });

      if (!order) {
        return { event: 'error', message: 'Order not found' };
      }

      const isAdmin = user.role === 'admin';
      const isCustomer = order.user?.id === user.id;
      const isRestaurantOwner = order.restaurant?.owner?.id === user.id;
      const isShipper = order.shippingDetail?.shipper?.id === user.id;

      if (!isAdmin && !isCustomer && !isRestaurantOwner && !isShipper) {
        return {
          event: 'error',
          message: 'Forbidden: You do not have permission to track this order',
        };
      }
    }

    const room = `order:${data.orderId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} (user: ${user.id}) joined room ${room}`);
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
  async handleJoinRestaurantOrders(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { restaurantId: string },
  ) {
    if (!data?.restaurantId) {
      return { event: 'error', message: 'restaurantId is required' };
    }

    const user = client.data?.user as WsAuthenticatedUser | undefined;
    if (!user?.id) {
      return { event: 'error', message: 'Unauthorized: No authenticated user' };
    }

    const isAdmin = user.role === 'admin';
    if (!isAdmin && this.merchantRestaurantsService) {
      try {
        await this.merchantRestaurantsService.assertCanManageRestaurant(data.restaurantId, user.id);
      } catch {
        return {
          event: 'error',
          message: 'Forbidden: You do not have permission to access this restaurant',
        };
      }
    }

    const room = `restaurant:${data.restaurantId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} (user: ${user.id}) joined room ${room}`);
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
  handleJoinUserOrders(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (!data?.userId) {
      return { event: 'error', message: 'userId is required' };
    }

    const user = client.data?.user as WsAuthenticatedUser | undefined;
    if (!user?.id) {
      return { event: 'error', message: 'Unauthorized: No authenticated user' };
    }

    const isAdmin = user.role === 'admin';
    if (!isAdmin && user.id !== data.userId) {
      return {
        event: 'error',
        message: 'Forbidden: You cannot subscribe to another user\'s orders',
      };
    }

    const room = `user:${data.userId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} (user: ${user.id}) joined room ${room}`);
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
    const sanitizedOrder = toOrderSocketDto(order);
    const payload = {
      event: 'order:created',
      orderId: order.id,
      order: sanitizedOrder,
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
    const sanitizedOrder = toOrderSocketDto(order);
    const payload = {
      event: 'order:status_updated',
      orderId: order.id,
      status: order.status,
      order: sanitizedOrder,
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
