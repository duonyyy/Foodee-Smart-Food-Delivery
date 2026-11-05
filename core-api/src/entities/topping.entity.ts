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
import { Food } from './food.entity';

@Entity({ name: 'toppings' })
@Index('IDX_toppings_food_name', ['food', 'name'], { unique: true })
export class Topping {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column()
  name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number; // 0 means free topping

    @Column({ default: true })
  isAvailable: boolean;

    @ManyToOne(() => Food, (food) => food.toppings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'food_id' })
  food: Food;

    @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
