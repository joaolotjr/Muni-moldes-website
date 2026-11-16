import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  EXCERPT_MAX_LENGTH,
  NEWS_CATEGORIES,
  NEWS_STATUSES,
} from '../news.constants';
import type { NewsCategory, NewsStatus } from '../news.constants';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Dados enviados pelo painel ao criar ou salvar uma notícia. */
export class SaveNewsDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @MaxLength(200, { message: 'O título pode ter até 200 caracteres' })
  title: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(EXCERPT_MAX_LENGTH, {
    message: `O resumo pode ter até ${EXCERPT_MAX_LENGTH} caracteres`,
  })
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000, { message: 'O texto é longo demais' })
  content?: string;

  @IsIn(NEWS_CATEGORIES, { message: 'Categoria inválida' })
  category: NewsCategory;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Use até 10 tags' })
  @IsString({ each: true })
  @MaxLength(30, { each: true, message: 'Cada tag pode ter até 30 caracteres' })
  tags?: string[];

  @IsIn(NEWS_STATUSES, { message: 'Status inválido' })
  status: NewsStatus;
}
