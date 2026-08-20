import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum DeploymentMode { CONTAINER_SHARED = 'CONTAINER_SHARED', DROPLET_DEDICATED = 'DROPLET_DEDICATED' }
export enum EnvironmentStatus { PENDING = 'PENDING', PROVISIONING = 'PROVISIONING', ACTIVE = 'ACTIVE', FAILED = 'FAILED', SUSPENDED = 'SUSPENDED', DELETING = 'DELETING', DELETED = 'DELETED' }

@Entity('environments')
export class ManagedEnvironment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'customer_id', type: 'uuid' }) customerId!: string;
  @Column({ name: 'application_id', type: 'uuid' }) applicationId!: string;
  @Column({ name: 'release_id', type: 'uuid', nullable: true }) releaseId!: string | null;
  @Column({ length: 100 }) name!: string;
  @Column({ name: 'deployment_mode', type: 'enum', enum: DeploymentMode }) deploymentMode!: DeploymentMode;
  @Column({ length: 255, unique: true }) hostname!: string;
  @Column({ name: 'target_name', type: 'varchar', length: 150, nullable: true }) targetName!: string | null;
  @Column({ type: 'enum', enum: EnvironmentStatus, default: EnvironmentStatus.PENDING }) status!: EnvironmentStatus;
  @Column({ name: 'last_error', type: 'text', nullable: true }) lastError!: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
