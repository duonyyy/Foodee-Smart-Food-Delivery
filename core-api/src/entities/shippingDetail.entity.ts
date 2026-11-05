// src/users/entities/user.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

export enum ShippingStatus {
  PENDING = 'PENDING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  COMPLETED = 'COMPLETED',
}

@Entity({ name: 'shippingDetails' })
export class ShippingDetail {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column({ nullable: true, type: 'enum', enum: ShippingStatus })
  status: ShippingStatus;

    @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  shipper: User;

    @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

    @Column({ nullable: true })
  estimatedDeliveryTime: Date;

    @Column({ nullable: true })
  actualDeliveryTime: Date;

    @Column({ nullable: true })
  trackingNumber: string;
}
