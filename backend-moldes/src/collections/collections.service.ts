import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
  ) {}

  async create(name: string, slug: string): Promise<Collection> {
    const collection = this.collectionsRepository.create({ name, slug });
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

  async update(id: string, name: string, slug: string): Promise<Collection> {
    const collection = await this.findOne(id);
    collection.name = name;
    collection.slug = slug;
    return this.collectionsRepository.save(collection);
  }

  async remove(id: string): Promise<void> {
    const collection = await this.findOne(id);
    await this.collectionsRepository.remove(collection);
  }
}
