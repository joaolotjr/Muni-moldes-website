import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  Matches,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PERMISSIONS } from '../../auth/permissions';
import type { Permission } from '../../auth/permissions';

export class CreateUserDto {
  @IsString()
  @Matches(/\S/, { message: 'O nome é obrigatório' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  @MaxLength(150, { message: 'O e-mail deve ter no máximo 150 caracteres' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres' })
  password: string;

  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSIONS, { each: true, message: 'Permissão desconhecida' })
  permissions: Permission[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'O nome é obrigatório' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  @MaxLength(150, { message: 'O e-mail deve ter no máximo 150 caracteres' })
  email?: string;

  // Em branco, a senha atual é mantida.
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres' })
  password?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSIONS, { each: true, message: 'Permissão desconhecida' })
  permissions?: Permission[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
