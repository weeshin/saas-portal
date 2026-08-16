import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { User } from './users/user.entity';
import { Organization } from './organizations/organization.entity';
import { OrganizationUser } from './organizations/organization-user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get('DATABASE_PORT', 3307),
        username: config.get('DATABASE_USER', 'saas_portal'),
        password: config.get('DATABASE_PASSWORD', 'saas_portal_dev'),
        database: config.get('DATABASE_NAME', 'saas_portal'),
        entities: [User, Organization, OrganizationUser],
        synchronize: false,
      }),
    }),
    HealthModule,
    AuthModule,
    OrganizationsModule,
  ],
})
export class AppModule {}
