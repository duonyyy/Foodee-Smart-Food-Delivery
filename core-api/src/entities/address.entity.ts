// src/users/entities/user.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { User } from './user.entity';

@Entity()
export class Address {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column()
  street: string;

    @Column()
  ward: string;

    @Column()
  district: string;

    @Column()
  city: string;

    @Column({ type: 'double precision', nullable: true })
  latitude: number;

    @Column({ type: 'double precision', nullable: true })
  longitude: number;

    @OneToMany(() => Restaurant, (restaurant) => restaurant.address)
  restaurants: Restaurant[];

    @ManyToOne(() => User, (user) => user.address)
  user: User;

    @Column({ nullable: true })
  isDefault: boolean;

    @Column({ nullable: true })
  label: string;

  // Add this field to your Address entity
  @Column({ default: false })
  isTemporary: boolean;

    @CreateDateColumn()
  createdAt: Date;
}
