import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
  ) {}

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(productData);
    return this.productsRepository.save(product);
  }

  async findAll(collectionSlug?: string): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.collection', 'collection');

    if (collectionSlug) {
      query.where('collection.slug = :slug', { slug: collectionSlug });
    }

    return query.getMany();
  }

  async findOne(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: ['images', 'collection'],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    await this.productsRepository.update(id, productData);
    return this.productsRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
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
    await this.productImagesRepository.delete(imageId);
  }
}
