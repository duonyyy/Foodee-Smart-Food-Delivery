import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum CertificateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'shipperCertificateInfos' })
export class ShipperCertificateInfo {
    @PrimaryGeneratedColumn('uuid')
  id: string;

    @OneToOne(() => User, (user) => user.shipperCertificateInfo)
  @JoinColumn({ name: 'user_id' })
  user: User;

    @Column({ nullable: true })
  cccd: string;

    @Column({ nullable: true })
  driverLicense: string;

    @Column({ type: 'enum', enum: CertificateStatus, default: CertificateStatus.PENDING })
  status: CertificateStatus;

    @Column({ nullable: true })
  verifiedAt: Date;
}
