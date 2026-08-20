import { PlatformRole } from '../users/user.entity';

export interface AuthUser {
  id: string;
  email: string;
  role: PlatformRole;
}
