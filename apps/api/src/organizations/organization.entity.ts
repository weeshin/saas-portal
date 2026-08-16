import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum OrganizationStatus { PENDING = 'PENDING', PROVISIONING = 'PROVISIONING', ACTIVE = 'ACTIVE', SUSPENDED = 'SUSPENDED', TRIAL_EXPIRED = 'TRIAL_EXPIRED', FAILED = 'FAILED', DELETING = 'DELETING', DELETED = 'DELETED' }

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 150 }) name!: string;
  @Column({ length: 100, unique: true }) slug!: string;
  @Column({ type: 'enum', enum: OrganizationStatus, default: OrganizationStatus.PENDING }) status!: OrganizationStatus;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
