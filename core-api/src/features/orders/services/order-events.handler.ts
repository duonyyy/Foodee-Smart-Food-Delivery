import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  DELIVERY_ASSIGNMENT_CLAIMED_EVENT,
  DELIVERY_ASSIGNMENT_REJECTED_EVENT,
  DELIVERY_ASSIGNMENT_REQUESTED_EVENT,
  type DeliveryAssignmentRequestedEvent,
} from 'src/common/events/delivery-assignment.events';
import {
  DELIVERY_COMPLETED_EVENT,
  DeliveryCompletedEvent,
} from 'src/common/events/delivery-completed.event';
import { InProcessEventBus } from 'src/common/events/in-process-event-bus.service';
import {
  PAYMENT_SUCCEEDED_EVENT,
  PaymentSucceededEvent,
} from 'src/common/events/payment-succeeded.event';
import { AdminOrdersService } from './admin-orders.service';
import { OrderDeliveryService } from './order-delivery.service';

@Injectable()
export class DeliveryCompletedOrderHandler implements OnModuleInit, OnModuleDestroy {
  private unsubscribe?: () => void;

  constructor(
    private readonly eventBus: InProcessEventBus,
    private readonly adminOrdersService: AdminOrdersService,
  ) {}

  onModuleInit(): void {
    this.unsubscribe = this.eventBus.subscribe<DeliveryCompletedEvent>(
      DELIVERY_COMPLETED_EVENT,
      (event) => this.handle(event),
    );
  }

  onModuleDestroy(): void {
    this.unsubscribe?.();
  }

  private async handle(event: DeliveryCompletedEvent): Promise<void> {
    await this.adminOrdersService.completeFromDelivery(event.orderId, event.earnings);
  }
}

@Injectable()
export class PaymentSucceededOrderHandler implements OnModuleInit, OnModuleDestroy {
  private unsubscribe?: () => void;

  constructor(
    private readonly eventBus: InProcessEventBus,
    private readonly adminOrdersService: AdminOrdersService,
  ) {}

  onModuleInit(): void {
    this.unsubscribe = this.eventBus.subscribe<PaymentSucceededEvent>(
      PAYMENT_SUCCEEDED_EVENT,
      (event) => this.handle(event),
    );
  }

  onModuleDestroy(): void {
    this.unsubscribe?.();
  }

  private async handle(event: PaymentSucceededEvent): Promise<void> {
    await this.adminOrdersService.markPaid(event.orderId);
  }
}

/** Orders claims the lifecycle transition after Delivery has durably requested an assignment. */
@Injectable()
export class DeliveryAssignmentRequestedOrderHandler implements OnModuleInit, OnModuleDestroy {
  private unsubscribe?: () => void;

  constructor(
    private readonly eventBus: InProcessEventBus,
    private readonly orderDelivery: OrderDeliveryService,
  ) {}

  onModuleInit(): void {
    this.unsubscribe = this.eventBus.subscribe<DeliveryAssignmentRequestedEvent>(
      DELIVERY_ASSIGNMENT_REQUESTED_EVENT,
      (event) => this.handle(event),
    );
  }

  onModuleDestroy(): void {
    this.unsubscribe?.();
  }

  private async handle(event: DeliveryAssignmentRequestedEvent): Promise<void> {
    const result = await this.orderDelivery.claim(event.orderId);
    if (result.accepted) {
      await this.eventBus.publish(DELIVERY_ASSIGNMENT_CLAIMED_EVENT, event);
      return;
    }

    await this.eventBus.publish(DELIVERY_ASSIGNMENT_REJECTED_EVENT, {
      ...event,
      orderStatus: result.orderStatus,
    });
  }
}
