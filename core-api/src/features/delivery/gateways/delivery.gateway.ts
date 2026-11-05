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
import { ShippingDetail } from 'src/entities/shippingDetail.entity';
import { WsJwtGuard } from 'src/features/auth/public-api';
import { Repository } from 'typeorm';

export interface ShipperLocationUpdatePayload {
  latitude: number;
  longitude: number;
  orderId?: string;
  shipperId?: string;
}

@WebSocketGateway({ namespace: '/delivery', cors: true })
@UseGuards(WsJwtGuard)
export class DeliveryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DeliveryGateway.name);

  constructor(
    @Optional()
    @InjectRepository(ShippingDetail)
    private readonly shippingDetailRepository?: Repository<ShippingDetail>,
  ) {}

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected to /delivery: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected from /delivery: ${client.id}`);
  }

  @SubscribeMessage('joinShipperChannel')
  handleJoinShipperChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data?: { shipperId?: string },
  ) {
    const user = client.data?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) {
      return { event: 'error', message: 'shipperId is required' };
    }

    const requestedShipperId = data?.shipperId || user.id;
    const isAdmin = user.role === 'admin';

    // BOLA/IDOR protection: only admin or the authenticated shipper themselves can subscribe
    if (!isAdmin && requestedShipperId !== user.id) {
      return {
        event: 'error',
        message: 'Forbidden: You cannot subscribe to another shipper\'s channel',
      };
    }

    const room = `shipper:${requestedShipperId}`;
    client.join(room);
    this.logger.debug(`Shipper ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('leaveShipperChannel')
  handleLeaveShipperChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data?: { shipperId?: string },
  ) {
    const user = client.data?.user as { id?: string } | undefined;
    const shipperId = data?.shipperId || user?.id;
    if (!shipperId) return;
    const room = `shipper:${shipperId}`;
    client.leave(room);
    this.logger.debug(`Shipper ${client.id} left room ${room}`);
    return { event: 'left', room };
  }

  @SubscribeMessage('trackDelivery')
  async handleTrackDelivery(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (!data?.orderId) {
      return { event: 'error', message: 'orderId is required' };
    }

    const user = client.data?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) {
      return { event: 'error', message: 'Unauthorized: No authenticated user' };
    }

    if (this.shippingDetailRepository) {
      const shippingDetail = await this.shippingDetailRepository.findOne({
        where: { order: { id: data.orderId } },
        relations: [
          'shipper',
          'order',
          'order.user',
          'order.restaurant',
          'order.restaurant.owner',
        ],
      });

      if (shippingDetail) {
        const isAdmin = user.role === 'admin';
        const isShipper = shippingDetail.shipper?.id === user.id;
        const isCustomer = shippingDetail.order?.user?.id === user.id;
        const isRestaurantOwner = shippingDetail.order?.restaurant?.owner?.id === user.id;

        if (!isAdmin && !isShipper && !isCustomer && !isRestaurantOwner) {
          return {
            event: 'error',
            message: 'Forbidden: You do not have permission to track this delivery',
          };
        }
      }
    }

    const room = `order:${data.orderId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} joined delivery tracking room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('untrackDelivery')
  handleUntrackDelivery(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (!data?.orderId) return;
    const room = `order:${data.orderId}`;
    client.leave(room);
    this.logger.debug(`Client ${client.id} left delivery tracking room ${room}`);
    return { event: 'left', room };
  }

  @SubscribeMessage('updateLocation')
  handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ShipperLocationUpdatePayload,
  ) {
    const user = client.data?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) {
      return { event: 'error', message: 'shipperId is required' };
    }

    const isAdmin = user.role === 'admin';
    const shipperId = isAdmin && data?.shipperId ? data.shipperId : user.id;

    if (!shipperId) {
      return { event: 'error', message: 'shipperId is required' };
    }

    this.notifyShipperLocationUpdated(shipperId, {
      latitude: data.latitude,
      longitude: data.longitude,
      orderId: data.orderId,
    });

    return { event: 'location_updated', success: true };
  }

  notifyShipperOffer(targetShipperId: string, offerPayload: unknown): void {
    if (!this.server || !targetShipperId) return;
    const payload = {
      event: 'delivery:offer',
      targetShipperId,
      offer: offerPayload,
      offeredAt: new Date().toISOString(),
    };
    this.server.to(`shipper:${targetShipperId}`).emit('delivery:offer', payload);
  }

  notifyOrderAssigned(orderId: string, shipperId: string): void {
    if (!this.server) return;
    const payload = {
      event: 'delivery:assigned',
      orderId,
      shipperId,
      assignedAt: new Date().toISOString(),
    };
    this.server.to(`shipper:${shipperId}`).emit('delivery:assigned', payload);
    this.server.to(`order:${orderId}`).emit('delivery:assigned', payload);
  }

  notifyShipperLocationUpdated(
    shipperId: string,
    location: {
      latitude: number;
      longitude: number;
      updatedAt?: Date | string;
      orderId?: string;
    },
  ): void {
    if (!this.server || !shipperId) return;
    const payload = {
      event: 'delivery:location_updated',
      shipperId,
      latitude: location.latitude,
      longitude: location.longitude,
      updatedAt: location.updatedAt || new Date().toISOString(),
      orderId: location.orderId,
    };

    this.server.to(`shipper:${shipperId}`).emit('delivery:location_updated', payload);

    if (location.orderId) {
      this.server.to(`order:${location.orderId}`).emit('delivery:location_updated', payload);
    }
  }
}
