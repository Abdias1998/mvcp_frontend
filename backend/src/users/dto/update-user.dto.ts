import { IsEmail, IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { UserRole } from '../../shared/types';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  @Matches(/^01[0-9]{8}$/)
  contact?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  district?: string;
}
