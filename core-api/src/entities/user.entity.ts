// src/users/entities/user.entity.ts
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { AuthProvider } from 'src/shared/types/enums/auth-provider.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { Order } from './order.entity';
import { Restaurant } from './restaurant.entity';
import { Role } from './role.entity';
import { ShipperCertificateInfo } from './shipperCertificateInfo.entity';


@Entity({ name: 'users' })
export class User {
    @PrimaryColumn({
    type: 'varchar',
    length: 28,
    unique: true,
    nullable: false,
  })
  id: string;

    @Column({ unique: true })
  username: string;

  // Không thêm @Field cho password vì lý do bảo mật
  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  @Column()
  password: string;

    @Column({ nullable: true })
  email: string;

    @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

    @Column({ nullable: true })
  name: string;

    @OneToMany(() => Address, (address) => address.user, { cascade: true })
  @JoinColumn({ name: 'address_id' })
  address: Address[];

    @Column({ nullable: true, unique: true })
  phone: string;

    @Column({ nullable: true })
  avatar: string;

    @Column({ name: 'is_active', default: true })
  isActive: boolean;

    @Column({ nullable: false })
  birthday: Date;

    @CreateDateColumn()
  createdAt: Date;

    @Column({ nullable: true })
  lastLoginAt: Date;

    @OneToOne(() => ShipperCertificateInfo, (shipperCertificateInfo) => shipperCertificateInfo.user)
  shipperCertificateInfo: ShipperCertificateInfo;

    @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.EMAIL })
  authProvider: AuthProvider;

    @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  @Column({ nullable: true, name: 'google_id' })
  googleId?: string;

  // Không thêm @Field cho các thông tin nhạy cảm liên quan đến reset password
  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  @Column({ nullable: true, name: 'reset_password_token' })
  resetPasswordToken?: string;

  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  @Column({ nullable: true, name: 'reset_password_expires' })
  resetPasswordExpires?: Date;

    @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

    @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

    @OneToMany(() => Conversation, (conversation) => conversation.participant1)
  conversationsAsParticipant1: Conversation[];

    @OneToMany(() => Conversation, (conversation) => conversation.participant2)
  conversationsAsParticipant2: Conversation[];

    @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

    @Column({ default: 0 })
  completedDeliveries: number;

    @Column({ default: 0 })
  failedDeliveries: number;

    @Column({ default: 0 })
  activeDeliveries: number;

  // Add these new performance tracking fields:
    @Column({ type: 'float', default: 5.0 })
  averageRating: number;

    @Column({ default: 0 })
  totalRatings: number;

    @Column({ type: 'float', default: 0 })
  averageDeliveryTime: number; // in minutes

    @Column({ default: 0 })
  onTimeDeliveries: number;

    @Column({ default: 0 })
  lateDeliveries: number;

    @Column({ nullable: true })
  lastActiveAt: Date;

    @Column({ default: 0 })
  rejectedOrders: number;

    @Column({ type: 'float', default: 0 })
  responseTimeMinutes: number; // Average time to accept/reject orders

  // thu nhap
    @Column({ type: 'float', default: 0 })
  totalEarnings: number; // Tổng thu nhập

    @Column({ type: 'float', default: 0 })
  monthlyEarnings: number; // Thu nhập tháng hiện tại

    @Column({ type: 'float', default: 0 })
  weeklyEarnings: number; // Thu nhập tuần hiện tại

    @Column({ type: 'float', default: 0 })
  dailyEarnings: number; // Thu nhập hôm nay
}
