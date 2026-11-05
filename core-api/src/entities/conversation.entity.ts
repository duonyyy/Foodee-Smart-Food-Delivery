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
import { Message } from './message.entity';
import { User } from './user.entity';

export enum ConversationType {
  CUSTOMER_SHOP = 'customer_shop',
  CUSTOMER_SHIPPER = 'customer_shipper',
  SUPPORT = 'support',
}

@Entity({ name: 'conversations' })
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'participant1_id' })
  participant1: User;

    @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'participant2_id' })
  participant2: User;

    @Column({ nullable: true })
  lastMessage: string;

    @Column({ nullable: true })
  lastMessageAt: Date;

    @Column({ default: false })
  isBlocked: boolean;

    @Column({ nullable: true })
  blockedBy: string;

    @CreateDateColumn()
  createdAt: Date;

    @UpdateDateColumn()
  updatedAt: Date;

    @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

    @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.CUSTOMER_SHOP,
  })
  conversationType: ConversationType;

    @Column({ type: 'uuid', nullable: true })
  orderId?: string; // Required for customer-shipper conversations

    @Column({ type: 'uuid', nullable: true })
  restaurantId?: string; // Required for customer-shop conversations
}
