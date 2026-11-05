// src/users/entities/user.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { OrderDetail } from './orderDetail.entity';
import { Restaurant } from './restaurant.entity';
import { Review } from './review.entity'; // Add this import
import { Topping } from './topping.entity';

@Entity({ name: 'foods' })
export class Food {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column({ nullable: true })
  description: string;

    @Column({ nullable: true })
  image: string;

    @Column('simple-array', { nullable: true, name: 'image_urls' })
  imageUrls: string[];

    @Column({ nullable: true })
  name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'discount_percent' })
  discountPercent: number;

    @Column({ type: 'int', default: 0, nullable: true, name: 'sold_count' })
  soldCount: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

    @Column({ type: 'int', default: 0, nullable: true, name: 'purchased_number' })
  purchasedNumber: number;

    @ManyToOne(() => Category, (category) => category.foods, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

    @Column({ nullable: true })
  status: string;

    @Column({ nullable: true })
  tag: string;

    @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

    @Column({ nullable: true, name: 'preparation_time' })
  preparationTime: number;

    @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.food)
  orderDetails: OrderDetail[];

  // Add the reviews relationship
    @OneToMany(() => Review, (review) => review.food)
  reviews?: Review[];

    @OneToMany(() => Topping, (topping) => topping.food, { cascade: true })
  toppings?: Topping[];
}
