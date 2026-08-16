import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialControlPlane1786852800000 implements MigrationInterface {
  name = 'InitialControlPlane1786852800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE organization_status AS ENUM (
        'PENDING', 'PROVISIONING', 'ACTIVE', 'SUSPENDED',
        'TRIAL_EXPIRED', 'FAILED', 'DELETING', 'DELETED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE organization_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER')
    `);
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(150) NOT NULL,
        email varchar(255) NOT NULL,
        password_hash varchar(255) NOT NULL,
        email_verified_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT UQ_users_email UNIQUE (email)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE organizations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(150) NOT NULL,
        slug varchar(100) NOT NULL,
        status organization_status NOT NULL DEFAULT 'PENDING',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT UQ_organizations_slug UNIQUE (slug)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE organization_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id uuid NOT NULL,
        user_id uuid NOT NULL,
        role organization_role NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT UQ_organization_users_membership UNIQUE (organization_id, user_id),
        CONSTRAINT FK_organization_users_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
        CONSTRAINT FK_organization_users_user FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE organization_users');
    await queryRunner.query('DROP TABLE organizations');
    await queryRunner.query('DROP TABLE users');
    await queryRunner.query('DROP TYPE organization_role');
    await queryRunner.query('DROP TYPE organization_status');
  }
}
