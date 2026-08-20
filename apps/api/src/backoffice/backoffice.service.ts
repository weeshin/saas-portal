import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagedApplication } from './application.entity';
import { CreateApplicationDto, CreateCustomerDto, CreateEnvironmentDto } from './backoffice.dto';
import { Customer } from './customer.entity';
import { ManagedEnvironment } from './environment.entity';
import { ApplicationRelease } from './release.entity';

@Injectable()
export class BackofficeService {
  constructor(
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    @InjectRepository(ManagedApplication) private readonly applications: Repository<ManagedApplication>,
    @InjectRepository(ApplicationRelease) private readonly releases: Repository<ApplicationRelease>,
    @InjectRepository(ManagedEnvironment) private readonly environments: Repository<ManagedEnvironment>,
  ) {}

  async summary() {
    const [customers, applications, releases, environments, activeEnvironments, failedEnvironments] = await Promise.all([
      this.customers.count(), this.applications.count(), this.releases.count(), this.environments.count(),
      this.environments.countBy({ status: 'ACTIVE' as ManagedEnvironment['status'] }),
      this.environments.countBy({ status: 'FAILED' as ManagedEnvironment['status'] }),
    ]);
    return { customers, applications, releases, environments, activeEnvironments, failedEnvironments };
  }

  listCustomers() { return this.customers.find({ order: { createdAt: 'DESC' } }); }
  listApplications() { return this.applications.find({ order: { createdAt: 'DESC' } }); }
  listReleases() { return this.releases.find({ order: { createdAt: 'DESC' } }); }
  listEnvironments() { return this.environments.find({ order: { createdAt: 'DESC' } }); }

  async createCustomer(input: CreateCustomerDto) {
    const code = input.code.trim().toUpperCase();
    if (await this.customers.existsBy({ code })) throw new ConflictException('Customer code is already in use');
    return this.customers.save(this.customers.create({ ...input, code, name: input.name.trim() }));
  }

  async createApplication(input: CreateApplicationDto) {
    const code = input.code.trim().toLowerCase();
    if (await this.applications.existsBy({ code })) throw new ConflictException('Application code is already in use');
    return this.applications.save(this.applications.create({ ...input, code, name: input.name.trim() }));
  }

  async createEnvironment(input: CreateEnvironmentDto) {
    const hostname = input.hostname.trim().toLowerCase();
    if (!await this.customers.existsBy({ id: input.customerId })) throw new NotFoundException('Customer was not found');
    if (!await this.applications.existsBy({ id: input.applicationId })) throw new NotFoundException('Application was not found');
    if (input.releaseId && !await this.releases.existsBy({ id: input.releaseId })) throw new NotFoundException('Release was not found');
    if (await this.environments.existsBy({ hostname })) throw new ConflictException('Hostname is already assigned');
    return this.environments.save(this.environments.create({ ...input, hostname }));
  }
}
