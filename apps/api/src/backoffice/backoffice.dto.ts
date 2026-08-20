import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { DeploymentMode } from './environment.entity';

export class CreateCustomerDto {
  @IsString() @Matches(/^[A-Z0-9_-]+$/) @MaxLength(50) code!: string;
  @IsString() @MinLength(2) @MaxLength(150) name!: string;
  @IsOptional() @IsString() @MaxLength(150) contactName?: string;
  @IsOptional() @IsEmail() @MaxLength(255) contactEmail?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

export class CreateApplicationDto {
  @IsString() @Matches(/^[a-z0-9-]+$/) @MaxLength(80) code!: string;
  @IsString() @MinLength(2) @MaxLength(150) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsString() @MaxLength(150) ghcrOwner!: string;
  @IsOptional() @IsString() @MaxLength(255) apiPackage?: string;
  @IsOptional() @IsString() @MaxLength(255) webPackage?: string;
  @IsString() @MaxLength(255) healthCheckPath!: string;
  @IsString() @MaxLength(255) defaultBaseDomain!: string;
}

export class CreateEnvironmentDto {
  @IsUUID() customerId!: string;
  @IsUUID() applicationId!: string;
  @IsOptional() @IsUUID() releaseId?: string;
  @IsString() @MaxLength(100) name!: string;
  @IsEnum(DeploymentMode) deploymentMode!: DeploymentMode;
  @IsString() @Matches(/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/) hostname!: string;
  @IsOptional() @IsString() @MaxLength(150) targetName?: string;
}
