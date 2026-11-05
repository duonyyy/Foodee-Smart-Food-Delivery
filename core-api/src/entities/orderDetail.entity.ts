// src/users/entities/user.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Food } from './food.entity';
import { Order } from './order.entity';

@Entity({ name: 'orderDetails' })
export class OrderDetail {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

    @ManyToOne(() => Food, { eager: true })
  @JoinColumn({ name: 'food_id' })
  food: Food;

    @Column({ nullable: true })
  varity: string;

    @Column({ nullable: true })
  quantity: number;

    @Column({ nullable: true })
  price: string;

    @Column({ nullable: true, name: 'food_name_snapshot' })
  foodNameSnapshot: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'unit_price_snapshot' })
  unitPriceSnapshot: number;

    @Column({ nullable: true })
  note: string;

  // Add selected toppings as JSON column
    @Column({ type: 'simple-json', nullable: true, name: 'selected_toppings' })
  selectedToppings?: Array<{
    id: string;
    name: string;
    price: number;
  }>;

  // Add total topping price
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'topping_total' })
  toppingTotal?: number;
}
