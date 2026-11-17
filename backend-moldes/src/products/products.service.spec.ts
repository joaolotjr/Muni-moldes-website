import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
  const storage = { removeByUrl: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.removeByUrl.mockResolvedValue(undefined);

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

  describe('create', () => {
    it('salva o produto', async () => {
      await expect(
        service.create({ name: 'Ovo liso', slug: 'ovo-liso' }),
      ).resolves.toEqual({ id: 'prod-1', name: 'Ovo liso', slug: 'ovo-liso' });
    });

    it('recusa período que termina antes de começar', async () => {
      await expect(
        service.create({
          name: 'Ovo',
          slug: 'ovo',
          active_from: '2026-12-10T00:00:00Z',
          active_until: '2026-12-01T00:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(products.save).not.toHaveBeenCalled();
    });

    it('endereço repetido vira 409 com mensagem clara', async () => {
      products.save.mockRejectedValueOnce({ driverError: { code: '23505' } });

      await expect(
        service.create({ name: 'Ovo', slug: 'ovo' }),
      ).rejects.toThrow(ConflictException);
    });

    it('categoria que não existe vira 400', async () => {
      products.save.mockRejectedValueOnce({ code: '23503' });

      await expect(
        service.create({
          name: 'Ovo',
          slug: 'ovo',
          collection_id: '0b67499e-8c2c-4b37-a329-4f31329b8e2a',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('grava só o que foi enviado e devolve o produto atualizado', async () => {
      products.findOne.mockResolvedValue({ id: 'prod-1', name: 'Ovo liso' });

      await expect(
        service.update('prod-1', { name: 'Ovo liso' }),
      ).resolves.toEqual({ id: 'prod-1', name: 'Ovo liso' });
      expect(products.update).toHaveBeenCalledWith('prod-1', {
        name: 'Ovo liso',
      });
    });

    it('responde 404 para produto inexistente', async () => {
      products.findOne.mockResolvedValue(null);

      await expect(service.update('prod-x', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(products.update).not.toHaveBeenCalled();
    });

    it('compara a nova data de fim com o início já gravado', async () => {
      products.findOne.mockResolvedValue({
        id: 'prod-1',
        active_from: new Date('2026-12-10T00:00:00Z'),
      });

      await expect(
        service.update('prod-1', { active_until: '2026-12-01T00:00:00Z' }),
      ).rejects.toThrow(BadRequestException);
      expect(products.update).not.toHaveBeenCalled();
    });
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
      expect(storage.removeByUrl).toHaveBeenCalledWith('/uploads/foto.png');
    });

    it('não toca no armazenamento quando a foto não existe', async () => {
      images.findOne.mockResolvedValue(null);

      await service.removeImage('nao-existe');

      expect(storage.removeByUrl).not.toHaveBeenCalled();
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
    expect(storage.removeByUrl.mock.calls).toEqual([
      ['/uploads/a.png'],
      ['/uploads/b.jpg'],
    ]);
  });
});
