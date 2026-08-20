import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ApplicationStatus { ACTIVE = 'ACTIVE', DISABLED = 'DISABLED' }

@Entity('applications')
export class ManagedApplication {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 80, unique: true }) code!: string;
  @Column({ length: 150 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'ghcr_owner', length: 150 }) ghcrOwner!: string;
  @Column({ name: 'api_package', type: 'varchar', length: 255, nullable: true }) apiPackage!: string | null;
  @Column({ name: 'web_package', type: 'varchar', length: 255, nullable: true }) webPackage!: string | null;
  @Column({ name: 'health_check_path', length: 255, default: '/health' }) healthCheckPath!: string;
  @Column({ name: 'default_base_domain', length: 255, default: 'annovis.io' }) defaultBaseDomain!: string;
  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.ACTIVE }) status!: ApplicationStatus;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
