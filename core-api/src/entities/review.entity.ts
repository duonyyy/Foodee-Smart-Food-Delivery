// src/users/entities/user.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Food } from './food.entity';
import { User } from './user.entity';

// Define and register enum for review types
export const ReviewType = {
  FOOD: 'food',
  SHIPPER: 'shipper',
} as const;

export type ReviewType = (typeof ReviewType)[keyof typeof ReviewType];

@Entity({ name: 'reviews' })
export class Review {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @ManyToOne(() => User) // Remove eager: true to avoid circular loading
  @JoinColumn({ name: 'user_id' })
  user: User;

    @ManyToOne(() => Food) // Remove eager: true to avoid circular loading
  @JoinColumn({ name: 'food_id' })
  food: Food;

  /**
   * Required by the Reviews API for every newly-created review. It remains nullable
   * at persistence level only so historic reviews without an order reference remain readable.
   */
  @Column({ type: 'uuid', nullable: true, name: 'order_id' })
  orderId: string | null;

    @Column({ nullable: true })
  image: string;

    @Column({ nullable: true })
  comment: string;

    @Column({ nullable: true })
  rating: number;

    @Column({ type: 'enum', enum: ['food', 'shipper'] })
  type: ReviewType;

    @ManyToOne(() => User) // Remove eager: true to avoid circular loading
  @JoinColumn({ name: 'shipper_id' })
  shipper: User;

    @CreateDateColumn()
  createdAt: Date;
}
