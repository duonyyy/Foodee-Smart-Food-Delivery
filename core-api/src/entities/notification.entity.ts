// src/users/entities/user.entity.ts
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notifications' })
@Index('UQ_notifications_idempotency_key', ['idempotencyKey'], { unique: true })
export class Notification {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column({ nullable: true })
  description: string;

    @Column({ nullable: true })
  content: string;

    @Column({ nullable: true })
  receiveUser: string;

    @CreateDateColumn()
  createdAt: Date;

    @Column({ nullable: true, default: false })
  isRead: boolean;

    @Column({ nullable: true })
  type: string;

  /** Stable source-event key used to make event replay safe. */
  @Column({ name: 'idempotency_key', type: 'varchar', length: 200, nullable: true })
  idempotencyKey: string | null;
}
