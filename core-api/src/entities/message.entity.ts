import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';

@Entity({ name: 'messages' })
@Index(['conversation', 'createdAt']) // Index for efficient message retrieval
@Index(['sender', 'createdAt']) // Index for sender queries
export class Message {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

    @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

    @Column({ type: 'text' })
  content: string;

    @Column({ nullable: true })
  messageType: string; // 'text', 'image', 'file', 'location', 'order_update'

    @Column({ nullable: true })
  attachmentUrl: string; // For images, files, etc.

    @Column({ nullable: true })
  attachmentType: string; // 'image/jpeg', 'application/pdf', etc.

    @Column({ default: false })
  isRead: boolean;

    @Column({ nullable: true })
  readAt: Date;

    @Column({ default: false })
  isEdited: boolean;

    @Column({ nullable: true })
  editedAt: Date;

    @Column({ default: false })
  isDeleted: boolean;

    @Column({ nullable: true })
  deletedAt: Date;

    @CreateDateColumn()
  createdAt: Date;

    @UpdateDateColumn()
  updatedAt: Date;

    @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>; // For storing additional data like order info, location coordinates, etc.

    @Column({ nullable: true })
  replyToMessageId: string; // For reply functionality
}
