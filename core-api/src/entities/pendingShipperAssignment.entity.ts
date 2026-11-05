import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity({ name: 'pending_shipper_assignments' })
@Index(['createdAt']) // Index for cleanup queries
@Index(['priority', 'createdAt']) // Index for priority-based retrieval
@Index(['isSentToShipper']) // Index for tracking sent assignments
export class PendingShipperAssignment {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @ManyToOne(() => Order, { eager: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

    @Column({ type: 'int', default: 1 })
  priority: number; // Higher number = higher priority

    @Column({ type: 'int', default: 0 })
  attemptCount: number; // Track how many times we've tried to assign this order

    @Column({ type: 'timestamp', nullable: true })
  lastAttemptAt: Date;

    @Column({ type: 'timestamp', nullable: true })
  nextAttemptAt: Date; // When to try again

    @CreateDateColumn()
  createdAt: Date;

    @Column({ type: 'text', nullable: true })
  notes: string; // Store any additional info like rejection reasons

    @Column({ type: 'boolean', default: false })
  isSentToShipper: boolean; // Track if order has been sent to a shipper
}
