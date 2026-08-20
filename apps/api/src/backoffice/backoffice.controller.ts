import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PlatformRole } from '../users/user.entity';
import { CreateApplicationDto, CreateCustomerDto, CreateEnvironmentDto } from './backoffice.dto';
import { BackofficeService } from './backoffice.service';

@Controller('backoffice')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PlatformRole.SUPER_ADMIN, PlatformRole.OPERATIONS, PlatformRole.SUPPORT, PlatformRole.DEVELOPER, PlatformRole.AUDITOR)
export class BackofficeController {
  constructor(private readonly backoffice: BackofficeService) {}

  @Get('summary') summary() { return this.backoffice.summary(); }
  @Get('customers') customers() { return this.backoffice.listCustomers(); }
  @Get('applications') applications() { return this.backoffice.listApplications(); }
  @Get('releases') releases() { return this.backoffice.listReleases(); }
  @Get('environments') environments() { return this.backoffice.listEnvironments(); }

  @Post('customers')
  @Roles(PlatformRole.SUPER_ADMIN, PlatformRole.OPERATIONS)
  createCustomer(@Body() input: CreateCustomerDto) { return this.backoffice.createCustomer(input); }

  @Post('applications')
  @Roles(PlatformRole.SUPER_ADMIN, PlatformRole.DEVELOPER)
  createApplication(@Body() input: CreateApplicationDto) { return this.backoffice.createApplication(input); }

  @Post('environments')
  @Roles(PlatformRole.SUPER_ADMIN, PlatformRole.OPERATIONS)
  createEnvironment(@Body() input: CreateEnvironmentDto) { return this.backoffice.createEnvironment(input); }
}
