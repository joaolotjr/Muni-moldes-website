import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(): Promise<Collection[]> {
    return this.collectionsRepository.find();
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
