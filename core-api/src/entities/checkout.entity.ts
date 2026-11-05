 // Bạn cần cài package này
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CheckoutStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}


@Entity('checkouts')
export class Checkout {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column({ type: 'uuid', nullable: true })
  orderId: string;

  /**
   * Immutable customer ownership snapshot copied from Ordering when checkout
   * is created. Payments intentionally stores an ID snapshot instead of
   * importing the Order or User persistence model.
   */
  @Column({ type: 'varchar', length: 28, nullable: true })
  customerId: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

    @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency: string;

    @Column({ type: 'varchar', length: 50 })
  paymentMethod: string;

    @Column({ type: 'varchar', nullable: true })
  paymentIntentId: string;

  /** Provider transaction id from a verified callback; never client supplied. */
  @Column({ type: 'varchar', nullable: true })
  providerTransactionId?: string;

  /** Internal key used to make a replayed provider callback a no-op. */
  @Column({ type: 'varchar', nullable: true })
  webhookIdempotencyKey?: string;

    // Redirect URLs are returned to the caller but are never persisted because
  // provider URLs can contain signed, short-lived secrets.
  paymentUrl: string;

    @Column({
    type: 'enum',
    enum: CheckoutStatus,
    default: CheckoutStatus.PENDING,
  })
  status: CheckoutStatus;

    @Column({ type: 'jsonb', nullable: true, name: 'paymentDetails' })
  providerMetadata: Record<string, unknown>;

  /** Durable bounded-retry state for provider reconciliation. */
  @Column({ type: 'int', default: 0, name: 'reconciliation_attempts' })
  reconciliationAttempts: number;

  @Column({ type: 'timestamp', nullable: true, name: 'reconciliation_last_attempt_at' })
  reconciliationLastAttemptAt: Date | null;

  @Column({ type: 'text', nullable: true, name: 'reconciliation_last_error' })
  reconciliationLastError: string | null;

    @CreateDateColumn()
  createdAt: Date;

    @UpdateDateColumn()
  updatedAt: Date;
}
