import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { OrderDetail } from './orderDetail.entity';
import { Promotion } from './promotion.entity';
import { Restaurant } from './restaurant.entity';
import { ShippingDetail } from './shippingDetail.entity';
import { User } from './user.entity';

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

    @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

    @Column({ nullable: true })
  total: number;

    @Column({ nullable: true })
  note: string;

    @Column({
    type: 'enum',
    enum: [
      'pending',
      'confirmed',
      'delivering',
      'shipper_received',
      'completed',
      'canceled',
      'processing_payment',
    ],
    default: 'pending',
    nullable: true,
  })
  status: string;

    @CreateDateColumn()
  createdAt: Date;

    @UpdateDateColumn()
  updatedAt: Date;

    @ManyToOne(() => Promotion)
  @JoinColumn({ name: 'promotion_id' })
  promotionCode: Promotion;

    @Column({ nullable: true })
  date: string;

    @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'address_id' })
  address: Address;

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, { cascade: true })
  orderDetails: OrderDetail[];

    @OneToOne(() => ShippingDetail, (shippingDetail) => shippingDetail.order, { cascade: true }) // Corrected inverse side
  @JoinColumn({ name: 'shippingDetail_id' })
  shippingDetail: ShippingDetail;

    @Column({ nullable: true })
  paymentMethod: string;

    @Column({ nullable: true })
  paymentDate: string;

    @Column({ default: false })
  isPaid: boolean;

  // Add these new fields
    @Column({ type: 'float', nullable: true })
  deliveryDistance?: number;

    @Column({ type: 'int', nullable: true })
  estimatedDeliveryTime?: number; // in minutes

    @Column({ default: 'asap' })
  deliveryType?: 'asap' | 'scheduled';

    @Column({ nullable: true })
  requestedDeliveryTime?: string; // Stores the ISO string of the requested time

    @Column({ type: 'int', nullable: true })
  shippingFee?: number;

  // Add new fields for shipper earnings
    @Column({ type: 'int', nullable: true })
  shipperEarnings?: number; // How much shipper gets from this order

    @Column({ type: 'float', default: 0.8, nullable: true })
  shipperCommissionRate?: number; // Default 80% of shipping fee goes to shipper
}
