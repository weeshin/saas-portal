import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum OrganizationRole { OWNER = 'OWNER', ADMIN = 'ADMIN', MEMBER = 'MEMBER' }

@Entity('organization_users')
@Index(['organizationId', 'userId'], { unique: true })
export class OrganizationUser {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'organization_id', type: 'uuid' }) organizationId!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'enum', enum: OrganizationRole }) role!: OrganizationRole;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
