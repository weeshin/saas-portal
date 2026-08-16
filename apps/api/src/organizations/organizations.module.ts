import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationUser } from './organization-user.entity';
import { Organization } from './organization.entity';

@Module({ imports: [TypeOrmModule.forFeature([Organization, OrganizationUser])], exports: [TypeOrmModule] })
export class OrganizationsModule {}
