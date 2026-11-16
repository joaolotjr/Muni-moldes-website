import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { Collection } from './entities/collection.entity';

describe('CollectionsService', () => {
  let service: CollectionsService;
  const queryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };
  const repository = {
    create: jest.fn((data) => data),
    save: jest.fn((collection) =>
      Promise.resolve({ id: 'col-1', ...collection }),
    ),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        { provide: getRepositoryToken(Collection), useValue: repository },
      ],
    }).compile();

    service = module.get(CollectionsService);
  });

  it('create salva a coleção', async () => {
    await expect(
      service.create({ name: 'Páscoa', slug: 'pascoa' }),
    ).resolves.toEqual({
      id: 'col-1',
      name: 'Páscoa',
      slug: 'pascoa',
    });
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

  describe('remove', () => {
    it('apaga a coleção vazia', async () => {
      const collection = { id: 'col-1', products: [] };
      repository.findOne.mockResolvedValue(collection);

      await service.remove('col-1');

      expect(repository.remove).toHaveBeenCalledWith(collection);
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
