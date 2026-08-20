import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PlatformRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATIONS = 'OPERATIONS',
  SUPPORT = 'SUPPORT',
  DEVELOPER = 'DEVELOPER',
  AUDITOR = 'AUDITOR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 150 }) name!: string;
  @Column({ length: 255, unique: true }) email!: string;
  @Column({ name: 'password_hash', length: 255, select: false }) passwordHash!: string;
  @Column({ type: 'enum', enum: PlatformRole, default: PlatformRole.SUPPORT }) role!: PlatformRole;
  @Column({ default: true }) active!: boolean;
  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true }) emailVerifiedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
