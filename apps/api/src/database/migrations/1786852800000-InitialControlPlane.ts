import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialControlPlane1786852800000 implements MigrationInterface {
  name = 'InitialControlPlane1786852800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id varchar(36) NOT NULL,
        name varchar(150) NOT NULL,
        email varchar(255) NOT NULL,
        password_hash varchar(255) NOT NULL,
        email_verified_at datetime NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY UQ_users_email (email),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE organizations (
        id varchar(36) NOT NULL,
        name varchar(150) NOT NULL,
        slug varchar(100) NOT NULL,
        status enum('PENDING','PROVISIONING','ACTIVE','SUSPENDED','TRIAL_EXPIRED','FAILED','DELETING','DELETED') NOT NULL DEFAULT 'PENDING',
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY UQ_organizations_slug (slug),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE organization_users (
        id varchar(36) NOT NULL,
        organization_id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        role enum('OWNER','ADMIN','MEMBER') NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE KEY UQ_organization_users_membership (organization_id, user_id),
        CONSTRAINT FK_organization_users_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
        CONSTRAINT FK_organization_users_user FOREIGN KEY (user_id) REFERENCES users(id),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE organization_users');
    await queryRunner.query('DROP TABLE organizations');
    await queryRunner.query('DROP TABLE users');
  }
}
