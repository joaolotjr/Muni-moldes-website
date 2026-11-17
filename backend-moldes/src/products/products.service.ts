import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DeepPartial } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { StorageService } from '../storage/storage.service';
import { assertValidSchedule, saveWithClearErrors } from '../common/save-rules';
import { CreateProductDto, UpdateProductDto } from './dto/save-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    private storage: StorageService,
  ) {}

  async create(data: CreateProductDto): Promise<Product> {
    assertValidSchedule(data);
    return saveWithClearErrors(() =>
      this.productsRepository.save(
        this.productsRepository.create(data as DeepPartial<Product>),
      ),
    );
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return product;
  }

  async findAll(collectionSlug?: string, isPublic: boolean = false): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.collection', 'collection');

    if (collectionSlug) {
      query.andWhere('collection.slug = :slug', { slug: collectionSlug });
    }

    if (isPublic) {
      query.andWhere('product.is_active = :isActive', { isActive: true });
      query.andWhere(
        new Brackets(qb => {
          qb.where('product.active_from IS NULL')
            .orWhere('product.active_from <= :now', { now: new Date() });
        })
      );
      query.andWhere(
        new Brackets(qb => {
          qb.where('product.active_until IS NULL')
            .orWhere('product.active_until >= :now', { now: new Date() });
        })
      );
    }

    return query.getMany();
  }

  async findOne(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: { images: true, collection: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const current = await this.findById(id);
    assertValidSchedule(data, current);
    await saveWithClearErrors(() =>
      this.productsRepository.update(id, data as DeepPartial<Product>),
    );
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const images = await this.productImagesRepository.find({ where: { product_id: id } });
    await this.productsRepository.delete(id);
    await Promise.all(images.map((image) => this.storage.removeByUrl(image.image_url)));
  }

  async addImage(productId: string, imageUrl: string, isCover: boolean = false): Promise<ProductImage> {
    const image = this.productImagesRepository.create({
      product_id: productId,
      image_url: imageUrl,
      is_cover: isCover,
    });
    return this.productImagesRepository.save(image);
  }

  async removeImage(imageId: string): Promise<void> {
    const image = await this.productImagesRepository.findOne({ where: { id: imageId } });
    await this.productImagesRepository.delete(imageId);
    if (image) await this.storage.removeByUrl(image.image_url);
  }
}
