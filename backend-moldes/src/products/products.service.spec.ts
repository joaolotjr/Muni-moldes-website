import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Collection } from '../collections/entities/collection.entity';
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
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((product) => Promise.resolve({ id: 'prod-1', ...product })),
    merge: jest.fn((target, source) => Object.assign(target, source)),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };
  const collections = { count: jest.fn() };
  const NATAL = '0b67499e-8c2c-4b37-a329-4f31329b8e21';
  const PIRULITOS = '0b67499e-8c2c-4b37-a329-4f31329b8e22';
  /** Categorias passadas ao save, em ordem. */
  const savedCollections = () =>
    (products.save.mock.calls[0][0].collections as { id: string }[]).map(
      (c) => c.id,
    );
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
    // Por padrão, toda categoria informada existe.
    collections.count.mockImplementation(({ where }) =>
      Promise.resolve(where.id.value.length),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: products },
        { provide: getRepositoryToken(ProductImage), useValue: images },
        { provide: getRepositoryToken(Collection), useValue: collections },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('na inicialização copia a categoria principal para a lista de categorias', async () => {
    await service.onApplicationBootstrap();

    expect(products.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT DO NOTHING'),
    );
  });

  describe('create', () => {
    beforeEach(() => {
      products.findOne.mockResolvedValue({ id: 'prod-1', name: 'Ovo liso' });
    });

    it('salva o produto e devolve o registro completo', async () => {
      await expect(
        service.create({ name: 'Ovo liso', slug: 'ovo-liso' }),
      ).resolves.toEqual({ id: 'prod-1', name: 'Ovo liso' });
      expect(products.save.mock.calls[0][0]).toMatchObject({
        name: 'Ovo liso',
        collection_id: null,
        collections: [],
      });
      expect(products.save.mock.calls[0][0]).not.toHaveProperty(
        'collection_ids',
      );
    });

    it('a principal entra na lista de categorias', async () => {
      await service.create({
        name: 'Pirulito',
        slug: 'pirulito',
        collection_id: NATAL,
        collection_ids: [PIRULITOS],
      });

      expect(products.save.mock.calls[0][0].collection_id).toBe(NATAL);
      expect(savedCollections()).toEqual([NATAL, PIRULITOS]);
    });

    it('sem principal informada, a primeira da lista vira a principal', async () => {
      await service.create({
        name: 'Pirulito',
        slug: 'pirulito',
        collection_ids: [PIRULITOS, NATAL],
      });

      expect(products.save.mock.calls[0][0].collection_id).toBe(PIRULITOS);
      expect(savedCollections()).toEqual([PIRULITOS, NATAL]);
    });

    it('recusa mais de 5 categorias contando a principal', async () => {
      const ids = ['a', 'b', 'c', 'd', 'e'].map((n) => NATAL.slice(0, -1) + n);

      await expect(
        service.create({
          name: 'X',
          slug: 'x',
          collection_id: PIRULITOS,
          collection_ids: ids,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(products.save).not.toHaveBeenCalled();
    });

    it('recusa categoria que não existe', async () => {
      collections.count.mockResolvedValue(1);

      await expect(
        service.create({
          name: 'X',
          slug: 'x',
          collection_ids: [NATAL, PIRULITOS],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(products.save).not.toHaveBeenCalled();
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

    it('endereço repetido vira 409 com mensagem do endereço', async () => {
      products.save.mockRejectedValueOnce({
        driverError: {
          code: '23505',
          detail: 'Key (slug)=(ovo) already exists.',
        },
      });

      await expect(
        service.create({ name: 'Ovo', slug: 'ovo' }),
      ).rejects.toThrow('Este endereço (URL) já é usado');
    });

    it('código repetido vira 409 com mensagem do código', async () => {
      products.save.mockRejectedValueOnce({
        code: '23505',
        detail: 'Key (code)=(MM-1) already exists.',
      });

      await expect(
        service.create({ name: 'Ovo', slug: 'ovo', code: 'MM-1' }),
      ).rejects.toThrow('Este código já é usado por outro produto');
    });
  });

  describe('update', () => {
    const stored = (overrides: object = {}) => ({
      id: 'prod-1',
      name: 'Pirulito',
      collection_id: NATAL,
      collection: { id: NATAL },
      collections: [{ id: NATAL }, { id: PIRULITOS }],
      ...overrides,
    });

    it('alterar só outro campo não mexe nas categorias', async () => {
      products.findOne.mockResolvedValue(stored());

      await service.update('prod-1', { material: 'Silicone' });

      const saved = products.save.mock.calls[0][0];
      expect(saved.material).toBe('Silicone');
      expect(saved.collection_id).toBe(NATAL);
      expect(savedCollections()).toEqual([NATAL, PIRULITOS]);
      // A relação carregada sai, para não sobrepor a principal escolhida.
      expect(saved).not.toHaveProperty('collection');
    });

    it('trocar a principal mantém as demais categorias', async () => {
      products.findOne.mockResolvedValue(stored());

      await service.update('prod-1', { collection_id: PIRULITOS });

      expect(products.save.mock.calls[0][0].collection_id).toBe(PIRULITOS);
      expect(savedCollections()).toEqual([NATAL, PIRULITOS]);
    });

    it('lista nova sem a principal antiga: a primeira da lista assume', async () => {
      products.findOne.mockResolvedValue(stored());

      await service.update('prod-1', { collection_ids: [PIRULITOS] });

      expect(products.save.mock.calls[0][0].collection_id).toBe(PIRULITOS);
      expect(savedCollections()).toEqual([PIRULITOS]);
    });

    it('lista vazia e principal nula tiram todas as categorias', async () => {
      products.findOne.mockResolvedValue(stored());

      await service.update('prod-1', {
        collection_id: null,
        collection_ids: [],
      });

      expect(products.save.mock.calls[0][0].collection_id).toBeNull();
      expect(savedCollections()).toEqual([]);
    });

    it('responde 404 para produto inexistente', async () => {
      products.findOne.mockResolvedValue(null);

      await expect(service.update('prod-x', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(products.save).not.toHaveBeenCalled();
    });

    it('compara a nova data de fim com o início já gravado', async () => {
      products.findOne.mockResolvedValue(
        stored({ active_from: new Date('2026-12-10T00:00:00Z') }),
      );

      await expect(
        service.update('prod-1', { active_until: '2026-12-01T00:00:00Z' }),
      ).rejects.toThrow(BadRequestException);
      expect(products.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('no admin lista tudo, sem filtros', async () => {
      queryBuilder.getMany.mockResolvedValue([{ id: 'prod-1' }]);

      await expect(service.findAll()).resolves.toEqual([{ id: 'prod-1' }]);
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('filtra pela categoria considerando todas as do produto', async () => {
      await service.findAll('pascoa');

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(1);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('product_collections'),
        { slug: 'pascoa' },
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'product.collections',
        'collections',
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
        relations: { images: true, collection: true, collections: true },
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
