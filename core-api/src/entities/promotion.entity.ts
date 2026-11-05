// src/users/entities/user.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

export enum PromotionType {
  FOOD_DISCOUNT = 'FOOD_DISCOUNT',
  SHIPPING_DISCOUNT = 'SHIPPING_DISCOUNT',
}

@Entity({ name: 'promotions' })
export class Promotion {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column({ nullable: true })
  description: string;

    @Column({
    type: 'enum',
    enum: PromotionType,
    default: PromotionType.FOOD_DISCOUNT,
  })
  type: PromotionType;

    @Column({ name: 'discountPercent', nullable: true })
  discountPercent: number;

    @Column({ name: 'discountAmount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount: number;

    @Column({ name: 'minOrderValue', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderValue: number;

    @Column({ name: 'maxDiscountAmount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number;

    @Column({ nullable: true })
  image: string;

    @Column({ nullable: true })
  code: string;

    @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

    @Column({ name: 'number_of_used', type: 'int', default: 0 })
  numberOfUsed: number;

    @Column({ name: 'max_usage', type: 'int', nullable: true })
  maxUsage: number;

    @OneToMany(() => Order, (order) => order.promotionCode)
  orders: Order[];
}
