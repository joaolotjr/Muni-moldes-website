import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Collection } from './entities/collection.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
  ) {}

  async create(collectionData: Partial<Collection>): Promise<Collection> {
    const collection = this.collectionsRepository.create(collectionData);
    return this.collectionsRepository.save(collection);
  }

  async findAll(isPublic: boolean = false): Promise<Collection[]> {
    const query = this.collectionsRepository.createQueryBuilder('collection');

    if (isPublic) {
      query.andWhere('collection.is_active = :isActive', { isActive: true });
      query.andWhere(
        new Brackets(qb => {
          qb.where('collection.active_from IS NULL')
            .orWhere('collection.active_from <= :now', { now: new Date() });
        })
      );
      query.andWhere(
        new Brackets(qb => {
          qb.where('collection.active_until IS NULL')
            .orWhere('collection.active_until >= :now', { now: new Date() });
        })
      );
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({ where: { id } });
    if (!collection) {
      throw new NotFoundException(`Collection #${id} not found`);
    }
    return collection;
  }

  async update(id: string, collectionData: Partial<Collection>): Promise<Collection> {
    await this.collectionsRepository.update(id, collectionData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const collection = await this.collectionsRepository.findOne({ 
      where: { id },
      relations: ['products']
    });
    
    if (!collection) {
      throw new NotFoundException(`Collection #${id} not found`);
    }

    if (collection.products && collection.products.length > 0) {
      throw new BadRequestException('Não é possível excluir uma coleção que possui produtos vinculados.');
    }

    await this.collectionsRepository.remove(collection);
  }
}
