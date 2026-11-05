// src/roles/entities/role.entity.ts
import { DefaultRole } from 'src/shared/types/enums/default-role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

export { DefaultRole } from 'src/shared/types/enums/default-role.enum';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column({
    type: 'enum',
    enum: DefaultRole,
    default: DefaultRole.USER,
    unique: true,
  })
  name: DefaultRole;

    @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName: string;

    @Column({ type: 'text', nullable: true })
  description: string;

    @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem: boolean;

    @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

    @OneToMany(() => User, (user) => user.role)
  users: User[];

    @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
