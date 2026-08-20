import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { PlatformRole, User } from '../users/user.entity';

async function createAdmin(): Promise<void> {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password || password.length < 12) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (minimum 12 characters)');
  }
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const users = app.get<Repository<User>>(getRepositoryToken(User));
    let user = await users.createQueryBuilder('user').addSelect('user.passwordHash').where({ email }).getOne();
    if (user) {
      user.name = name;
      user.passwordHash = await argon2.hash(password);
      user.role = PlatformRole.SUPER_ADMIN;
      user.active = true;
    } else {
      user = users.create({ name, email, passwordHash: await argon2.hash(password), role: PlatformRole.SUPER_ADMIN, active: true, emailVerifiedAt: new Date() });
    }
    await users.save(user);
    process.stdout.write(`Super administrator ready: ${email}\n`);
  } finally {
    await app.close();
  }
}

void createAdmin().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Unable to create administrator'}\n`);
  process.exitCode = 1;
});
