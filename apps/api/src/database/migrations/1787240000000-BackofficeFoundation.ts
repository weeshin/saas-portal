import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackofficeFoundation1787240000000 implements MigrationInterface {
  name = 'BackofficeFoundation1787240000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE platform_role AS ENUM ('SUPER_ADMIN','OPERATIONS','SUPPORT','DEVELOPER','AUDITOR')`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN role platform_role NOT NULL DEFAULT 'SUPPORT'`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN active boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`CREATE TYPE customer_status AS ENUM ('ACTIVE','SUSPENDED','ARCHIVED')`);
    await queryRunner.query(`CREATE TYPE application_status AS ENUM ('ACTIVE','DISABLED')`);
    await queryRunner.query(`CREATE TYPE release_status AS ENUM ('UNREVIEWED','APPROVED','STABLE','DEPRECATED')`);
    await queryRunner.query(`CREATE TYPE deployment_mode AS ENUM ('CONTAINER_SHARED','DROPLET_DEDICATED')`);
    await queryRunner.query(`CREATE TYPE environment_status AS ENUM ('PENDING','PROVISIONING','ACTIVE','FAILED','SUSPENDED','DELETING','DELETED')`);
    await queryRunner.query(`
      CREATE TABLE customers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code varchar(50) NOT NULL,
        name varchar(150) NOT NULL, contact_name varchar(150), contact_email varchar(255),
        status customer_status NOT NULL DEFAULT 'ACTIVE', notes text,
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT UQ_customers_code UNIQUE (code)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE applications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code varchar(80) NOT NULL,
        name varchar(150) NOT NULL, description text, ghcr_owner varchar(150) NOT NULL,
        api_package varchar(255), web_package varchar(255), health_check_path varchar(255) NOT NULL DEFAULT '/health',
        default_base_domain varchar(255) NOT NULL DEFAULT 'annovis.io', status application_status NOT NULL DEFAULT 'ACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT UQ_applications_code UNIQUE (code)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE application_releases (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL,
        version varchar(100) NOT NULL, api_image varchar(500), web_image varchar(500),
        api_digest varchar(100), web_digest varchar(100), commit_sha varchar(100),
        status release_status NOT NULL DEFAULT 'UNREVIEWED', published_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT UQ_application_releases_version UNIQUE (application_id, version),
        CONSTRAINT FK_releases_application FOREIGN KEY (application_id) REFERENCES applications(id)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE environments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid NOT NULL,
        application_id uuid NOT NULL, release_id uuid, name varchar(100) NOT NULL,
        deployment_mode deployment_mode NOT NULL, hostname varchar(255) NOT NULL,
        target_name varchar(150), status environment_status NOT NULL DEFAULT 'PENDING',
        last_error text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT UQ_environments_hostname UNIQUE (hostname),
        CONSTRAINT FK_environments_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
        CONSTRAINT FK_environments_application FOREIGN KEY (application_id) REFERENCES applications(id),
        CONSTRAINT FK_environments_release FOREIGN KEY (release_id) REFERENCES application_releases(id)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE environments');
    await queryRunner.query('DROP TABLE application_releases');
    await queryRunner.query('DROP TABLE applications');
    await queryRunner.query('DROP TABLE customers');
    await queryRunner.query('DROP TYPE environment_status');
    await queryRunner.query('DROP TYPE deployment_mode');
    await queryRunner.query('DROP TYPE release_status');
    await queryRunner.query('DROP TYPE application_status');
    await queryRunner.query('DROP TYPE customer_status');
    await queryRunner.query('ALTER TABLE users DROP COLUMN active');
    await queryRunner.query('ALTER TABLE users DROP COLUMN role');
    await queryRunner.query('DROP TYPE platform_role');
  }
}
