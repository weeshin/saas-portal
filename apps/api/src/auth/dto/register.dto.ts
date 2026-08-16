import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Nick Lim' })
  @IsString() @MinLength(2) @MaxLength(150) name!: string;

  @ApiProperty({ example: 'nick@example.com' })
  @IsEmail() @MaxLength(255) email!: string;

  @ApiProperty({ minLength: 12 })
  @IsString() @MinLength(12) @MaxLength(128) password!: string;
}
