import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe a senha atual' })
  current_password: string;

  @IsString()
  @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres' })
  @MaxLength(72, { message: 'A nova senha deve ter no máximo 72 caracteres' })
  new_password: string;
}
