import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

//   name: 'PermissionEnum',
// });
//
//   name: 'PermissionType',
// });

/**
 * Entity representing a permission in the system
 */
@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

    @Column({ type: 'text', nullable: true })
  description: string;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

    @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
