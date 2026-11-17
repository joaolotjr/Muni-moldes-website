import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  SLUG_MESSAGE,
  SLUG_PATTERN,
  Trim,
  TrimToNull,
} from '../../common/validation';

/** Dados enviados pelo painel ao criar um produto. Campo fora desta lista é recusado. */
export class CreateProductDto {
  @Trim()
  @IsString({ message: 'O nome é obrigatório' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(200, { message: 'O nome pode ter até 200 caracteres' })
  name: string;

  @Trim()
  @IsString({ message: 'O endereço (URL) é obrigatório' })
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(220, { message: 'O endereço (URL) pode ter até 220 caracteres' })
  slug: string;

  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(5000, { message: 'A descrição pode ter até 5000 caracteres' })
  description?: string | null;

  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(100, { message: 'As dimensões podem ter até 100 caracteres' })
  dimensions?: string | null;

  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(50, { message: 'O peso pode ter até 50 caracteres' })
  final_weight?: string | null;

  @IsOptional()
  @IsUUID(undefined, { message: 'Categoria inválida' })
  collection_id?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'O campo "ativo" deve ser verdadeiro ou falso' })
  is_active?: boolean;

  @IsOptional()
  @IsISO8601({}, { message: 'Data de início inválida' })
  active_from?: string | null;

  @IsOptional()
  @IsISO8601({}, { message: 'Data de fim inválida' })
  active_until?: string | null;
}

/** Na alteração, todos os campos são opcionais: só o que vier é alterado. */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
