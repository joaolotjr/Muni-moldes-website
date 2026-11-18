import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DeepPartial } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { assertValidSchedule, saveWithClearErrors } from '../common/save-rules';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
} from './dto/save-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
  ) {}

  async create(data: CreateCollectionDto): Promise<Collection> {
    assertValidSchedule(data);
    // A nova categoria entra no fim da ordem.
    const { max } = (await this.collectionsRepository
      .createQueryBuilder('collection')
      .select('MAX(collection.sort_order)', 'max')
      .getRawOne<{ max: number | null }>()) ?? { max: null };
    return saveWithClearErrors(() =>
      this.collectionsRepository.save(
        this.collectionsRepository.create({
          ...(data as DeepPartial<Collection>),
          sort_order: (max ?? -1) + 1,
        }),
      ),
    );
  }

  /** Grava a ordem das categorias: a posição na lista vira a ordem. */
  async reorder(ids: string[]): Promise<Collection[]> {
    const existing = await this.collectionsRepository.find();
    const known = new Set(existing.map((c) => c.id));
    if (ids.length !== known.size || ids.some((id) => !known.has(id))) {
      throw new BadRequestException(
        'A lista precisa ter todas as categorias, sem repetir. Recarregue a página e tente de novo.',
      );
    }
    await this.collectionsRepository.manager.transaction(async (manager) => {
      for (const [index, id] of ids.entries()) {
        await manager.update(Collection, { id }, { sort_order: index });
      }
    });
    return this.findAll();
  }

  async findAll(isPublic: boolean = false): Promise<Collection[]> {
    const query = this.collectionsRepository
      .createQueryBuilder('collection')
      .orderBy('collection.sort_order', 'ASC')
      .addOrderBy('collection.name', 'ASC');

    if (isPublic) {
      query.andWhere('collection.is_active = :isActive', { isActive: true });
      query.andWhere(
        new Brackets((qb) => {
          qb.where('collection.active_from IS NULL').orWhere(
            'collection.active_from <= :now',
            { now: new Date() },
          );
        }),
      );
      query.andWhere(
        new Brackets((qb) => {
          qb.where('collection.active_until IS NULL').orWhere(
            'collection.active_until >= :now',
            { now: new Date() },
          );
        }),
      );
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({
      where: { id },
    });
    if (!collection) {
      throw new NotFoundException(`Collection #${id} not found`);
    }
    return collection;
  }

  async update(id: string, data: UpdateCollectionDto): Promise<Collection> {
    const current = await this.findOne(id);
    assertValidSchedule(data, current);
    await saveWithClearErrors(() =>
      this.collectionsRepository.update(id, data as DeepPartial<Collection>),
    );
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const collection = await this.collectionsRepository.findOne({
      where: { id },
      relations: { products: true },
    });

    if (!collection) {
      throw new NotFoundException(`Collection #${id} not found`);
    }

    // Só bloqueia quando é a categoria principal de algum produto. Quando ela é
    // apenas uma categoria a mais, o vínculo sai junto (ON DELETE CASCADE).
    if (collection.products && collection.products.length > 0) {
      throw new BadRequestException(
        'Esta categoria é a principal de algum produto. Troque a categoria principal desses produtos antes de excluir.',
      );
    }

    await this.collectionsRepository.remove(collection);
  }
}
