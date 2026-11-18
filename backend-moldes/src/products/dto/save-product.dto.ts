import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  SLUG_MESSAGE,
  SLUG_PATTERN,
  Trim,
  TrimToNull,
} from '../../common/validation';

/** Código de referência: letras, números, ponto e hífen. Gravado em maiúsculas. */
export const CODE_PATTERN = /^[A-Z0-9][A-Z0-9.-]*$/;
export const MAX_COLLECTIONS = 5;
export const PRODUCT_BADGES = ['new', 'bestseller'] as const;
export type ProductBadge = (typeof PRODUCT_BADGES)[number];

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
  @MaxLength(50, { message: 'O peso do molde pode ter até 50 caracteres' })
  final_weight?: string | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const code = value.trim().toUpperCase();
    return code === '' ? null : code;
  })
  @IsString()
  @MaxLength(30, { message: 'O código pode ter até 30 caracteres' })
  @Matches(CODE_PATTERN, {
    message: 'O código só pode ter letras, números, ponto e hífen',
  })
  code?: string | null;

  @IsOptional()
  @IsInt({ message: 'O número de cavidades deve ser um número inteiro' })
  @Min(1, { message: 'O número de cavidades deve ser pelo menos 1' })
  @Max(500, { message: 'O número de cavidades pode ser no máximo 500' })
  cavities?: number | null;

  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(100, { message: 'O material pode ter até 100 caracteres' })
  material?: string | null;

  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(50, { message: 'O peso da peça pode ter até 50 caracteres' })
  piece_weight?: string | null;

  @IsOptional()
  @IsInt({ message: 'O pedido mínimo deve ser um número inteiro' })
  @Min(1, { message: 'O pedido mínimo deve ser pelo menos 1' })
  @Max(1_000_000, { message: 'O pedido mínimo é grande demais' })
  min_order?: number | null;

  @IsOptional()
  @IsBoolean({ message: 'O campo "destaque" deve ser verdadeiro ou falso' })
  is_featured?: boolean;

  @IsOptional()
  @IsIn(PRODUCT_BADGES, { message: 'Selo inválido' })
  badge?: ProductBadge | null;

  @IsOptional()
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(-9999, { message: 'A ordem deve estar entre -9999 e 9999' })
  @Max(9999, { message: 'A ordem deve estar entre -9999 e 9999' })
  sort_order?: number;

  /** Categoria principal. */
  @IsOptional()
  @IsUUID(undefined, { message: 'Categoria inválida' })
  collection_id?: string | null;

  /** Todas as categorias do produto. A principal entra mesmo que não venha aqui. */
  @IsOptional()
  @IsArray({ message: 'As categorias devem vir em uma lista' })
  @ArrayMaxSize(MAX_COLLECTIONS, {
    message: `Um produto pode estar em até ${MAX_COLLECTIONS} categorias`,
  })
  @ArrayUnique({ message: 'Categoria repetida na lista' })
  @IsUUID(undefined, { each: true, message: 'Categoria inválida' })
  collection_ids?: string[];

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
