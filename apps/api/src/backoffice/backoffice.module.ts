import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ManagedApplication } from './application.entity';
import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';
import { Customer } from './customer.entity';
import { ManagedEnvironment } from './environment.entity';
import { ApplicationRelease } from './release.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, ManagedApplication, ApplicationRelease, ManagedEnvironment]), AuthModule],
  controllers: [BackofficeController],
  providers: [BackofficeService],
})
export class BackofficeModule {}
