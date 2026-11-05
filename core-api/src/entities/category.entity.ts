// src/users/entities/user.entity.ts
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Food } from './food.entity';

@Entity({ name: 'categories' })
@Index('IDX_categories_name', ['name'], { unique: true })
export class Category {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column({ nullable: true })
  name: string;

    @Column({ nullable: true })
  image: string;

    @OneToMany(() => Food, (food) => food.category, {
    onDelete: 'SET NULL',
  })
  foods: Food[];
}
