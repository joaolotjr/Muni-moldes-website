import { ArrayMaxSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

/** Ordem nova das categorias: todos os ids, na ordem desejada. */
export class ReorderCollectionsDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ArrayUnique({ message: 'Categoria repetida na lista' })
  @IsUUID(undefined, { each: true, message: 'Categoria inválida' })
  ids: string[];
}
