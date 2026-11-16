import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StorageService } from '../storage/storage.service';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  const queryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };
  const products = {
    create: jest.fn((data) => data),
    save: jest.fn((product) => Promise.resolve({ id: 'prod-1', ...product })),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };
  const images = {
    create: jest.fn((data) => data),
    save: jest.fn((image) => Promise.resolve({ id: 'img-1', ...image })),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const storage = { remove: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.remove.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: products },
        { provide: getRepositoryToken(ProductImage), useValue: images },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('findAll', () => {
    it('no admin lista tudo, sem filtros', async () => {
      queryBuilder.getMany.mockResolvedValue([{ id: 'prod-1' }]);

      await expect(service.findAll()).resolves.toEqual([{ id: 'prod-1' }]);
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('filtra pela coleção', async () => {
      await service.findAll('pascoa');

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(1);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'collection.slug = :slug',
        { slug: 'pascoa' },
      );
    });

    it('no site filtra por ativo e pelo período de exibição', async () => {
      await service.findAll(undefined, true);

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.is_active = :isActive',
        { isActive: true },
      );
    });
  });

  describe('findOne', () => {
    it('busca pelo slug com fotos e coleção', async () => {
      products.findOne.mockResolvedValue({ id: 'prod-1', slug: 'ovo' });

      await expect(service.findOne('ovo')).resolves.toEqual({
        id: 'prod-1',
        slug: 'ovo',
      });
      expect(products.findOne).toHaveBeenCalledWith({
        where: { slug: 'ovo' },
        relations: { images: true, collection: true },
      });
    });

    it('responde 404 quando não existe', async () => {
      products.findOne.mockResolvedValue(null);

      await expect(service.findOne('nao-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('addImage registra a foto do produto', async () => {
    await expect(
      service.addImage('prod-1', '/uploads/foto.png', true),
    ).resolves.toEqual({
      id: 'img-1',
      product_id: 'prod-1',
      image_url: '/uploads/foto.png',
      is_cover: true,
    });
  });

  describe('removeImage', () => {
    it('apaga o registro e o arquivo no armazenamento', async () => {
      images.findOne.mockResolvedValue({
        id: 'img-1',
        image_url: '/uploads/foto.png',
      });

      await service.removeImage('img-1');

      expect(images.delete).toHaveBeenCalledWith('img-1');
      expect(storage.remove).toHaveBeenCalledWith('foto.png');
    });

    it('não toca no armazenamento quando a foto não existe', async () => {
      images.findOne.mockResolvedValue(null);

      await service.removeImage('nao-existe');

      expect(storage.remove).not.toHaveBeenCalled();
    });

    it('não falha se o armazenamento estiver fora do ar', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      images.findOne.mockResolvedValue({
        id: 'img-1',
        image_url: '/uploads/foto.png',
      });
      storage.remove.mockRejectedValue(new Error('S3 indisponível'));

      await expect(service.removeImage('img-1')).resolves.toBeUndefined();
      expect(images.delete).toHaveBeenCalledWith('img-1');
      consoleError.mockRestore();
    });
  });

  it('remove apaga o produto e os arquivos de todas as fotos', async () => {
    images.find.mockResolvedValue([
      { id: 'img-1', image_url: '/uploads/a.png' },
      { id: 'img-2', image_url: '/uploads/b.jpg' },
    ]);

    await service.remove('prod-1');

    expect(images.find).toHaveBeenCalledWith({
      where: { product_id: 'prod-1' },
    });
    expect(products.delete).toHaveBeenCalledWith('prod-1');
    expect(storage.remove.mock.calls).toEqual([['a.png'], ['b.jpg']]);
  });
});
