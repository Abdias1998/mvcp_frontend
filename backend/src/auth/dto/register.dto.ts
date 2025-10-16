import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { UserRole } from '../../shared/types';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  password: string;
  
  @IsOptional()
  @IsString()
  @Matches(/^01[0-9]{8}$/, { message: 'Le numéro doit contenir 10 chiffres et commencer par 01.'})
  contact?: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  district?: string;
}
