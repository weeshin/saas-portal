import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { User } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';
import { OrganizationUser } from '../organizations/organization-user.entity';
import { Customer } from '../backoffice/customer.entity';
import { ManagedApplication } from '../backoffice/application.entity';
import { ApplicationRelease } from '../backoffice/release.entity';
import { ManagedEnvironment } from '../backoffice/environment.entity';

config({ path: '../../.env' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5433),
  username: process.env.DATABASE_USER ?? 'saas_portal',
  password: process.env.DATABASE_PASSWORD ?? 'saas_portal_dev',
  database: process.env.DATABASE_NAME ?? 'saas_portal',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [User, Organization, OrganizationUser, Customer, ManagedApplication, ApplicationRelease, ManagedEnvironment],
  migrations: [join(__dirname, 'migrations', `*.${__filename.endsWith('.ts') ? 'ts' : 'js'}`)],
  synchronize: false,
});
