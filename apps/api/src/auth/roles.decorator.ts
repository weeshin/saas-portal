import { SetMetadata } from '@nestjs/common';
import { PlatformRole } from '../users/user.entity';

export const PLATFORM_ROLES_KEY = 'platformRoles';
export const Roles = (...roles: PlatformRole[]) => SetMetadata(PLATFORM_ROLES_KEY, roles);
