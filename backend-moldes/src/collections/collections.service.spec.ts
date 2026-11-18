import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { Collection } from './entities/collection.entity';
import { StorageService } from '../storage/storage.service';

describe('CollectionsService', () => {
  let service: CollectionsService;
  const queryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getRawOne: jest.fn(),
  };
  const manager = { update: jest.fn() };
  const storage = { removeByUrl: jest.fn() };
  const repository = {
    create: jest.fn((data) => data),
    save: jest.fn((collection) =>
      Promise.resolve({ id: 'col-1', ...collection }),
    ),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
    manager: {
      transaction: jest.fn((work: (m: typeof manager) => Promise<void>) =>
        work(manager),
      ),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        { provide: getRepositoryToken(Collection), useValue: repository },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get(CollectionsService);
  });

  it('create salva a coleção no fim da ordem', async () => {
    queryBuilder.getRawOne.mockResolvedValue({ max: 4 });

    await expect(
      service.create({ name: 'Páscoa', slug: 'pascoa' }),
    ).resolves.toEqual({
      id: 'col-1',
      name: 'Páscoa',
      slug: 'pascoa',
      sort_order: 5,
    });
  });

  it('a primeira categoria fica na posição 0', async () => {
    queryBuilder.getRawOne.mockResolvedValue({ max: null });

    await service.create({ name: 'Páscoa', slug: 'pascoa' });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ sort_order: 0 }),
    );
  });

  describe('reorder', () => {
    beforeEach(() => {
      repository.find.mockResolvedValue([
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
      ]);
      queryBuilder.getMany.mockResolvedValue([]);
    });

    it('grava a posição de cada categoria na ordem recebida', async () => {
      await service.reorder(['c', 'a', 'b']);

      expect(manager.update.mock.calls).toEqual([
        [Collection, { id: 'c' }, { sort_order: 0 }],
        [Collection, { id: 'a' }, { sort_order: 1 }],
        [Collection, { id: 'b' }, { sort_order: 2 }],
      ]);
    });

    it.each([[['a', 'b']], [['a', 'b', 'x']], [['a', 'b', 'c', 'd']]])(
      'recusa lista que não tem exatamente todas as categorias: %j',
      async (ids) => {
        await expect(service.reorder(ids)).rejects.toThrow(BadRequestException);
        expect(manager.update).not.toHaveBeenCalled();
      },
    );
  });

  describe('findAll', () => {
    it('no admin lista tudo, sem filtros', async () => {
      queryBuilder.getMany.mockResolvedValue([{ id: 'col-1' }]);

      await expect(service.findAll()).resolves.toEqual([{ id: 'col-1' }]);
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('no site filtra por ativa e pelo período de exibição', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'collection.is_active = :isActive',
        { isActive: true },
      );
    });
  });

  describe('findOne', () => {
    it('devolve a coleção', async () => {
      repository.findOne.mockResolvedValue({ id: 'col-1' });

      await expect(service.findOne('col-1')).resolves.toEqual({ id: 'col-1' });
    });

    it('responde 404 quando não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nao-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('update grava e devolve a coleção atualizada', async () => {
    repository.findOne.mockResolvedValue({ id: 'col-1', name: 'Natal' });

    await expect(service.update('col-1', { name: 'Natal' })).resolves.toEqual({
      id: 'col-1',
      name: 'Natal',
    });
    expect(repository.update).toHaveBeenCalledWith('col-1', { name: 'Natal' });
  });

  describe('capa', () => {
    it('troca a capa e apaga a anterior do armazenamento', async () => {
      repository.findOne.mockResolvedValue({
        id: 'col-1',
        cover_url: '/uploads/velha.webp',
      });

      const saved = await service.setCover('col-1', '/uploads/nova.webp');

      expect(saved.cover_url).toBe('/uploads/nova.webp');
      expect(storage.removeByUrl).toHaveBeenCalledWith('/uploads/velha.webp');
    });

    it('remover a capa limpa o campo e apaga o arquivo', async () => {
      repository.findOne.mockResolvedValue({
        id: 'col-1',
        cover_url: '/uploads/velha.webp',
      });

      const saved = await service.removeCover('col-1');

      expect(saved.cover_url).toBeNull();
      expect(storage.removeByUrl).toHaveBeenCalledWith('/uploads/velha.webp');
    });
  });

  describe('remove', () => {
    it('apaga a coleção vazia e a foto de capa', async () => {
      const collection = {
        id: 'col-1',
        products: [],
        cover_url: '/uploads/capa.webp',
      };
      repository.findOne.mockResolvedValue(collection);

      await service.remove('col-1');

      expect(repository.remove).toHaveBeenCalledWith(collection);
      expect(storage.removeByUrl).toHaveBeenCalledWith('/uploads/capa.webp');
    });

    it('recusa apagar coleção com produtos', async () => {
      repository.findOne.mockResolvedValue({
        id: 'col-1',
        products: [{ id: 'prod-1' }],
      });

      await expect(service.remove('col-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('responde 404 quando não existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nao-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
