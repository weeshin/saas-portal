import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthResult, AuthService, PublicUser } from './auth.service';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() input: RegisterDto): Promise<AuthResult> { return this.auth.register(input); }
  @Post('login') @HttpCode(200) login(@Body() input: LoginDto): Promise<AuthResult> { return this.auth.login(input); }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest): Promise<PublicUser> {
    return this.auth.findPublicUser(request.user.id);
  }

  @Post('change-password')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() input: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.auth.changePassword(request.user.id, input);
    return { message: 'Password changed successfully' };
  }
}
