import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DeepPartial, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Collection } from '../collections/entities/collection.entity';
import { StorageService } from '../storage/storage.service';
import { assertValidSchedule, saveWithClearErrors } from '../common/save-rules';
import {
  CreateProductDto,
  MAX_COLLECTIONS,
  UpdateProductDto,
} from './dto/save-product.dto';

@Injectable()
export class ProductsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
    private storage: StorageService,
  ) {}

  /**
   * Garante que a categoria principal de cada produto também esteja na lista de
   * categorias. Cobre os produtos cadastrados antes de existir mais de uma
   * categoria por produto. Não altera nada quando já está tudo certo.
   */
  async onApplicationBootstrap() {
    await this.productsRepository.query(
      `INSERT INTO product_collections (product_id, collection_id)
       SELECT id, collection_id FROM products WHERE collection_id IS NOT NULL
       ON CONFLICT DO NOTHING`,
    );
  }

  /**
   * Monta a lista final de categorias a partir do que veio do painel:
   * a principal entra sempre; sem principal informada, a primeira da lista vira a principal.
   */
  private async resolveCollections(
    data: { collection_id?: string | null; collection_ids?: string[] },
    current?: Product,
  ): Promise<{ principal: string | null; ids: string[] } | null> {
    const touchesPrincipal = data.collection_id !== undefined;
    const touchesList = data.collection_ids !== undefined;
    if (!touchesPrincipal && !touchesList) return null;

    let principal = touchesPrincipal
      ? (data.collection_id ?? null)
      : (current?.collection_id ?? null);
    let ids = touchesList
      ? [...(data.collection_ids ?? [])]
      : (current?.collections ?? []).map((c) => c.id);

    if (
      touchesList &&
      !touchesPrincipal &&
      principal &&
      !ids.includes(principal)
    ) {
      // A lista nova não tem mais a principal antiga: a primeira da lista assume.
      principal = ids[0] ?? null;
    }
    if (!principal && ids.length > 0) principal = ids[0];
    if (principal && !ids.includes(principal)) ids = [principal, ...ids];

    if (ids.length > MAX_COLLECTIONS) {
      throw new BadRequestException(
        `Um produto pode estar em até ${MAX_COLLECTIONS} categorias`,
      );
    }
    if (ids.length > 0) {
      const found = await this.collectionsRepository.count({
        where: { id: In(ids) },
      });
      if (found !== ids.length) {
        throw new BadRequestException('A categoria escolhida não existe mais.');
      }
    }
    return { principal, ids };
  }

  async create(data: CreateProductDto): Promise<Product> {
    assertValidSchedule(data);
    const fields: Partial<CreateProductDto> = { ...data };
    delete fields.collection_ids;
    const resolved = await this.resolveCollections(data);
    const product = this.productsRepository.create(
      fields as DeepPartial<Product>,
    );
    product.collection_id = resolved?.principal ?? null!;
    product.collections = (resolved?.ids ?? []).map(
      (id) => ({ id }) as Collection,
    );
    const saved = await saveWithClearErrors(() =>
      this.productsRepository.save(product),
    );
    return this.findById(saved.id);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { collection: true, collections: true },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return product;
  }

  async findAll(
    collectionSlug?: string,
    isPublic: boolean = false,
  ): Promise<Product[]> {
    const query = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.collection', 'collection')
      .leftJoinAndSelect('product.collections', 'collections');

    if (collectionSlug) {
      // Considera todas as categorias do produto, não só a principal.
      query.andWhere(
        `product.id IN (
          SELECT pc.product_id FROM product_collections pc
          JOIN collections c ON c.id = pc.collection_id
          WHERE c.slug = :slug
        )`,
        { slug: collectionSlug },
      );
    }

    if (isPublic) {
      query.andWhere('product.is_active = :isActive', { isActive: true });
      query.andWhere(
        new Brackets((qb) => {
          qb.where('product.active_from IS NULL').orWhere(
            'product.active_from <= :now',
            { now: new Date() },
          );
        }),
      );
      query.andWhere(
        new Brackets((qb) => {
          qb.where('product.active_until IS NULL').orWhere(
            'product.active_until >= :now',
            { now: new Date() },
          );
        }),
      );
    }

    return query.getMany();
  }

  async findOne(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: { images: true, collection: true, collections: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const current = await this.findById(id);
    assertValidSchedule(data, current);
    const fields: Partial<UpdateProductDto> = { ...data };
    delete fields.collection_ids;
    delete fields.collection_id;
    const resolved = await this.resolveCollections(data, current);

    const product = this.productsRepository.merge(
      current,
      fields as DeepPartial<Product>,
    );
    if (resolved) {
      product.collection_id = resolved.principal ?? null!;
      product.collections = resolved.ids.map(
        (cid) => ({ id: cid }) as Collection,
      );
    }
    // A relação carregada tem prioridade sobre collection_id na gravação; tirá-la
    // garante que vale a principal escolhida.
    delete (product as Partial<Product>).collection;
    await saveWithClearErrors(() => this.productsRepository.save(product));
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const images = await this.productImagesRepository.find({
      where: { product_id: id },
    });
    await this.productsRepository.delete(id);
    await Promise.all(
      images.map((image) => this.storage.removeByUrl(image.image_url)),
    );
  }

  async addImage(
    productId: string,
    imageUrl: string,
    isCover: boolean = false,
  ): Promise<ProductImage> {
    const image = this.productImagesRepository.create({
      product_id: productId,
      image_url: imageUrl,
      is_cover: isCover,
    });
    return this.productImagesRepository.save(image);
  }

  async removeImage(imageId: string): Promise<void> {
    const image = await this.productImagesRepository.findOne({
      where: { id: imageId },
    });
    await this.productImagesRepository.delete(imageId);
    if (image) await this.storage.removeByUrl(image.image_url);
  }
}
