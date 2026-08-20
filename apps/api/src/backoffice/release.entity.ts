import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum ReleaseStatus { UNREVIEWED = 'UNREVIEWED', APPROVED = 'APPROVED', STABLE = 'STABLE', DEPRECATED = 'DEPRECATED' }

@Entity('application_releases')
@Index(['applicationId', 'version'], { unique: true })
export class ApplicationRelease {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'application_id', type: 'uuid' }) applicationId!: string;
  @Column({ length: 100 }) version!: string;
  @Column({ name: 'api_image', type: 'varchar', length: 500, nullable: true }) apiImage!: string | null;
  @Column({ name: 'web_image', type: 'varchar', length: 500, nullable: true }) webImage!: string | null;
  @Column({ name: 'api_digest', type: 'varchar', length: 100, nullable: true }) apiDigest!: string | null;
  @Column({ name: 'web_digest', type: 'varchar', length: 100, nullable: true }) webDigest!: string | null;
  @Column({ name: 'commit_sha', type: 'varchar', length: 100, nullable: true }) commitSha!: string | null;
  @Column({ type: 'enum', enum: ReleaseStatus, default: ReleaseStatus.UNREVIEWED }) status!: ReleaseStatus;
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true }) publishedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
