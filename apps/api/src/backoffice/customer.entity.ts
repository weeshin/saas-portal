import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CustomerStatus { ACTIVE = 'ACTIVE', SUSPENDED = 'SUSPENDED', ARCHIVED = 'ARCHIVED' }

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 50, unique: true }) code!: string;
  @Column({ length: 150 }) name!: string;
  @Column({ name: 'contact_name', type: 'varchar', length: 150, nullable: true }) contactName!: string | null;
  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true }) contactEmail!: string | null;
  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.ACTIVE }) status!: CustomerStatus;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
