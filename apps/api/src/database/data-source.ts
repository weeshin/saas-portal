import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { User } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';
import { OrganizationUser } from '../organizations/organization-user.entity';

config({ path: '../../.env' });

export default new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 3307),
  username: process.env.DATABASE_USER ?? 'saas_portal',
  password: process.env.DATABASE_PASSWORD ?? 'saas_portal_dev',
  database: process.env.DATABASE_NAME ?? 'saas_portal',
  entities: [User, Organization, OrganizationUser],
  migrations: [join(__dirname, 'migrations', `*.${__filename.endsWith('.ts') ? 'ts' : 'js'}`)],
  synchronize: false,
});
