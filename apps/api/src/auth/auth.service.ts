import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthResult {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

export type PublicUser = AuthResult['user'];

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    if (await this.users.existsBy({ email })) throw new ConflictException('Email is already registered');
    const user = await this.users.save(this.users.create({
      name: input.name.trim(), email, passwordHash: await argon2.hash(input.password), emailVerifiedAt: null,
    }));
    return this.issueToken(user);
  }

  async login(input: LoginDto): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.createQueryBuilder('user').addSelect('user.passwordHash').where({ email }).getOne();
    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken(user);
  }

  async findPublicUser(id: string): Promise<PublicUser> {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return { id: user.id, name: user.name, email: user.email };
  }

  private async issueToken(user: User): Promise<AuthResult> {
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email }),
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
